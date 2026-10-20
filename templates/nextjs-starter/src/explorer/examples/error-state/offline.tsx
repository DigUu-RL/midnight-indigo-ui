import { Button } from '@midnight-indigo/ui/buttons';
import { Card, ErrorState } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

export const NoSignal = (): ReactElement => {
	return (
		<Card style={{ width: '100%', maxWidth: '32rem' }}>
			<ErrorState
				announce={false}
				headingLevel={4}
				title='No signal from the Bebop'
				description='The ship is out of range of the hyperspace gate. The last report is from 3 hours ago.'
				action={<Button variant='soft'>Open the last report</Button>}
			/>
		</Card>
	);
};
