'use client';
import { Form, PasswordField, SubmitButton, TextField } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

// A narrow sign-in form ends in one button as wide as its fields, the only action of the screen.
export const HangarSignIn = (): ReactElement => {
	return (
		<Form
			successMessage='Signed in to the hangar.'
			aria-label='Sign in to the hangar'
			style={{ width: '100%', maxWidth: '20rem' }}
		>
			<TextField label='Callsign' name='callsign' autoComplete='username' required />
			<PasswordField label='Password' name='password' autoComplete='current-password' required />
			<SubmitButton fullWidth>Sign in</SubmitButton>
		</Form>
	);
};
