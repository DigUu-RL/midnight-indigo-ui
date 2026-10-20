'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { SkeletonText } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

export const LogEntry = (): ReactElement => {
	const [loading, setLoading] = useState<boolean>(true);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '32rem' }}>
			<section aria-label='Log entry' aria-busy={loading} style={{ alignSelf: 'stretch' }}>
				{loading ? (
					<SkeletonText lines={4} label='Loading the log entry' />
				) : (
					<p style={{ margin: 0 }}>
						Day 214. The Bebop is drifting near Ganymede with an empty fridge again. Jet swears the
						next bounty will pay for the repairs; Spike is asleep on the couch, and Ein is staring
						at the hatch as if he knew something.
					</p>
				)}
			</section>

			<Button
				variant='soft'
				size='small'
				onClick={(): void => {
					setLoading((current: boolean): boolean => !current);
				}}
			>
				{loading ? 'Show the entry' : 'Load again'}
			</Button>
		</Stack>
	);
};
