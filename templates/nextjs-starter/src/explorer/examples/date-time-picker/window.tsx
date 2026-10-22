'use client';
import { DateTimePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { ReactElement } from 'react';

const gateOpens: Date = new Date(2071, 5, 15, 6);
const gateCloses: Date = new Date(2071, 5, 17, 22);

// `minDateTime` and `maxDateTime` bound the instant, not each part: on the first day, the hours before 6 AM are left
// out; on the other days, every hour can be chosen until the last.
export const GateJump = (): ReactElement => {
	return (
		<DateTimePicker
			name='jump'
			label='Jump through the gate'
			description='The gate to Ganymede is open from June 15, 6 AM, to June 17, 10 PM.'
			minDateTime={gateOpens}
			maxDateTime={gateCloses}
			style={{ maxWidth: '22rem' }}
		/>
	);
};
