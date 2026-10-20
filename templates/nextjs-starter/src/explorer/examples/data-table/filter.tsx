'use client';
import { DataTable } from '@midnight-indigo/ui/data-display';
import type { DataTableColumn } from '@midnight-indigo/ui/data-display';
import { SearchField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface Bounty {
	name: string;
	planet: string;
	reward: number;
}

const bounties: readonly Bounty[] = [
	{ name: 'Asimov Solensan', planet: 'Mars', reward: 2500000 },
	{ name: 'Abdul Hakim', planet: 'Ganymede', reward: 2500000 },
	{ name: 'Mad Pierrot', planet: 'Earth', reward: 12000000 },
	{ name: 'Teddy Bomber', planet: 'Mars', reward: 30000000 },
	{ name: 'Rocco Bonnaro', planet: 'Callisto', reward: 15000 },
	{ name: 'Vincent Volaju', planet: 'Titan', reward: 300000000 },
	{ name: 'Andy von de Oniyate', planet: 'Mars', reward: 4000000 },
	{ name: 'Wen', planet: 'Io', reward: 1000000 },
];

const columns: readonly DataTableColumn<Bounty>[] = [
	{
		id: 'name',
		header: 'Name',
		cell: (bounty: Bounty): string => bounty.name,
		sortValue: (bounty: Bounty): string => bounty.name,
		filterValue: (bounty: Bounty): string => bounty.name,
		rowHeader: true,
	},
	{
		id: 'planet',
		header: 'Last seen',
		cell: (bounty: Bounty): string => bounty.planet,
		sortValue: (bounty: Bounty): string => bounty.planet,
		filterValue: (bounty: Bounty): string => bounty.planet,
	},
	{
		id: 'reward',
		header: 'Reward',
		cell: (bounty: Bounty): string => `${bounty.reward.toLocaleString('en-US')} woolongs`,
		sortValue: (bounty: Bounty): number => bounty.reward,
		align: 'end',
	},
];

export const BountySearch = (): ReactElement => {
	const [filter, setFilter] = useState<string>('');

	return (
		<Stack gap='3' style={{ width: '100%' }}>
			<search>
				<SearchField
					label='Search bounties'
					description='By name or planet, e.g. Mars.'
					value={filter}
					onValueChange={setFilter}
				/>
			</search>

			<DataTable
				caption='Wanted bounties'
				columns={columns}
				rows={bounties}
				getRowId={(bounty: Bounty): string => bounty.name}
				filter={filter}
				pageSize={5}
				defaultSort={{ columnId: 'reward', direction: 'descending' }}
			/>
		</Stack>
	);
};
