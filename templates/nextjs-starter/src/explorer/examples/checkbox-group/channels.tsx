'use client';
import { CheckboxGroup } from '@midnight-indigo/ui/forms';
import type { ChoiceOption } from '@midnight-indigo/ui/forms';
import { useState } from 'react';
import type { ReactElement } from 'react';

const channels: readonly ChoiceOption[] = [
	{ value: 'email', label: 'Email', description: 'A summary every morning.' },
	{ value: 'radio', label: 'Ship radio', description: 'As soon as a bounty is posted.' },
	{
		value: 'video',
		label: 'Big Shot broadcast',
		description: 'The weekly show, with Punch and Judy.',
	},
];

// HTML has no "at least one" rule for checkboxes, so the example checks it and shows the error once the reader unchecks
// the last channel.
export const BountyAlerts = (): ReactElement => {
	const [checked, setChecked] = useState<readonly string[]>(['email']);
	const [changed, setChanged] = useState<boolean>(false);

	return (
		<CheckboxGroup
			name='channels'
			legend='Where to hear about new bounties'
			description='Choose at least one.'
			required
			options={channels}
			value={checked}
			onValueChange={(value: string[]): void => {
				setChecked(value);
				setChanged(true);
			}}
			error={changed && checked.length === 0 ? 'Choose at least one channel.' : undefined}
		/>
	);
};
