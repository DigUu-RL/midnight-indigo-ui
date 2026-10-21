'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { PasswordField, TextField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

// `username` and `current-password` let a password manager fill both fields; the password can be pasted.
export const BebopSignIn = (): ReactElement => {
	const [username, setUsername] = useState<string>('');
	const [pilot, setPilot] = useState<string | null>(null);

	return (
		<form
			style={{ width: '100%', maxWidth: '24rem' }}
			onSubmit={(event: SubmitEvent<HTMLFormElement>): void => {
				event.preventDefault();
				setPilot(username.trim());
			}}
		>
			<Stack gap='4' align='start'>
				<TextField
					label='Username'
					name='username'
					autoComplete='username'
					required
					spellCheck={false}
					value={username}
					onValueChange={setUsername}
					style={{ alignSelf: 'stretch' }}
				/>

				<PasswordField label='Password' name='password' required style={{ alignSelf: 'stretch' }} />
				<Button type='submit'>Sign in</Button>
				{pilot === null ? null : <p style={{ margin: 0 }}>Welcome aboard, {pilot}.</p>}
			</Stack>
		</form>
	);
};
