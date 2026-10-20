'use client';
import { Card, CardHeader } from '@midnight-indigo/ui/data-display';
import { ContextMenu } from '@midnight-indigo/ui/feedback';
import type { MenuEntry } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface MissionLog {
	id: string;
	title: string;
	date: string;
}

const initialLogs: readonly MissionLog[] = [
	{ id: 'asteroid', title: 'Asteroid field near Hoth', date: '3 ABY' },
	{ id: 'cloud-city', title: 'Landing at Cloud City', date: '3 ABY' },
	{ id: 'endor', title: 'Shield generator on Endor', date: '4 ABY' },
];

// Each card is focusable, so Shift+F10 or the context menu key open its menu as a right click does.
export const MissionLogs = (): ReactElement => {
	const [logs, setLogs] = useState<readonly MissionLog[]>(initialLogs);

	const [status, setStatus] = useState<string>(
		'Right click a log, or focus it and press Shift+F10.',
	);

	const itemsFor = (log: MissionLog): readonly MenuEntry[] => {
		return [
			{
				id: 'pin',
				label: 'Pin to the top',
				onSelect: (): void => {
					setLogs([log, ...logs.filter((other: MissionLog): boolean => other.id !== log.id)]);
					setStatus(`${log.title} pinned.`);
				},
			},
			{ id: 'separator', separator: true },
			{
				id: 'archive',
				label: 'Archive',
				destructive: true,
				onSelect: (): void => {
					setLogs(logs.filter((other: MissionLog): boolean => other.id !== log.id));
					setStatus(`${log.title} archived.`);
				},
			},
		];
	};

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '24rem' }}>
			{logs.map((log: MissionLog): ReactElement => {
				return (
					<ContextMenu key={log.id} label={`Actions for ${log.title}`} items={itemsFor(log)}>
						<Card tabIndex={0}>
							<CardHeader title={log.title} subtitle={log.date} />
						</Card>
					</ContextMenu>
				);
			})}

			<p role='status' style={{ margin: 0 }}>
				{status}
			</p>
		</Stack>
	);
};
