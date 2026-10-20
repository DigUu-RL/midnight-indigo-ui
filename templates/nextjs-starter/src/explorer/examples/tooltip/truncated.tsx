'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Tooltip } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const ships: readonly string[] = [
	'Millennium Falcon',
	'Bebop, fishing trawler of the Inter Solar System Police',
	'Swordfish II, mono racer of Spike Spiegel',
];

// The full name is the text of the button, so it names the button even where the ellipsis hides it.
export const ShipNames = (): ReactElement => {
	return (
		<Stack gap='2' align='start' style={{ width: '100%', maxWidth: '16rem' }}>
			{ships.map((ship: string): ReactElement => {
				return (
					<Tooltip key={ship} content={ship} placement='end'>
						<Button variant='ghost' style={{ maxWidth: '100%' }}>
							<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{ship}
							</span>
						</Button>
					</Tooltip>
				);
			})}
		</Stack>
	);
};
