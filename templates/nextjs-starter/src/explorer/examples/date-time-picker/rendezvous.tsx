'use client';
import { DateTimePicker } from '@midnight-indigo/ui/forms/date-pickers';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const meetingFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'full',
	timeStyle: 'short',
});

// `onValueChange` gets a `Date` once every section is filled in, and `null` while one is missing.
export const Rendezvous = (): ReactElement => {
	const [meeting, setMeeting] = useState<Date | null>(null);

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '22rem' }}>
			<DateTimePicker
				name='rendezvous'
				label='Rendezvous with Vicious'
				value={meeting}
				onValueChange={setMeeting}
			/>

			<p role='status'>
				{meeting === null
					? 'No rendezvous set.'
					: `Spike meets Vicious on ${meetingFormat.format(meeting)}.`}
			</p>
		</Stack>
	);
};
