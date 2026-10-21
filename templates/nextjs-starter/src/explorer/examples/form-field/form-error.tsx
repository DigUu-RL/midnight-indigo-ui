'use client';
import { Form, FormActions, FormField, SubmitButton } from '@midnight-indigo/ui/forms';
import type { FormErrors, FormFieldControlProps } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

const launchDay: string = '2071-06-15';

const validateDeparture = (data: FormData): FormErrors => {
	const departure: FormDataEntryValue | null = data.get('departure');
	// Dates of an `<input type="date">` are `YYYY-MM-DD`, so comparing them as texts compares the days. An empty day is
	// left to the native `required`.
	const early: boolean = typeof departure === 'string' && departure !== '' && departure < launchDay;
	return { departure: early ? 'Pick a day on or after June 15, 2071.' : undefined };
};

// Inside a `Form`, a field with a `name` shows the error of that name: the native `required`, then the one of `validate`.
export const DepartureDay = (): ReactElement => {
	return (
		<Form
			validate={validateDeparture}
			successMessage='Departure booked.'
			style={{ maxWidth: '20rem' }}
		>
			<FormField
				label='Departure day'
				description='The gate to Ganymede opens on June 15, 2071.'
				name='departure'
				required
			>
				{(control: FormFieldControlProps): ReactElement => {
					return <input {...control} type='date' name='departure' min={launchDay} />;
				}}
			</FormField>

			<FormActions>
				<SubmitButton>Book the departure</SubmitButton>
			</FormActions>
		</Form>
	);
};
