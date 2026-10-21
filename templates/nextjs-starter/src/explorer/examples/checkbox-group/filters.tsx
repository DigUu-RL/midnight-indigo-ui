'use client';
import { List, ListItem } from '@midnight-indigo/ui/data-display';
import { CheckboxGroup } from '@midnight-indigo/ui/forms';
import type { ChoiceOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface Bounty {
	name: string;
	planet: string;
}

const bounties: readonly Bounty[] = [
	{ name: 'Asimov Solensan', planet: 'Mars' },
	{ name: 'Abdul Hakim', planet: 'Ganymede' },
	{ name: 'Mad Pierrot', planet: 'Earth' },
	{ name: 'Teddy Bomber', planet: 'Mars' },
	{ name: 'Vincent Volaju', planet: 'Titan' },
];

const planets: readonly ChoiceOption[] = [
	{ value: 'Mars', label: 'Mars' },
	{ value: 'Ganymede', label: 'Ganymede' },
	{ value: 'Earth', label: 'Earth' },
	{ value: 'Titan', label: 'Titan' },
];

// A row of filters: the list shows the bounties of the checked planets, and the count says how many are left.
export const PlanetFilter = (): ReactElement => {
	const [shown, setShown] = useState<readonly string[]>(['Mars', 'Titan']);

	const found: Bounty[] = bounties.filter((bounty: Bounty): boolean => {
		return shown.includes(bounty.planet);
	});

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '28rem' }}>
			<CheckboxGroup
				legend='Last seen on'
				orientation='horizontal'
				options={planets}
				value={shown}
				onValueChange={setShown}
			/>

			<p role='status' style={{ margin: 0 }}>
				{found.length === 1 ? '1 bounty' : `${String(found.length)} bounties`}
			</p>

			<List divided>
				{found.map((bounty: Bounty): ReactElement => {
					return <ListItem key={bounty.name} title={bounty.name} description={bounty.planet} />;
				})}
			</List>
		</Stack>
	);
};
