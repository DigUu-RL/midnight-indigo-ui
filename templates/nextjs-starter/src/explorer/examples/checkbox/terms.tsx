'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Checkbox } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

// The error shows once the reader submits without the terms, and goes away as soon as they accept them.
export const BountyTerms = (): ReactElement => {
	const [accepted, setAccepted] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);

	return (
		<form
			noValidate
			onSubmit={(event: SubmitEvent<HTMLFormElement>): void => {
				event.preventDefault();
				setSubmitted(true);
			}}
		>
			<Stack gap='4' align='start'>
				<Checkbox
					name='terms'
					label='I accept the terms of the bounty'
					description='The ISSP pays only for a target delivered alive.'
					required
					checked={accepted}
					onCheckedChange={setAccepted}
					error={submitted && !accepted ? 'Accept the terms to take the bounty.' : undefined}
				/>

				<Button type='submit'>Take the bounty</Button>

				<p role='status' style={{ margin: 0 }}>
					{submitted && accepted ? 'Bounty taken. Good hunting, cowboy.' : ''}
				</p>
			</Stack>
		</form>
	);
};
