import { Button } from '@midnight-indigo/ui/buttons';
import { Alert } from '@midnight-indigo/ui/feedback';
import type { ReactElement } from 'react';

export const DockingBayNotice = (): ReactElement => {
	return (
		<Alert
			intent='warning'
			variant='outline'
			title='Docking bay 94 closes at dusk'
			action={
				<Button size='small' variant='soft'>
					Reschedule
				</Button>
			}
			style={{ width: '100%', maxWidth: '32rem' }}
		>
			Ships still docked then wait in orbit until the next window.
		</Alert>
	);
};
