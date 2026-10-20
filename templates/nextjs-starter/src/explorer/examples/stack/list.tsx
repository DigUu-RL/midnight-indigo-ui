import { Avatar } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const crew: readonly string[] = ['Spike Spiegel', 'Jet Black', 'Faye Valentine', 'Edward Wong'];

export const CrewList = (): ReactElement => {
	return (
		<Stack as='ul' gap='2' aria-label='Crew of the Bebop'>
			{crew.map((member: string): ReactElement => {
				return (
					<li key={member}>
						<Stack direction='row' gap='2' align='center'>
							<Avatar name={member} size='small' decorative />
							{member}
						</Stack>
					</li>
				);
			})}
		</Stack>
	);
};
