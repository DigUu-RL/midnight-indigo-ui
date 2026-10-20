import { Card, CardContent, CardHeader, SkeletonList } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

export const TransmissionsPlaceholder = (): ReactElement => {
	return (
		<Card as='section' aria-busy='true' style={{ width: '100%', maxWidth: '28rem' }}>
			<CardHeader title='Transmissions' subtitle='Received at Echo Base' headingLevel={4} />

			<CardContent>
				<SkeletonList items={5} label='Loading the transmissions' />
			</CardContent>
		</Card>
	);
};
