'use client';
import { DatePicker } from '@midnight-indigo/ui/forms/date-pickers';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const launchDay: Date = new Date(2071, 5, 15);

// The return cannot come before the departure: its `minDate` follows the departure as it changes.
export const ShoreLeave = (): ReactElement => {
	const [departure, setDeparture] = useState<Date | null>(null);

	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '20rem' }}>
			<DatePicker
				name='departure'
				label='Departure'
				description='The gate to Ganymede opens on June 15, 2071.'
				minDate={launchDay}
				value={departure}
				onValueChange={setDeparture}
			/>

			<DatePicker
				name='return'
				label='Return'
				description='On or after the departure.'
				minDate={departure ?? launchDay}
			/>
		</Stack>
	);
};
