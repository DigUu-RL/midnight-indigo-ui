'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { StatCard } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

export const ShieldStatus = (): ReactElement => {
	const [loading, setLoading] = useState<boolean>(true);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '20rem' }}>
			<StatCard
				label='Shield strength'
				value='87%'
				change={{ value: '5%', trend: 'down' }}
				description='since the last jump'
				loading={loading}
				style={{ alignSelf: 'stretch' }}
			/>

			<Button
				variant='soft'
				size='small'
				onClick={(): void => {
					setLoading((current: boolean): boolean => !current);
				}}
			>
				{loading ? 'Show the reading' : 'Scan again'}
			</Button>
		</Stack>
	);
};
