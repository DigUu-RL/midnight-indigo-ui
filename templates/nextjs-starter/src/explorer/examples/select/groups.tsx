import { Select } from '@midnight-indigo/ui/forms';
import type { SelectOptionGroup } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

const ports: readonly SelectOptionGroup[] = [
	{
		label: 'Inner planets',
		options: [
			{ value: 'venus', label: 'Venus' },
			{ value: 'earth', label: 'Earth', disabled: true },
			{ value: 'mars', label: 'Mars' },
		],
	},
	{
		label: 'Moons of Jupiter',
		options: [
			{ value: 'io', label: 'Io' },
			{ value: 'europa', label: 'Europa' },
			{ value: 'ganymede', label: 'Ganymede' },
			{ value: 'callisto', label: 'Callisto' },
		],
	},
	{
		label: 'Moons of Saturn',
		options: [{ value: 'titan', label: 'Titan' }],
	},
];

// Groups name the options by system; the placeholder comes first, and with `required` the form refuses it.
export const HomePort = (): ReactElement => {
	return (
		<div style={{ width: '100%', maxWidth: '20rem' }}>
			<Select
				name='port'
				label='Home port'
				description='Earth is closed to landings after the gate accident.'
				placeholder='Choose a port'
				required
				options={ports}
			/>
		</div>
	);
};
