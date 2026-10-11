// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import type { ChoiceOption } from '#src/forms/choice-control/index.tsx';
import { CheckboxGroup } from '#src/forms/checkbox-group/index.tsx';

const channels: readonly ChoiceOption[] = [
	{ value: 'email', label: 'Email' },
	{ value: 'sms', label: 'SMS', description: 'Carrier rates apply.' },
	{ value: 'push', label: 'Push', disabled: true },
];

afterEach((): void => {
	cleanup();
});

describe('CheckboxGroup', (): void => {
	it('is a group named by its legend, with the error on the group', async (): Promise<void> => {
		const { container } = render(
			<CheckboxGroup legend='Channels' options={channels} error='Choose at least one channel.' />,
		);

		const group: HTMLElement = screen.getByRole('group', { name: 'Channels' });
		const error: HTMLElement = screen.getByText('Choose at least one channel.');

		expect(group.getAttribute('aria-describedby')).toContain(error.parentElement?.id);

		expect(
			screen
				.getAllByRole('checkbox')
				.every((box: HTMLElement): boolean => box.getAttribute('aria-invalid') === 'true'),
		).toBe(true);

		expect(screen.queryAllByText('Choose at least one channel.')).toHaveLength(1);
		await expectNoAxeViolations(container);
	});

	it('reports the checked values in the order of the options', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		const { container } = render(
			<form>
				<CheckboxGroup
					legend='Channels'
					name='channels'
					options={channels}
					onValueChange={handleValue}
				/>
			</form>,
		);

		await user.click(screen.getByRole('checkbox', { name: 'SMS' }));
		await user.click(screen.getByRole('checkbox', { name: 'Email' }));

		expect(handleValue).toHaveBeenLastCalledWith(['email', 'sms']);
		const form: HTMLFormElement | null = container.querySelector('form');
		expect(new FormData(form ?? undefined).getAll('channels')).toEqual(['email', 'sms']);
		expect(screen.getByRole('checkbox', { name: 'Push' }).hasAttribute('disabled')).toBe(true);
	});

	it('is controlled by value', (): void => {
		render(
			<CheckboxGroup
				legend='Channels'
				options={channels}
				value={['push']}
				onValueChange={vi.fn()}
			/>,
		);

		expect(screen.getByRole('checkbox', { name: 'Push' })).toHaveProperty('checked', true);
	});
});
