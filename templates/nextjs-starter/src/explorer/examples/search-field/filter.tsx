'use client';
import { List, ListItem } from '@midnight-indigo/ui/data-display';
import { SearchField } from '@midnight-indigo/ui/forms';
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

const matches = (bounty: Bounty, query: string): boolean => {
	const search: string = query.trim().toLowerCase();
	return `${bounty.name} ${bounty.planet}`.toLowerCase().includes(search);
};

// The list filters as the reader types; the count, in a status region, tells assistive technologies how many are left.
export const BountySearch = (): ReactElement => {
	const [query, setQuery] = useState<string>('');

	const found: Bounty[] = bounties.filter((bounty: Bounty): boolean => matches(bounty, query));

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '24rem' }}>
			<SearchField
				label='Search bounties'
				description='By name or planet.'
				value={query}
				onValueChange={setQuery}
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
