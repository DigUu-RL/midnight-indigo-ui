'use client';
import { TimePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { ReactElement } from 'react';

// Only the time of `minTime` and `maxTime` counts: the lists leave out the hours outside the working day.
const opening: Date = new Date(2071, 5, 15, 8);
const closing: Date = new Date(2071, 5, 15, 18);

export const BriefingTime = (): ReactElement => {
	return (
		<TimePicker
			name='briefing'
			label='Briefing time'
			description='Jet Black briefs the crew between 8 AM and 6 PM.'
			minTime={opening}
			maxTime={closing}
			style={{ maxWidth: '20rem' }}
		/>
	);
};
