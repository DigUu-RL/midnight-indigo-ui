import { Card, CardContent } from '@midnight-indigo/ui/data-display';
import { Grid, GridItem } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor', 'Naboo', 'Jakku'];

export const PlanetGallery = (): ReactElement => {
	return (
		<Grid as='ul' minColumnWidth='10rem' gap='3' aria-label='Planets' style={{ width: '100%' }}>
			{planets.map((planet: string): ReactElement => {
				return (
					<GridItem key={planet} as='li'>
						<Card>
							<CardContent>{planet}</CardContent>
						</Card>
					</GridItem>
				);
			})}
		</Grid>
	);
};
