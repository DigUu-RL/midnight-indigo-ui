'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { RadioGroup } from '@midnight-indigo/ui/forms';
import type { ChoiceOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

const payments: readonly ChoiceOption[] = [
	{ value: 'woolongs', label: 'Woolongs' },
	{ value: 'credits', label: 'Imperial credits' },
	{ value: 'meal', label: 'A proper meal with beef' },
];

// No option is checked until the reader chooses one, so a submission without a choice shows the error of the group.
export const RewardPayment = (): ReactElement => {
	const [payment, setPayment] = useState<string>('');
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
				<RadioGroup
					name='payment'
					legend='Payment of the reward'
					orientation='horizontal'
					required
					options={payments}
					value={payment}
					onValueChange={setPayment}
					error={submitted && payment === '' ? 'Choose how to receive the reward.' : undefined}
				/>

				<Button type='submit'>Claim the reward</Button>
			</Stack>
		</form>
	);
};
