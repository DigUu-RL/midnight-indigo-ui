import { Avatar, Badge } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const CrewPresence = (): ReactElement => {
	return (
		<Stack as='ul' direction='row' gap='3' aria-label='Crew on the bridge'>
			<li>
				<Badge dot intent='success' label='online'>
					<Avatar name='Leia Organa' intent='brand' />
				</Badge>
			</li>

			<li>
				<Badge dot intent='warning' label='away'>
					<Avatar name='Han Solo' intent='info' />
				</Badge>
			</li>

			<li>
				<Badge dot invisible label='offline'>
					<Avatar name='Chewbacca' />
				</Badge>
			</li>
		</Stack>
	);
};
