'use client';
import { DateRangePicker } from '@midnight-indigo/ui/forms/date-pickers';
import type { DateRangePreset } from '@midnight-indigo/ui/forms/date-pickers';
import type { ReactElement } from 'react';

const daysAfter = (day: Date, count: number): Date => {
	return new Date(day.getFullYear(), day.getMonth(), day.getDate() + count);
};

// Each preset gets the start of today and gives the first and the last day of its period.
const huntPresets: readonly DateRangePreset[] = [
	{
		label: 'This week',
		range: (today: Date): { start: Date; end: Date } => {
			return { start: today, end: daysAfter(today, 6 - today.getDay()) };
		},
	},
	{
		label: 'Next weekend',
		range: (today: Date): { start: Date; end: Date } => {
			const saturday: Date = daysAfter(today, (6 - today.getDay() + 7) % 7 || 7);
			return { start: saturday, end: daysAfter(saturday, 1) };
		},
	},
	{
		label: 'Two weeks from today',
		range: (today: Date): { start: Date; end: Date } => {
			return { start: today, end: daysAfter(today, 13) };
		},
	},
];

// `presets` replaces the periods of the panel with those of the application; `calendars={1}` shows one month.
export const HuntWindow = (): ReactElement => {
	return (
		<DateRangePicker
			label='Hunt window'
			startName='huntStart'
			endName='huntEnd'
			presets={huntPresets}
			calendars={1}
			style={{ maxWidth: '24rem' }}
		/>
	);
};
