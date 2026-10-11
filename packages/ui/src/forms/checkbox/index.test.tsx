// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Checkbox } from '#src/forms/checkbox/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('Checkbox', (): void => {
	it('has a bold label and a description of what it does', async (): Promise<void> => {
		const { container } = render(
			<Checkbox
				label='Enable email notifications'
				description='Sends a notification by email for each new report.'
			/>,
		);

		const checkbox: HTMLElement = screen.getByRole('checkbox', {
			name: 'Enable email notifications',
		});

		const description: HTMLElement = screen.getByText(
			'Sends a notification by email for each new report.',
		);

		expect(checkbox.getAttribute('aria-describedby')).toBe(description.id);

		expect(styleRulesOf(screen.getByText('Enable email notifications')).join('')).toContain(
			'font-weight',
		);

		await expectNoAxeViolations(container);
	});

	it('may have only a description, when aria-label names it', async (): Promise<void> => {
		const { container } = render(
			<Checkbox aria-label='Select row 3' description='Included in the export.' />,
		);

		const checkbox: HTMLElement = screen.getByRole('checkbox', { name: 'Select row 3' });
		expect(checkbox.getAttribute('aria-describedby')).not.toBeNull();
		await expectNoAxeViolations(container);
	});

	it('refuses to render without any name', (): void => {
		expect((): void => {
			render(<Checkbox description='Nameless' />);
		}).toThrow(/needs a label, aria-label or aria-labelledby/);
	});

	it('toggles with Space and with a click on its label', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleChecked = vi.fn();
		render(<Checkbox label='Accept the terms' onCheckedChange={handleChecked} />);

		await user.tab();
		await user.keyboard(' ');
		await user.click(screen.getByText('Accept the terms'));

		expect(handleChecked.mock.calls).toEqual([[true], [false]]);
	});

	it('shows an error with an icon and the indeterminate state', async (): Promise<void> => {
		const { container } = render(
			<Checkbox label='All' indeterminate error='Choose at least one.' />,
		);

		const checkbox: HTMLInputElement = screen.getByRole('checkbox', { name: 'All' });

		expect(checkbox.indeterminate).toBe(true);
		expect(checkbox.getAttribute('aria-invalid')).toBe('true');

		expect(
			screen.getByText('Choose at least one.').parentElement?.querySelector('svg'),
		).not.toBeNull();

		await expectNoAxeViolations(container);
	});

	it('keeps the same visual states (regression)', (): void => {
		render(<Checkbox label='State' data-testid='box' />);
		expect(styleRulesOf(screen.getByTestId('box'))).toMatchSnapshot();
	});
});
