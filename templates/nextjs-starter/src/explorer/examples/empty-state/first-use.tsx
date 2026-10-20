import { Button } from '@midnight-indigo/ui/buttons';
import { Card, EmptyState } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

export const EmptyBountyBoard = (): ReactElement => {
	return (
		<Card style={{ width: '100%', maxWidth: '32rem' }}>
			<EmptyState
				headingLevel={4}
				title='No bounties on the board'
				description='When the ISSP posts a bounty in this system, it shows up here with its reward.'
				action={<Button>Post a bounty</Button>}
			/>
		</Card>
	);
};
