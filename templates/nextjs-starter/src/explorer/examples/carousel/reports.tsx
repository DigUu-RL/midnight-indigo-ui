import { Card, CardContent, CardHeader, Carousel } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

interface Bounty {
	name: string;
	reward: string;
	notes: string;
}

const bounties: readonly Bounty[] = [
	{
		name: 'Mad Pierrot',
		reward: 'No bounty posted',
		notes: 'Big Shot warns every cowboy to stay away from him.',
	},
	{
		name: 'Andy von de Oniyate',
		reward: '3M woolongs',
		notes: 'A cowboy who hunts the same targets.',
	},
	{ name: 'Teddy Bomber', reward: '28M woolongs', notes: 'Leaves a stuffed bear at every blast.' },
];

export const BountyReports = (): ReactElement => {
	return (
		<Carousel label='Bounty reports' loop style={{ width: '100%', maxWidth: '28rem' }}>
			{bounties.map((bounty: Bounty): ReactElement => {
				return (
					<Card key={bounty.name}>
						<CardHeader title={bounty.name} subtitle={bounty.reward} headingLevel={4} />
						<CardContent>{bounty.notes}</CardContent>
					</Card>
				);
			})}
		</Carousel>
	);
};
