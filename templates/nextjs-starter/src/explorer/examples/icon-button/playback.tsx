'use client';
import { IconButton } from '@midnight-indigo/ui/buttons';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// tabler:player-play, tabler:player-pause and tabler:player-skip-forward, Tabler Icons by Paweł Kuna (MIT)
const strokes: string = `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`;

const playIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M7 4v16l13-8z"/>`,
};

const pauseIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M6 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm8 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>`,
};

const skipIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M4 5v14l12-7zm16 0v14"/>`,
};

export const PlaybackControls = (): ReactElement => {
	const [playing, setPlaying] = useState<boolean>(false);

	return (
		<Stack direction='row' gap='2' align='center' role='group' aria-label='Tank! by the Seatbelts'>
			<IconButton
				label={playing ? 'Pause' : 'Play'}
				intent='brand'
				variant='solid'
				size='large'
				onClick={(): void => {
					setPlaying((current: boolean): boolean => !current);
				}}
			>
				<IconifyIcon icon={playing ? pauseIcon : playIcon} decorative />
			</IconButton>

			<IconButton label='Next track' variant='soft'>
				<IconifyIcon icon={skipIcon} decorative />
			</IconButton>
		</Stack>
	);
};
