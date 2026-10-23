// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { Select } from '@/src/forms/select/index';
import type { SelectOption, SelectOptionGroup } from '@/src/forms/select/index';

const states: readonly (SelectOption | SelectOptionGroup)[] = [
	{
		label: 'Northeast',
		options: [
			{ value: 'PE', label: 'Pernambuco' },
			{ value: 'BA', label: 'Bahia' },
		],
	},
	{ value: 'SP', label: 'São Paulo' },
	{ value: 'XX', label: 'Unavailable', disabled: true },
];

afterEach((): void => {
	cleanup();
});

describe('Select', (): void => {
	it('lists a clear empty option first, then groups and options', async (): Promise<void> => {
		const { container } = render(
			<Select label='State' placeholder='Choose a state' options={states} />,
		);

		const select: HTMLSelectElement = screen.getByRole('combobox', { name: 'State' });

		expect([...select.options].map((option: HTMLOptionElement): string => option.value)).toEqual([
			'',
			'PE',
			'BA',
			'SP',
			'XX',
		]);

		expect(select.value).toBe('');
		expect(select.querySelector('optgroup')?.getAttribute('label')).toBe('Northeast');
		await expectNoAxeViolations(container);
	});

	it('chooses with the keyboard and reports the value', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();
		render(<Select label='State' options={states} onValueChange={handleValue} name='state' />);

		await user.selectOptions(screen.getByRole('combobox', { name: 'State' }), 'SP');
		expect(handleValue).toHaveBeenCalledWith('SP');
	});

	it('fails native validation on the empty option when required', (): void => {
		render(<Select label='State' placeholder='Choose' options={states} required />);
		const select: HTMLSelectElement = screen.getByRole('combobox', { name: 'State' });
		expect(select.validity.valueMissing).toBe(true);
	});
});
