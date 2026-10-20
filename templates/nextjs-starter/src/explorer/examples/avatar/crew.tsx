import { Avatar } from '@midnight-indigo/ui/data-display';
import type { AvatarProps } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const crew: readonly Pick<AvatarProps, 'name' | 'intent'>[] = [
	{ name: 'Spike Spiegel', intent: 'brand' },
	{ name: 'Faye Valentine', intent: 'info' },
	{ name: 'Jet Black', intent: 'success' },
	{ name: 'Edward Wong Hau Pepelu Tivrusky IV', intent: 'warning' },
];

export const CrewAvatars = (): ReactElement => {
	return (
		<Stack as='ul' direction='row' gap='2' wrap aria-label='Crew of the Bebop'>
			{crew.map((member: Pick<AvatarProps, 'name' | 'intent'>): ReactElement => {
				return (
					<li key={member.name}>
						<Avatar {...member} />
					</li>
				);
			})}
		</Stack>
	);
};
