// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Checkbox } from '#src/forms/checkbox/index.tsx';
import { ErrorSummary } from '#src/forms/error-summary/index.tsx';
import {
	toErrorSummaryItems,
	useCheckedController,
	useFieldController,
} from '#src/forms/react-hook-form/field-controller.ts';
import { Select } from '#src/forms/select/index.tsx';
import { TextField } from '#src/forms/text-field/index.tsx';

interface Profile {
	email: string;
	role: string;
	terms: boolean;
	address: { city: string };
}

interface Order {
	email: string;
	items: { name: string }[];
	silent: string;
}

const defaultValues: Profile = { email: '', role: '', terms: false, address: { city: '' } };

const ProfileForm = ({
	onValid,
	summary,
}: {
	onValid: (values: Profile) => void;
	summary: boolean;
}): ReactElement => {
	const form: UseFormReturn<Profile> = useForm<Profile>({
		defaultValues,
		shouldFocusError: !summary,
	});

	const { control, handleSubmit, formState } = form;

	return (
		<form
			noValidate
			onSubmit={(event): void => {
				void handleSubmit(onValid)(event);
			}}
		>
			{summary ? (
				<ErrorSummary
					errors={toErrorSummaryItems(formState.errors)}
					focusKey={formState.submitCount}
				/>
			) : null}

			<TextField
				label='Email'
				{...useFieldController({
					control,
					name: 'email',
					rules: { required: 'Enter your email.' },
				})}
			/>

			<TextField
				label='City'
				{...useFieldController({
					control,
					name: 'address.city',
					rules: { required: 'Enter your city.' },
				})}
			/>

			<Select
				label='Role'
				placeholder='Choose'
				options={[{ value: 'admin', label: 'Admin' }]}
				{...useFieldController({ control, name: 'role' })}
			/>

			<Checkbox label='I accept the terms' {...useCheckedController({ control, name: 'terms' })} />
			<button type='submit'>Save</button>
		</form>
	);
};

afterEach((): void => {
	cleanup();
});

describe('React Hook Form adapter', (): void => {
	it('binds values and submits them', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValid = vi.fn();
		render(<ProfileForm onValid={handleValid} summary={false} />);

		await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@example.com');
		await user.type(screen.getByRole('textbox', { name: 'City' }), 'Recife');
		await user.selectOptions(screen.getByRole('combobox', { name: 'Role' }), 'admin');
		await user.click(screen.getByRole('checkbox', { name: 'I accept the terms' }));
		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(handleValid).toHaveBeenCalledWith(
			{ email: 'ana@example.com', role: 'admin', terms: true, address: { city: 'Recife' } },
			expect.anything(),
		);
	});

	it('shows rule errors on the fields and focuses the first one through the ref', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<ProfileForm onValid={vi.fn()} summary={false} />);

		await user.click(screen.getByRole('button', { name: 'Save' }));
		const email: HTMLElement = screen.getByRole('textbox', { name: 'Email' });

		expect(email.getAttribute('aria-invalid')).toBe('true');
		expect(screen.getByText('Enter your email.')).toBeDefined();
		expect(document.activeElement).toBe(email);
	});

	it('lists nested errors in the summary, which links to each field', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<ProfileForm onValid={vi.fn()} summary />);

		await user.click(screen.getByRole('button', { name: 'Save' }));

		const summary: HTMLElement = await screen.findByRole('region', {
			name: 'There are 2 problems with this form',
		});

		expect(document.activeElement).toBe(summary);
		await user.click(screen.getByRole('link', { name: 'Enter your city.' }));
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'City' }));
	});

	it('flattens nested errors in order', (): void => {
		const errors: FieldErrors<Order> = {
			email: { type: 'required', message: 'Email is required.' },
			items: [{ name: { type: 'required', message: 'Name the item.' } }] as NonNullable<
				FieldErrors<Order>['items']
			>,
			silent: { type: 'validate', message: '' },
		};

		expect(toErrorSummaryItems(errors)).toEqual([
			{ name: 'email', message: 'Email is required.' },
			{ name: 'items.0.name', message: 'Name the item.' },
		]);
	});
});
