'use client';
import { IconButton } from '@midnight-indigo/ui/buttons';
import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import { ContextMenu, Menu } from '@midnight-indigo/ui/feedback';
import type { MenuEntry } from '@midnight-indigo/ui/feedback';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// tabler:dots-vertical, Tabler Icons by Paweł Kuna (MIT)
const dotsIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0-14a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/>',
};

// A context menu is hard to discover, so the same items are behind a visible button too.
export const BountyPoster = (): ReactElement => {
	const [status, setStatus] = useState<string>('Wanted: Vicious, 30,000,000 woolongs.');

	const items: readonly MenuEntry[] = [
		{
			id: 'track',
			label: 'Track the bounty',
			onSelect: (): void => {
				setStatus('Tracking Vicious.');
			},
		},
		{
			id: 'share',
			label: 'Share with the crew',
			onSelect: (): void => {
				setStatus('Shared with the crew of the Bebop.');
			},
		},
	];

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '24rem' }}>
			<ContextMenu label='Actions for the bounty on Vicious' items={items}>
				<Card tabIndex={0}>
					<CardHeader
						title='Vicious'
						subtitle='Red Dragon Syndicate'
						action={
							<Menu
								placement='bottom-end'
								trigger={
									<IconButton
										label='Actions for the bounty on Vicious'
										variant='ghost'
										size='small'
									>
										<IconifyIcon icon={dotsIcon} decorative />
									</IconButton>
								}
								items={items}
							/>
						}
					/>

					<CardContent>Last seen in the cathedral on Mars.</CardContent>
				</Card>
			</ContextMenu>

			<p role='status' style={{ margin: 0 }}>
				{status}
			</p>
		</Stack>
	);
};
