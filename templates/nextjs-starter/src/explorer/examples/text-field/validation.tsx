'use client';
import { TextField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ChangeEvent, FocusEvent, ReactElement } from 'react';

const errorOf = (input: HTMLInputElement): string | undefined => {
	if (input.validity.valueMissing) return 'Enter the email of the pilot.';
	return input.validity.typeMismatch ? 'Enter an email such as spike@bebop.space.' : undefined;
};

// The error shows once the reader leaves the field, not while they type, and goes away as soon as the value is valid.
export const PilotContact = (): ReactElement => {
	const [error, setError] = useState<string | undefined>(undefined);

	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '24rem' }}>
			<TextField
				label='Email'
				type='email'
				autoComplete='email'
				required
				description='The ISSP sends the bounty confirmations here.'
				error={error}
				onBlur={(event: FocusEvent<HTMLInputElement>): void => {
					setError(errorOf(event.currentTarget));
				}}
				onChange={(event: ChangeEvent<HTMLInputElement>): void => {
					if (error !== undefined) setError(errorOf(event.currentTarget));
				}}
			/>

			<TextField label='Phone' type='tel' autoComplete='tel' description='Optional.' />
		</Stack>
	);
};
