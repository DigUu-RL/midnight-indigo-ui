'use client';
import { NumberField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// The field holds the number as typed, without separators; the formatted amount is shown beside it.
export const BountyReward = (): ReactElement => {
	const [reward, setReward] = useState<number | null>(2500000);

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '20rem' }}>
			<NumberField
				label='Reward'
				suffix='woolongs'
				min={0}
				step={1000}
				defaultValue={2500000}
				onValueChange={setReward}
			/>

			<p style={{ margin: 0 }}>
				{reward === null
					? 'No reward set.'
					: `The ISSP pays ${reward.toLocaleString('en-US')} woolongs.`}
			</p>
		</Stack>
	);
};
