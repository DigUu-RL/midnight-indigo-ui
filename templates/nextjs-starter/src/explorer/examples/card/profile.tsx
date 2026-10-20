import { IconButton } from '@midnight-indigo/ui/buttons';
import { Avatar, Card, CardContent, CardHeader, Chip } from '@midnight-indigo/ui/data-display';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

// tabler:dots-vertical, Tabler Icons by Paweł Kuna (MIT)
const moreIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0-14a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/>`,
};

export const BountyCard = (): ReactElement => {
	return (
		<Card as='section' style={{ width: '100%', maxWidth: '24rem' }}>
			<CardHeader
				title='Asimov Solensan'
				subtitle='Wanted on Mars'
				headingLevel={4}
				avatar={<Avatar name='Asimov Solensan' decorative />}
				action={
					<IconButton label='Actions for Asimov Solensan' variant='ghost'>
						<IconifyIcon icon={moreIcon} decorative />
					</IconButton>
				}
			/>

			<CardContent>
				<Stack gap='3'>
					<span>Dealer of Bloody-Eye, last seen in a convenience store with his partner.</span>

					<Stack direction='row' gap='2' wrap>
						<Chip label='Bounty: 2.5M woolongs' intent='warning' />
						<Chip label='Armed' intent='error' />
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
};
