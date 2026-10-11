// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Combobox } from '#src/forms/combobox/index.tsx';
import type { ComboboxOption } from '#src/forms/combobox/index.tsx';
import { expectNoAxeViolations } from '#test/component-harness.ts';

const cities: readonly ComboboxOption[] = [
	{ value: 'rec', label: 'Recife' },
	{ value: 'rio', label: 'Rio de Janeiro' },
	{ value: 'sao', label: 'São Paulo' },
	{ value: 'sal', label: 'Salvador', disabled: true },
];

afterEach((): void => {
	cleanup();
});

describe('Combobox', (): void => {
	it('filters as the user types and chooses with the arrow keys and Enter', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		const { container } = render(
			<form>
				<Combobox label='City' name='city' options={cities} onValueChange={handleValue} />
			</form>,
		);

		const input: HTMLElement = screen.getByRole('combobox', { name: 'City' });
		await user.type(input, 'r');

		const listbox: HTMLElement = screen.getByRole('listbox', { name: 'City' });

		expect(
			screen.getAllByRole('option').map((option: HTMLElement): string => option.textContent),
		).toEqual(['Recife', 'Rio de Janeiro', 'Salvador']);

		expect(input.getAttribute('aria-controls')).toBe(listbox.id);

		await user.keyboard('{ArrowDown}{ArrowDown}');

		expect(input.getAttribute('aria-activedescendant')).toBe(
			screen.getByRole('option', { name: 'Rio de Janeiro' }).id,
		);

		expect(document.activeElement).toBe(input);
		await expectNoAxeViolations(container);

		await user.keyboard('{Enter}');

		expect(handleValue).toHaveBeenCalledWith(
			'rio',
			expect.objectContaining({ label: 'Rio de Janeiro' }),
		);

		expect(input).toHaveProperty('value', 'Rio de Janeiro');

		const form: HTMLFormElement | null = container.querySelector('form');
		expect(new FormData(form ?? undefined).get('city')).toBe('rio');
	});

	it('marks the chosen option with a check and closes with Escape', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<Combobox label='City' options={cities} defaultValue='rec' />);
		const input: HTMLElement = screen.getByRole('combobox', { name: 'City' });

		await user.click(input);
		await user.keyboard('{ArrowDown}');

		const chosen: HTMLElement = screen.getByRole('option', { name: 'Recife', selected: true });
		expect(chosen.querySelector('svg')).not.toBeNull();

		await user.keyboard('{Escape}');
		expect(screen.queryByRole('listbox')).toBeNull();
	});

	it('announces the empty and loading states once, in a status', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const { rerender } = render(
			<Combobox label='City' options={cities} labels={{ noOptions: 'Nenhuma cidade' }} />,
		);

		await user.type(screen.getByRole('combobox', { name: 'City' }), 'zzz');
		expect(screen.getByRole('status').textContent).toBe('Nenhuma cidade');

		rerender(<Combobox label='City' options={[]} loading filter='none' />);
		expect(screen.getByRole('status').textContent).toBe('Loading options');
		expect(screen.getByRole('combobox', { name: 'City' }).getAttribute('aria-busy')).toBe('true');
	});

	it('clears the choice with its button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		render(
			<Combobox label='City' options={cities} defaultValue='sao' onValueChange={handleValue} />,
		);

		await user.click(screen.getByRole('button', { name: 'Clear' }));
		expect(handleValue).toHaveBeenCalledWith(null, null);
	});
});
