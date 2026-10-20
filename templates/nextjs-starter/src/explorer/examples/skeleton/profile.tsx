import { Skeleton } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const PilotProfilePlaceholder = (): ReactElement => {
	return (
		<section
			aria-label='Pilot profile'
			aria-busy='true'
			style={{ width: '100%', maxWidth: '20rem' }}
		>
			<Stack direction='row' gap='3' align='center'>
				<Skeleton shape='circle' width='3rem' />

				<Stack gap='2' style={{ flex: 1 }}>
					<Skeleton width='50%' />
					<Skeleton width='80%' />
				</Stack>
			</Stack>
		</section>
	);
};
