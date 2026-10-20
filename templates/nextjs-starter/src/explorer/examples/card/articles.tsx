import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import { Grid, GridItem } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

interface LogEntry {
	title: string;
	date: string;
	summary: string;
}

const entries: readonly LogEntry[] = [
	{
		title: 'Arrival on Zebes',
		date: 'Cycle 2045.03',
		summary: 'Landed near the Crateria surface. Space Pirate activity detected below.',
	},
	{
		title: 'Varia Suit recovered',
		date: 'Cycle 2045.05',
		summary: 'Heat resistance restored; Norfair is now within reach.',
	},
	{
		title: 'Mother Brain defeated',
		date: 'Cycle 2045.09',
		summary: 'Tourian destroyed. Escaped before the planet self-destructed.',
	},
];

export const MissionLog = (): ReactElement => {
	return (
		<Grid as='ul' minColumnWidth='14rem' gap='3' style={{ width: '100%' }}>
			{entries.map((entry: LogEntry): ReactElement => {
				return (
					<GridItem key={entry.title} as='li'>
						<Card as='article' variant='elevated'>
							<CardHeader title={entry.title} subtitle={entry.date} headingLevel={4} />
							<CardContent>{entry.summary}</CardContent>
						</Card>
					</GridItem>
				);
			})}
		</Grid>
	);
};
