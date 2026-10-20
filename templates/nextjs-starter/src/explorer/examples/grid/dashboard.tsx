import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import { Grid, GridItem } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const FleetDashboard = (): ReactElement => {
	return (
		<Grid columns={{ compact: 1, medium: 2, expanded: 4 }} gap='3' style={{ width: '100%' }}>
			<GridItem span={{ compact: 'full', expanded: 2 }}>
				<Card>
					<CardHeader title='Hyperdrive' subtitle='Millennium Falcon' />
					<CardContent>Online, 0.5 past light speed.</CardContent>
				</Card>
			</GridItem>

			<Card>
				<CardHeader title='Shields' />
				<CardContent>87%</CardContent>
			</Card>

			<Card>
				<CardHeader title='Crew' />
				<CardContent>4 aboard</CardContent>
			</Card>
		</Grid>
	);
};
