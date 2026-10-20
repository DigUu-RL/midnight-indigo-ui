import { Card, CardContent, CardHeader, SkeletonText } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

export const MissionBriefPlaceholder = (): ReactElement => {
	return (
		<Card as='section' aria-busy='true' style={{ width: '100%', maxWidth: '24rem' }}>
			<CardHeader title='Mission brief' subtitle='Leia Organa' headingLevel={4} />

			<CardContent>
				<SkeletonText lines={2} label='Loading the brief' />
			</CardContent>
		</Card>
	);
};
