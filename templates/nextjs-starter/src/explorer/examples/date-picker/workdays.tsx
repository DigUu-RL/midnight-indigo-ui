'use client';
import { DatePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { ReactElement } from 'react';

const isWeekend = (day: Date): boolean => day.getDay() === 0 || day.getDay() === 6;

// The calendar leaves out the past days and the weekends: the ISSP office only pays bounties on weekdays.
export const PaymentDay = (): ReactElement => {
	return (
		<DatePicker
			name='payment'
			label='Payment day'
			description='The ISSP office pays bounties from Monday to Friday.'
			disablePast
			shouldDisableDate={isWeekend}
			style={{ maxWidth: '20rem' }}
		/>
	);
};
