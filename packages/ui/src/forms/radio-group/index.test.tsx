// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import type { ChoiceOption } from '#src/forms/choice-control/index.tsx';
import { RadioGroup } from '#src/forms/radio-group/index.tsx';

const plans: readonly ChoiceOption[] = [
	{ value: 'free', label: 'Free' },
	{ value: 'team', label: 'Team' },
	{ value: 'enterprise', label: 'Enterprise' },
];

afterEach((): void => {
	cleanup();
});

describe('RadioGroup', (): void => {
	it('is a radio group entered once with Tab and moved with the arrow keys', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		const { container } = render(
			<>
				<RadioGroup legend='Plan' options={plans} defaultValue='team' onValueChange={handleValue} />
				<button type='button'>After</button>
			</>,
		);

		expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeDefined();
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Team' }));

		await user.keyboard('{ArrowDown}');
		expect(screen.getByRole('radio', { name: 'Enterprise' })).toHaveProperty('checked', true);
		expect(handleValue).toHaveBeenLastCalledWith('enterprise');

		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
		await expectNoAxeViolations(container);
	});

	it('requires a choice natively and marks the group invalid', (): void => {
		render(<RadioGroup legend='Plan' options={plans} required error='Choose a plan.' />);
		const group: HTMLElement = screen.getByRole('radiogroup', { name: 'Plan' });

		expect(group.getAttribute('aria-invalid')).toBe('true');
		expect(group.getAttribute('aria-required')).toBe('true');

		expect(screen.getByRole('radio', { name: 'Free' })).toHaveProperty(
			'validity.valueMissing',
			true,
		);
	});

	it('marks the checked radio with a dot, not color alone (regression)', (): void => {
		render(<RadioGroup legend='Plan' options={plans} />);
		const rules: string[] = styleRulesOf(screen.getByRole('radio', { name: 'Free' }));

		expect(rules.some((rule: string): boolean => rule.startsWith('&:checked::before'))).toBe(true);
		expect(rules).toMatchSnapshot();
	});
});
