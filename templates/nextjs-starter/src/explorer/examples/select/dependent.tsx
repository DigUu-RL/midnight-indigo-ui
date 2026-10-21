'use client';
import { Select } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const systems: readonly SelectOption[] = [
	{ value: 'jupiter', label: 'Jupiter' },
	{ value: 'saturn', label: 'Saturn' },
];

const moonsBySystem: Readonly<Record<string, readonly SelectOption[]>> = {
	jupiter: [
		{ value: 'io', label: 'Io' },
		{ value: 'ganymede', label: 'Ganymede' },
		{ value: 'callisto', label: 'Callisto' },
	],
	saturn: [
		{ value: 'titan', label: 'Titan' },
		{ value: 'enceladus', label: 'Enceladus' },
	],
};

// The moons depend on the system: the second select waits for the first, and a new system clears the moon.
export const MoonLanding = (): ReactElement => {
	const [system, setSystem] = useState<string>('');
	const [moon, setMoon] = useState<string>('');

	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '20rem' }}>
			<Select
				label='System'
				placeholder='Choose a system'
				options={systems}
				value={system}
				onValueChange={(value: string): void => {
					setSystem(value);
					setMoon('');
				}}
			/>

			<Select
				label='Moon'
				description={system === '' ? 'Choose a system first.' : undefined}
				placeholder='Choose a moon'
				options={moonsBySystem[system] ?? []}
				value={moon}
				onValueChange={setMoon}
				disabled={system === ''}
			/>
		</Stack>
	);
};
