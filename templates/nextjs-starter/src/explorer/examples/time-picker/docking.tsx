'use client';
import { TimePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { ReactElement } from 'react';

// A 24-hour clock whatever the locale, and slots every quarter of an hour: the list of minutes shows 00, 15, 30 and 45.
export const DockingSlot = (): ReactElement => {
	return (
		<TimePicker
			name='docking'
			label='Docking slot'
			description='Port control of Tharsis books the docks by the quarter of an hour.'
			ampm={false}
			minuteStep={15}
			style={{ maxWidth: '20rem' }}
		/>
	);
};
