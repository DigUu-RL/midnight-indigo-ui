// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { Switch } from '@/src/forms/switch/index';

afterEach((): void => {
	cleanup();
});

describe('Switch', (): void => {
	it('is a switch with a label and a description of its effect', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const { container } = render(
			<Switch
				label='Ativar notificação por email'
				description='Habilita as notificações por email dentro do sistema'
			/>,
		);

		const toggle: HTMLInputElement = screen.getByRole('switch', {
			name: 'Ativar notificação por email',
		});

		expect(toggle.getAttribute('aria-describedby')).not.toBeNull();

		await user.tab();
		await user.keyboard(' ');
		expect(toggle.checked).toBe(true);
		await expectNoAxeViolations(container);
	});

	it('works without a description, and without a visible label when aria-label names it', (): void => {
		render(
			<>
				<Switch label='Dark sidebar' />
				<Switch aria-label='Compact rows' />
			</>,
		);

		expect(
			screen.getByRole('switch', { name: 'Dark sidebar' }).hasAttribute('aria-describedby'),
		).toBe(false);

		expect(screen.getByRole('switch', { name: 'Compact rows' })).toBeDefined();
	});

	it('moves its thumb when on, so the state does not rest on color (regression)', (): void => {
		render(<Switch label='State' data-testid='switch' />);
		const rules: string[] = styleRulesOf(screen.getByTestId('switch'));

		expect(
			rules.some(
				(rule: string): boolean => rule.includes(':checked::before') && rule.includes('translateX'),
			),
		).toBe(true);

		expect(rules).toMatchSnapshot();
	});
});
