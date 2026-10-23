// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CheckboxGroup } from '@/src/forms/checkbox-group/index';
import type { FormErrors } from '@/src/forms/form-context';
import { Form } from '@/src/forms/form/index';
import { FormActions } from '@/src/forms/form-actions/index';
import { SubmitButton } from '@/src/forms/submit-button/index';
import { TextField } from '@/src/forms/text-field/index';
import { expectNoAxeViolations } from '@/test/component-harness';

afterEach((): void => {
	cleanup();
});

const validateEmail = (data: FormData): FormErrors => {
	const email: FormDataEntryValue | null = data.get('email');
	return {
		email:
			typeof email === 'string' && email.includes('@')
				? undefined
				: 'Enter an email address with an @.',
	};
};

describe('Form', (): void => {
	it('turns native constraints into messages, shows a summary and focuses it once', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleSubmit = vi.fn();

		const { container } = render(
			<Form onSubmit={handleSubmit} validate={validateEmail}>
				<TextField label='Name' name='name' required />
				<TextField label='Email' name='email' />

				<FormActions>
					<SubmitButton>Save</SubmitButton>
				</FormActions>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));

		const summary: HTMLElement = await screen.findByRole('region', {
			name: 'There are 2 problems with this form',
		});

		expect(document.activeElement).toBe(summary);
		expect(handleSubmit).not.toHaveBeenCalled();

		const name: HTMLElement = screen.getByRole('textbox', { name: 'Name' });
		expect(name.getAttribute('aria-invalid')).toBe('true');
		expect(screen.getAllByText('Fill in this field.')).toHaveLength(2);
		await expectNoAxeViolations(container);

		await user.click(screen.getByRole('link', { name: 'Enter an email address with an @.' }));
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Email' }));
	});

	it('revalidates on blur after a failed submission without moving focus', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<Form validate={validateEmail}>
				<TextField label='Email' name='email' />
				<TextField label='Other' name='other' />
				<SubmitButton>Save</SubmitButton>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));
		await screen.findByRole('region');
		const email: HTMLElement = screen.getByRole('textbox', { name: 'Email' });

		await user.click(email);
		await user.type(email, 'ana@example.com');
		expect(email.getAttribute('aria-invalid')).toBe('true');
		await user.tab();

		await waitFor((): void => {
			expect(email.hasAttribute('aria-invalid')).toBe(false);
		});

		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Other' }));
		expect(screen.queryByRole('region')).toBeNull();
	});

	it('revalidates after the click when a pointer press moves focus, so the layout holds under the pointer', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<Form validate={validateEmail}>
				<TextField label='Email' name='email' />
				<TextField label='Other' name='other' />
				<SubmitButton>Save</SubmitButton>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));
		await screen.findByRole('region');
		const email: HTMLElement = screen.getByRole('textbox', { name: 'Email' });
		const other: HTMLElement = screen.getByRole('textbox', { name: 'Other' });
		await user.type(email, 'ana@example.com');

		// Pressing on another field blurs the email field; the summary must not shrink before the release.
		await user.pointer({ keys: '[MouseLeft>]', target: other });

		await new Promise<void>((resolve: () => void): void => {
			setTimeout(resolve, 20);
		});

		expect(screen.getByRole('region')).toBeDefined();
		expect(email.getAttribute('aria-invalid')).toBe('true');

		await user.pointer({ keys: '[/MouseLeft]', target: other });

		await waitFor((): void => {
			expect(email.hasAttribute('aria-invalid')).toBe(false);
		});

		expect(document.activeElement).toBe(other);
		expect(screen.queryByRole('region')).toBeNull();
	});

	it('cancels the revalidation that waits for the release when the form unmounts', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const validate = vi.fn(validateEmail);

		const { unmount } = render(
			<Form validate={validate}>
				<TextField label='Email' name='email' />
				<TextField label='Other' name='other' />
				<SubmitButton>Save</SubmitButton>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));
		await screen.findByRole('region');
		const other: HTMLElement = screen.getByRole('textbox', { name: 'Other' });
		await user.click(screen.getByRole('textbox', { name: 'Email' }));
		await user.pointer({ keys: '[MouseLeft>]', target: other });
		const calls: number = validate.mock.calls.length;
		unmount();
		await user.pointer({ keys: '[/MouseLeft]', target: document.body });

		await new Promise<void>((resolve: () => void): void => {
			setTimeout(resolve, 20);
		});

		expect(validate).toHaveBeenCalledTimes(calls);
	});

	it('waits for async validation and submission, keeping the button busy', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		let finish: () => void = (): void => undefined;

		const handleSubmit = vi.fn((): Promise<void> => {
			return new Promise<void>((resolve: () => void): void => {
				finish = resolve;
			});
		});

		const validate = async (): Promise<FormErrors> => {
			await Promise.resolve();
			return {};
		};

		render(
			<Form onSubmit={handleSubmit} validate={validate} successMessage='Profile saved.'>
				<TextField label='Email' name='email' defaultValue='ana@example.com' />
				<SubmitButton>Save</SubmitButton>
			</Form>,
		);

		const button: HTMLElement = screen.getByRole('button', { name: 'Save' });
		await user.click(button);

		await waitFor((): void => {
			expect(handleSubmit).toHaveBeenCalledTimes(1);
		});

		expect(button.getAttribute('aria-busy')).toBe('true');
		await user.click(button);
		expect(handleSubmit).toHaveBeenCalledTimes(1);

		expect((handleSubmit.mock.calls[0] as unknown as [FormData])[0].get('email')).toBe(
			'ana@example.com',
		);

		finish();
		expect(await screen.findByText('Profile saved.')).toBeDefined();

		expect(
			screen
				.getAllByRole('status')
				.some((status: HTMLElement): boolean => status.textContent === 'Profile saved.'),
		).toBe(true);

		expect(button.hasAttribute('aria-busy')).toBe(false);
	});

	it('announces a failed submission as an alert', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<Form
				onSubmit={(): Promise<void> => Promise.reject(new Error('Network'))}
				labels={{ submissionError: 'Não foi possível enviar.' }}
			>
				<SubmitButton>Send</SubmitButton>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Send' }));
		expect((await screen.findByRole('alert')).textContent).toBe('Não foi possível enviar.');
	});

	it('shows server errors on the fields and in the summary, also for groups', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<Form
				errors={{ channels: 'Choose a channel.' }}
				labels={{ title: (count: number): string => `${String(count)} erro(s)` }}
			>
				<CheckboxGroup
					legend='Channels'
					name='channels'
					options={[{ value: 'email', label: 'Email' }]}
				/>

				<SubmitButton>Save</SubmitButton>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));
		expect(await screen.findByRole('region', { name: '1 erro(s)' })).toBeDefined();

		expect(screen.getByRole('checkbox', { name: 'Email' }).getAttribute('aria-invalid')).toBe(
			'true',
		);
	});

	it('focuses the first invalid field when the summary is off', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<Form errorSummary={false}>
				<TextField label='First' name='first' />
				<TextField label='Second' name='second' required />
				<SubmitButton>Save</SubmitButton>
			</Form>,
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor((): void => {
			expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Second' }));
		});
	});
});
