'use client';
import { PasswordField } from '@midnight-indigo/ui/forms';
import { useState } from 'react';
import type { FocusEvent, ReactElement } from 'react';

const minimumLength: number = 12;

// A new password starts visible (`defaultVisible`), so a typo shows before it is saved; the rule is in the description,
// read with the field, and the error tells what is missing once the reader leaves it.
export const HunterRegistration = (): ReactElement => {
	const [error, setError] = useState<string | undefined>(undefined);

	return (
		<PasswordField
			label='New password'
			autoComplete='new-password'
			defaultVisible
			minLength={minimumLength}
			description={`At least ${String(minimumLength)} characters.`}
			error={error}
			onBlur={(event: FocusEvent<HTMLInputElement>): void => {
				const missing: number = minimumLength - event.currentTarget.value.length;

				setError(
					missing > 0
						? `Add ${String(missing)} more characters to reach ${String(minimumLength)}.`
						: undefined,
				);
			}}
			style={{ width: '100%', maxWidth: '24rem' }}
		/>
	);
};
