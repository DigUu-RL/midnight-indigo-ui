'use client';
import { NumberField, Slider } from '@midnight-indigo/ui/forms';
import { useState } from 'react';
import type { ReactElement } from 'react';

const lowest: number = 1000;
const highest: number = 50000;

const woolongs = (value: number): string => value.toLocaleString('en-US');

// Dragging is quick but rough, so a number field after the track, bound to the same value, takes the exact amount.
export const RewardRange = (): ReactElement => {
	const [reward, setReward] = useState<number>(12000);

	return (
		<div style={{ width: '100%', maxWidth: '32rem' }}>
			<Slider
				label='Least reward'
				description='In woolongs.'
				min={lowest}
				max={highest}
				step={500}
				value={reward}
				onValueChange={setReward}
				formatValue={woolongs}
				input={
					<NumberField
						label='Least reward, in woolongs'
						hideLabel
						size='small'
						min={lowest}
						max={highest}
						value={reward}
						onValueChange={(value: number | null): void => {
							if (value !== null) setReward(Math.min(Math.max(value, lowest), highest));
						}}
						style={{ width: '8rem' }}
					/>
				}
			/>
		</div>
	);
};
