'use client';
import { IconButton } from '@midnight-indigo/ui/buttons';
import { List, ListItem } from '@midnight-indigo/ui/data-display';
import { Menu } from '@midnight-indigo/ui/feedback';
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

const crew: readonly string[] = ['Spike Spiegel', 'Faye Valentine', 'Jet Black'];

// Each button names its menu: `Actions for` and the member it acts on.
export const CrewActions = (): ReactElement => {
	const [lastAction, setLastAction] = useState<string>('No action yet.');

	const itemsFor = (member: string): readonly MenuEntry[] => {
		return [
			{
				id: 'message',
				label: 'Send a message',
				onSelect: (): void => {
					setLastAction(`Message sent to ${member}.`);
				},
			},
			{
				id: 'assign',
				label: 'Assign a bounty',
				onSelect: (): void => {
					setLastAction(`Bounty assigned to ${member}.`);
				},
			},
			{ id: 'separator', separator: true },
			{
				id: 'remove',
				label: 'Remove from the crew',
				destructive: true,
				onSelect: (): void => {
					setLastAction(`${member} left the Bebop.`);
				},
			},
		];
	};

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '24rem' }}>
			<List divided>
				{crew.map((member: string): ReactElement => {
					return (
						<ListItem
							key={member}
							title={member}
							trailing={
								<Menu
									placement='bottom-end'
									trigger={
										<IconButton label={`Actions for ${member}`} variant='ghost' size='small'>
											<IconifyIcon icon={dotsIcon} decorative />
										</IconButton>
									}
									items={itemsFor(member)}
								/>
							}
						/>
					);
				})}
			</List>

			<p role='status' style={{ margin: 0 }}>
				{lastAction}
			</p>
		</Stack>
	);
};
