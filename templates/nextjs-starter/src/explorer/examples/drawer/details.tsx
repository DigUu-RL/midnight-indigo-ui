'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { List, ListItem } from '@midnight-indigo/ui/data-display';
import { Drawer } from '@midnight-indigo/ui/feedback';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface CrewMember {
	name: string;
	role: string;
	lastSeen: string;
}

const crew: readonly CrewMember[] = [
	{
		name: 'Spike Spiegel',
		role: 'Bounty hunter',
		lastSeen: 'Mars, on the trail of Asimov Solensan.',
	},
	{ name: 'Faye Valentine', role: 'Gambler', lastSeen: 'A casino on Venus, short of woolongs.' },
	{
		name: 'Jet Black',
		role: 'Captain of the Bebop',
		lastSeen: 'Ganymede, with an old friend of the ISSP.',
	},
];

// One drawer for the whole list: the button of each member fills it, and focus returns to that button on close.
export const CrewDetails = (): ReactElement => {
	const [selected, setSelected] = useState<CrewMember | null>(null);

	return (
		<div style={{ width: '100%', maxWidth: '24rem' }}>
			<List divided>
				{crew.map((member: CrewMember): ReactElement => {
					return (
						<ListItem
							key={member.name}
							title={member.name}
							description={member.role}
							trailing={
								<Button
									variant='ghost'
									size='small'
									aria-label={`Details of ${member.name}`}
									onClick={(): void => {
										setSelected(member);
									}}
								>
									Details
								</Button>
							}
						/>
					);
				})}
			</List>

			<Drawer
				open={selected !== null}
				onClose={(): void => {
					setSelected(null);
				}}
				title={selected?.name ?? ''}
				description={selected?.role}
				closeOnOutsideClick
			>
				<p style={{ margin: 0 }}>Last seen: {selected?.lastSeen}</p>
			</Drawer>
		</div>
	);
};
