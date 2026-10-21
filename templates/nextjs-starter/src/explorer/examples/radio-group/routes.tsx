'use client';
import { RadioGroup } from '@midnight-indigo/ui/forms';
import type { ChoiceOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const routes: readonly ChoiceOption[] = [
	{
		value: 'gate',
		label: 'Through the astral gates',
		description: '3 hours, with a toll at each gate.',
	},
	{
		value: 'belt',
		label: 'Across the asteroid belt',
		description: '9 hours, and the Swordfish needs fuel on Callisto.',
	},
	{
		value: 'smuggler',
		label: 'Smuggler lane',
		description: 'Closed by the ISSP until further notice.',
		disabled: true,
	},
];

// Each option has a description, read after its label, and a closed route stays listed but cannot be chosen.
export const FlightRoute = (): ReactElement => {
	const [route, setRoute] = useState<string>('gate');

	const chosen: ChoiceOption | undefined = routes.find((option: ChoiceOption): boolean => {
		return option.value === route;
	});

	return (
		<Stack gap='3'>
			<RadioGroup
				name='route'
				legend='Route from Mars to Ganymede'
				options={routes}
				value={route}
				onValueChange={setRoute}
			/>

			<p style={{ margin: 0 }}>Flight plan: {chosen?.label}.</p>
		</Stack>
	);
};
