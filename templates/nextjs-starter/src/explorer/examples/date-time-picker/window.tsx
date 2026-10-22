'use client';
import { DateTimePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { ReactElement } from 'react';

const gateOpens: Date = new Date(2071, 5, 15, 6);
const gateCloses: Date = new Date(2071, 5, 17, 22);

// `minDate` and `maxDate` bound the instant, not only the day: on the first day, the hours before 6 AM cannot be
// chosen; on the other days, every hour until the last.
export const GateJump = (): ReactElement => {
	return (
		<DateTimePicker
			name='jump'
			label='Jump through the gate'
			description='The gate to Ganymede is open from June 15, 6 AM, to June 17, 10 PM.'
			minDate={gateOpens}
			maxDate={gateCloses}
			style={{ maxWidth: '22rem' }}
		/>
	);
};
