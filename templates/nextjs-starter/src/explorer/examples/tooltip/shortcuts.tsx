'use client';
import { IconButton } from '@midnight-indigo/ui/buttons';
import { Tooltip } from '@midnight-indigo/ui/feedback';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

// tabler:player-play, tabler:player-skip-back and tabler:player-skip-forward, Tabler Icons by Paweł Kuna (MIT)
const strokes: string = `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`;

interface Control {
	label: string;
	shortcut: string;
	icon: IconifyIconData;
}

const controls: readonly Control[] = [
	{
		label: 'Previous track',
		shortcut: 'Shortcut: J',
		icon: { width: 24, height: 24, body: `<path ${strokes} d="M20 5v14L8 12zM4 5v14"/>` },
	},
	{
		label: 'Play',
		shortcut: 'Shortcut: K',
		icon: { width: 24, height: 24, body: `<path ${strokes} d="M7 4v16l13-8z"/>` },
	},
	{
		label: 'Next track',
		shortcut: 'Shortcut: L',
		icon: { width: 24, height: 24, body: `<path ${strokes} d="M4 5v14l12-7zm16 0v14"/>` },
	},
];

// Each button is named by its label; the tooltip only adds its shortcut.
export const PlayerShortcuts = (): ReactElement => {
	return (
		<Stack direction='row' gap='2' role='group' aria-label='Cowboy Bebop soundtrack'>
			{controls.map((control: Control): ReactElement => {
				return (
					<Tooltip key={control.label} content={control.shortcut}>
						<IconButton label={control.label} variant='soft'>
							<IconifyIcon icon={control.icon} decorative />
						</IconButton>
					</Tooltip>
				);
			})}
		</Stack>
	);
};
