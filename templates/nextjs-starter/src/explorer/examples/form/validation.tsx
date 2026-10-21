'use client';
import {
	Form,
	FormActions,
	PasswordField,
	SubmitButton,
	TextField,
} from '@midnight-indigo/ui/forms';
import type { FormErrors } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

const takenCallsigns: readonly string[] = ['swordfish', 'red tail', 'hammerhead'];

const wait = async (milliseconds: number): Promise<void> => {
	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, milliseconds);
	});
};

// Stands in for a request to the server: whether the callsign is free is only known there.
const validateHunter = async (data: FormData): Promise<FormErrors> => {
	await wait(400);
	const callsign: FormDataEntryValue | null = data.get('callsign');
	const confirmation: FormDataEntryValue | null = data.get('confirmation');

	const taken: boolean =
		typeof callsign === 'string' && takenCallsigns.includes(callsign.trim().toLowerCase());

	return {
		callsign: taken ? 'That callsign is taken.' : undefined,
		confirmation:
			confirmation !== '' && confirmation !== data.get('password')
				? 'The passwords do not match.'
				: undefined,
	};
};

// The native constraints, then the check of the server: the summary lists every problem and takes focus once per
// submission, and leaving a field after that updates its message.
export const HunterSignUp = (): ReactElement => {
	return (
		<Form
			validate={validateHunter}
			successMessage='Welcome to the ISSP, hunter.'
			onSubmit={async (): Promise<void> => {
				await wait(800);
			}}
			style={{ width: '100%', maxWidth: '28rem' }}
		>
			<TextField
				label='Callsign'
				name='callsign'
				required
				minLength={3}
				description='Try Swordfish: it is taken.'
			/>

			<PasswordField
				label='Password'
				name='password'
				autoComplete='new-password'
				required
				minLength={8}
			/>

			<PasswordField
				label='Confirm the password'
				name='confirmation'
				autoComplete='new-password'
				required
			/>

			<FormActions>
				<SubmitButton>Sign up</SubmitButton>
			</FormActions>
		</Form>
	);
};
