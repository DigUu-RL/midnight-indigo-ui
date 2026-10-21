'use client';
import { Select, Switch } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const destinations: readonly SelectOption[] = [
	{ value: 'mars', label: 'Mars' },
	{ value: 'ganymede', label: 'Ganymede' },
	{ value: 'callisto', label: 'Callisto' },
];

// The destination only counts with the autopilot on, so the select is disabled while it is off.
export const Autopilot = (): ReactElement => {
	const [autopilot, setAutopilot] = useState<boolean>(false);

	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '20rem' }}>
			<Switch
				label='Autopilot'
				description='Flies the Bebop to the destination below.'
				checked={autopilot}
				onCheckedChange={setAutopilot}
			/>

			<Select
				label='Destination'
				options={destinations}
				defaultValue='ganymede'
				disabled={!autopilot}
			/>
		</Stack>
	);
};
