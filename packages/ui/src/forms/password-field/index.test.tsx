// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { PasswordField } from '#src/forms/password-field/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('PasswordField', (): void => {
	it('shows and hides the characters with a pressed toggle, keeping the value', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const { container } = render(<PasswordField label='Password' />);
		const input: HTMLInputElement = screen.getByLabelText('Password', { selector: 'input' });

		expect(input.type).toBe('password');
		expect(input.getAttribute('autocomplete')).toBe('current-password');
		await user.type(input, 's3cret');

		const toggle: HTMLElement = screen.getByRole('button', {
			name: 'Show password',
			pressed: false,
		});

		await user.click(toggle);

		expect(input.type).toBe('text');
		expect(input.value).toBe('s3cret');
		expect(toggle.getAttribute('aria-pressed')).toBe('true');
		await expectNoAxeViolations(container);
	});

	it('translates the toggle name', (): void => {
		render(<PasswordField label='Senha' labels={{ showPassword: 'Mostrar senha' }} />);
		expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeDefined();
	});
});
