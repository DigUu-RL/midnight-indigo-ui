'use client';
// Form built without any form library: native constraints, a sync check, an error summary and an async submission.
import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import {
	Checkbox,
	Form,
	FormActions,
	RadioGroup,
	Select,
	SubmitButton,
	Switch,
	TextArea,
	TextField,
} from '@midnight-indigo/ui/forms';
import type { FormErrors } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

const validate = (data: FormData): FormErrors => {
	const email: FormDataEntryValue | null = data.get('email');

	return {
		email:
			typeof email === 'string' && email !== '' && !email.endsWith('.com')
				? 'Use your company address, ending in .com.'
				: undefined,
	};
};

const save = async (): Promise<void> => {
	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, 600);
	});
};

export const ProfileForm = (): ReactElement => {
	return (
		<Card as='section'>
			<CardHeader title='Profile' subtitle='Form fields (F06)' />

			<CardContent>
				<Form validate={validate} onSubmit={save} successMessage='Profile saved.'>
					<TextField label='Full name' name='name' autoComplete='name' required />

					<TextField
						label='Email address'
						name='email'
						type='email'
						autoComplete='email'
						description='We will only use it to contact you.'
						required
					/>

					<Select
						label='Team'
						name='team'
						placeholder='Choose a team'
						options={[
							{ value: 'finance', label: 'Finance' },
							{ value: 'sales', label: 'Sales' },
						]}
						required
					/>

					<RadioGroup
						legend='Plan'
						name='plan'
						orientation='horizontal'
						defaultValue='team'
						options={[
							{ value: 'free', label: 'Free' },
							{ value: 'team', label: 'Team' },
						]}
					/>

					<TextArea label='Notes' name='notes' maxLength={200} showCount />

					<Switch
						label='Enable email notifications'
						description='Sends a notification by email for each new report.'
						name='notifications'
						defaultChecked
					/>

					<Checkbox label='I accept the terms of use' name='terms' required />

					<FormActions>
						<SubmitButton>Save profile</SubmitButton>
					</FormActions>
				</Form>
			</CardContent>
		</Card>
	);
};
