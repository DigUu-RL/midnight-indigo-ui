'use client';
import { Slider } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const percent = (value: number): string => `${String(value)} %`;

const distance = (value: number): string => {
	return value === 1 ? '1 parsec' : `${String(value)} parsecs`;
};

// `formatValue` writes the value beside the track and gives assistive technologies the same text, unit included.
export const DeflectorSettings = (): ReactElement => {
	return (
		<Stack gap='5' style={{ width: '100%', maxWidth: '28rem' }}>
			<Slider
				name='shields'
				label='Deflector shields'
				step={5}
				defaultValue={75}
				formatValue={percent}
			/>

			<Slider
				name='scan'
				label='Scan range'
				description='A wider range drains the shields faster.'
				min={1}
				max={12}
				defaultValue={3}
				formatValue={distance}
			/>
		</Stack>
	);
};
