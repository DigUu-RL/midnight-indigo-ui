'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Avatar, List, ListItem, SkeletonList } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface CrewMember {
	name: string;
	role: string;
}

const crew: readonly CrewMember[] = [
	{ name: 'Spike Spiegel', role: 'Bounty hunter' },
	{ name: 'Faye Valentine', role: 'Gambler' },
	{ name: 'Jet Black', role: 'Captain of the Bebop' },
];

export const CrewRoster = (): ReactElement => {
	const [loading, setLoading] = useState<boolean>(true);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '28rem' }}>
			<section aria-label='Crew of the Bebop' aria-busy={loading} style={{ alignSelf: 'stretch' }}>
				{loading ? (
					<SkeletonList items={crew.length} withLeading label='Loading the crew' />
				) : (
					<List>
						{crew.map((member: CrewMember): ReactElement => {
							return (
								<ListItem
									key={member.name}
									title={member.name}
									description={member.role}
									leading={<Avatar name={member.name} decorative />}
								/>
							);
						})}
					</List>
				)}
			</section>

			<Button
				variant='soft'
				size='small'
				onClick={(): void => {
					setLoading((current: boolean): boolean => !current);
				}}
			>
				{loading ? 'Show the crew' : 'Load again'}
			</Button>
		</Stack>
	);
};
