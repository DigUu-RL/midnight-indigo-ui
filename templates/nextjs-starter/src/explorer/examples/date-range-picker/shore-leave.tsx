'use client';
import { DateRangePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { DateRange } from '@midnight-indigo/ui/forms/date-pickers';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const dayInMilliseconds: number = 24 * 60 * 60 * 1000;

const lengthOf = ({ start, end }: DateRange): number | null => {
	return start === null || end === null
		? null
		: Math.round((end.getTime() - start.getTime()) / dayInMilliseconds) + 1;
};

// `maxDays` keeps out the ends more than two weeks from the start, and the past days cannot start the leave.
export const ShoreLeave = (): ReactElement => {
	const [leave, setLeave] = useState<DateRange>({ start: null, end: null });
	const days: number | null = lengthOf(leave);

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '24rem' }}>
			<DateRangePicker
				label='Shore leave'
				description='The crew of the Bebop gets two weeks at most.'
				startName='leaveStart'
				endName='leaveEnd'
				disablePast
				maxDays={14}
				value={leave}
				onValueChange={setLeave}
			/>

			<p role='status'>
				{days === null ? 'No leave set.' : `Shore leave of ${String(days)} days.`}
			</p>
		</Stack>
	);
};
