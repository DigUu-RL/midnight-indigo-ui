'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { List, ListItem } from '@midnight-indigo/ui/data-display';
import { Dialog } from '@midnight-indigo/ui/feedback';
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
	{ name: 'Edward Wong', role: 'Hacker' },
];

// It only shows information, so a click outside closes it too (`closeOnOutsideClick`).
export const CrewManifest = (): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);

	const close = (): void => {
		setOpen(false);
	};

	return (
		<>
			<Button
				variant='outline'
				onClick={(): void => {
					setOpen(true);
				}}
			>
				Show the crew manifest
			</Button>

			<Dialog
				open={open}
				onClose={close}
				title='Crew manifest'
				description='Everyone aboard the Bebop on this jump.'
				size='large'
				closeOnOutsideClick
				actions={<Button onClick={close}>Done</Button>}
			>
				<List divided>
					{crew.map((member: CrewMember): ReactElement => {
						return <ListItem key={member.name} title={member.name} description={member.role} />;
					})}
				</List>
			</Dialog>
		</>
	);
};
