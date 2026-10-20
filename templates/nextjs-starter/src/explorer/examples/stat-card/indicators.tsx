import { StatCard } from '@midnight-indigo/ui/data-display';
import { Grid } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const FleetIndicators = (): ReactElement => {
	return (
		<Grid minColumnWidth='12rem' gap='3' style={{ width: '100%' }}>
			<StatCard
				label='Bounties collected'
				value='2.4M woolongs'
				change={{ value: '12%', trend: 'up' }}
				description='vs. last month'
			/>

			<StatCard
				label='Fuel costs'
				value='380K woolongs'
				change={{ value: '8%', trend: 'up', sentiment: 'negative' }}
				description='vs. last month'
			/>

			<StatCard
				label='Crew aboard'
				value='4'
				change={{ value: '0', trend: 'flat' }}
				description='Ein included'
			/>
		</Grid>
	);
};
