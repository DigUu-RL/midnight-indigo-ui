'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Menu } from '@midnight-indigo/ui/feedback';
import type { MenuEntry } from '@midnight-indigo/ui/feedback';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// tabler:copy, tabler:clipboard and tabler:trash, Tabler Icons by Paweł Kuna (MIT)
const strokes: string = `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`;

const copyIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<g ${strokes}><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></g>`,
};

const pasteIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<g ${strokes}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2"/></g>`,
};

const trashIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: `<path ${strokes} d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>`,
};

// The shortcuts are those of the same actions on the page; the menu only shows them (`aria-keyshortcuts`).
export const LogbookEditMenu = (): ReactElement => {
	const [copied, setCopied] = useState<boolean>(false);
	const [deleted, setDeleted] = useState<boolean>(false);

	const items: readonly MenuEntry[] = [
		{
			id: 'copy',
			label: 'Copy entry',
			icon: <IconifyIcon icon={copyIcon} decorative />,
			shortcut: 'Control+C',
			onSelect: (): void => {
				setCopied(true);
			},
		},
		{
			id: 'paste',
			label: 'Paste entry',
			icon: <IconifyIcon icon={pasteIcon} decorative />,
			shortcut: 'Control+V',
			disabled: !copied,
		},
		{ id: 'separator', separator: true },
		{
			id: 'delete',
			label: 'Delete entry',
			icon: <IconifyIcon icon={trashIcon} decorative />,
			shortcut: 'Delete',
			destructive: true,
			disabled: deleted,
			onSelect: (): void => {
				setDeleted(true);
			},
		},
	];

	return (
		<Stack direction='row' gap='3' align='center'>
			<Menu trigger={<Button variant='outline'>Edit</Button>} items={items} />

			<p role='status' style={{ margin: 0 }}>
				{deleted ? 'Entry deleted.' : 'Log 2071-11-03: chasing Vicious on Mars.'}
			</p>
		</Stack>
	);
};
