'use client';
import { NumberField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const capacity: number = 40;

// The range is in the description, read with the field, and checked as the value changes; the steppers serve the
// pointer, and Arrow Up and Down the keyboard, by `step`.
export const CargoLoad = (): ReactElement => {
	const [load, setLoad] = useState<number | null>(12.5);

	const error: string | undefined =
		load !== null && (load < 0 || load > capacity)
			? `The hold takes 0 to ${String(capacity)} tonnes.`
			: undefined;

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '20rem' }}>
			<NumberField
				label='Cargo'
				description={`Up to ${String(capacity)} tonnes, in steps of 0.5.`}
				suffix='t'
				min={0}
				max={capacity}
				step={0.5}
				steppers
				defaultValue={12.5}
				onValueChange={setLoad}
				error={error}
			/>

			<p style={{ margin: 0 }}>
				{load === null || error !== undefined
					? 'Enter the cargo to see the room left.'
					: `${String(capacity - load)} tonnes of room left in the hold.`}
			</p>
		</Stack>
	);
};
