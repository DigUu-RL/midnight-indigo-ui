import { IconButton } from '@midnight-indigo/ui/buttons';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

// tabler:pencil, tabler:share and tabler:trash, Tabler Icons by Paweł Kuna (MIT)
const strokes: string = `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`;

const pencilIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M4 20h4L18.5 9.5a2.828 2.828 0 1 0-4-4L4 16zm9.5-13.5l4 4"/>`,
};

const shareIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0m12-6a3 3 0 1 0 6 0a3 3 0 1 0-6 0m0 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0m-6.3-7.3l6.6-3.4m-6.6 6l6.6 3.4"/>`,
};

const trashIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>`,
};

export const CrewMemberActions = (): ReactElement => {
	return (
		<Stack direction='row' gap='1' role='group' aria-label='Actions for Spike Spiegel'>
			<IconButton label='Edit Spike Spiegel'>
				<IconifyIcon icon={pencilIcon} decorative />
			</IconButton>

			<IconButton label='Share Spike Spiegel'>
				<IconifyIcon icon={shareIcon} decorative />
			</IconButton>

			<IconButton label='Remove Spike Spiegel' intent='error'>
				<IconifyIcon icon={trashIcon} decorative />
			</IconButton>
		</Stack>
	);
};
