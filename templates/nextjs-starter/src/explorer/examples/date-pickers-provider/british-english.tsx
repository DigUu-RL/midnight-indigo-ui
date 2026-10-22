'use client';
import {
	DatePicker,
	DatePickersProvider,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';
import { Stack } from '@midnight-indigo/ui/layout';
import { enGB } from 'date-fns/locale/en-GB';
import type { ReactElement } from 'react';

// The same language in another region: the day comes before the month, the week starts on Monday and the clock has 24
// hours. The texts of MUI X stay in English, so `localeText` is not needed.
export const BritishEnglish = (): ReactElement => {
	return (
		<DatePickersProvider locale={enGB}>
			<Stack gap='4' style={{ width: '100%', maxWidth: '20rem' }}>
				<DatePicker name='departure' label='Departure day' />
				<TimePicker name='boarding' label='Boarding time' />
			</Stack>
		</DatePickersProvider>
	);
};
