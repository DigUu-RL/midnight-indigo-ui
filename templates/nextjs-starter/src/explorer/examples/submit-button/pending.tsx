'use client';
import { Form, FormActions, SubmitButton, TextArea } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

const wait = async (milliseconds: number): Promise<void> => {
	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, milliseconds);
	});
};

// While `onSubmit` waits, the button is `loading` by itself: it keeps focus and ignores clicks, so the report is sent
// once.
export const BountyReport = (): ReactElement => {
	return (
		<Form
			successMessage='Report sent to the ISSP.'
			onSubmit={async (): Promise<void> => {
				await wait(1500);
			}}
			style={{ width: '100%', maxWidth: '28rem' }}
		>
			<TextArea
				label='Report'
				name='report'
				required
				defaultValue='Asimov Solensan delivered to the police of Mars.'
			/>

			<FormActions>
				<SubmitButton>Send the report</SubmitButton>
			</FormActions>
		</Form>
	);
};
