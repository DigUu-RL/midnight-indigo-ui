import { IconButton } from '@midnight-indigo/ui/buttons';
import { Badge } from '@midnight-indigo/ui/data-display';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

// tabler:mail and tabler:bell, Tabler Icons by Paweł Kuna (MIT)
const strokes: string = `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`;

const mailIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 0l9 6l9-6"/>`,
};

const bellIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1"/>`,
};

export const InboxNotifications = (): ReactElement => {
	return (
		<Stack direction='row' gap='4'>
			<Badge content={3} label='3 unread messages'>
				<IconButton label='Messages'>
					<IconifyIcon icon={mailIcon} decorative />
				</IconButton>
			</Badge>

			<Badge content={120} intent='error' decorative>
				<IconButton label='Alerts, 120 unread'>
					<IconifyIcon icon={bellIcon} decorative />
				</IconButton>
			</Badge>
		</Stack>
	);
};
