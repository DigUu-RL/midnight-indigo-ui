'use client';
import { Form, FormActions, SubmitButton, TextField } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

// A form of one field has nothing to summarize: focus goes straight to the invalid field, and its message is checked
// again only on the next submission.
export const CrewInvite = (): ReactElement => {
	return (
		<Form
			errorSummary={false}
			revalidateOn='submit'
			successMessage='Invitation sent to the Bebop.'
			aria-label='Invite to the crew'
			style={{ width: '100%', maxWidth: '24rem' }}
		>
			<TextField
				label='Email of the new member'
				name='email'
				type='email'
				autoComplete='email'
				required
			/>

			<FormActions>
				<SubmitButton>Invite</SubmitButton>
			</FormActions>
		</Form>
	);
};
