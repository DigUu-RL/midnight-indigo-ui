// The dates of the calendar of the pickers: the weeks of a month, the days that cannot be chosen, the choice of a
// range day by day and the predefined dates and periods.
import {
	addDays,
	addMonths,
	addQuarters,
	addYears,
	differenceInCalendarDays,
	endOfMonth,
	endOfQuarter,
	endOfYear,
	format,
	isAfter,
	isBefore,
	isSameDay,
	startOfDay,
	startOfMonth,
	startOfQuarter,
	startOfWeek,
	startOfYear,
} from 'date-fns';
import type { Day, Locale } from 'date-fns';

import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';

/** A range of days; either end is `null` until it is chosen. */
export interface DateRange {
	/** First day; `null` until it is chosen. */
	start: Date | null;
	/** Last day; `null` until it is chosen. */
	end: Date | null;
}

export const emptyRange: Readonly<DateRange> = Object.freeze({ start: null, end: null });

/** The days that can be chosen. */
export interface DateConstraints {
	/** First day that can be chosen. */
	minDate?: Date | undefined;
	/** Last day that can be chosen. */
	maxDate?: Date | undefined;
	/** Days before today cannot be chosen. */
	disablePast?: boolean | undefined;
	/** Days after today cannot be chosen. */
	disableFuture?: boolean | undefined;
	/** Called with each day; `true` keeps it from being chosen, e.g. a weekend. */
	shouldDisableDate?: ((day: Date) => boolean) | undefined;
}

/** A date offered beside the calendar of a `DatePicker`, e.g. tomorrow. */
export interface DatePreset {
	/** Text of the preset in the panel. */
	label: string;
	/** The date, from the start of today. */
	value: (today: Date) => Date;
}

/** A period offered beside the calendars of a `DateRangePicker`, e.g. the next 7 days. */
export interface DateRangePreset {
	/** Text of the preset in the panel. */
	label: string;
	/** The first and the last day, from the start of today. */
	range: (today: Date) => { start: Date; end: Date };
}

export const weekStartOf = (locale: Locale): Day => locale.options?.weekStartsOn ?? 0;

/** The six weeks shown for a month, each one from the first day of the week of the locale. */
export const weeksOfMonth = (month: Date, locale: Locale): Date[][] => {
	const first: Date = startOfWeek(startOfMonth(month), { weekStartsOn: weekStartOf(locale) });

	return Array.from({ length: 6 }, (_week: unknown, week: number): Date[] => {
		return Array.from({ length: 7 }, (_day: unknown, day: number): Date => {
			return addDays(first, week * 7 + day);
		});
	});
};

export interface WeekdayName {
	short: string;
	long: string;
}

/** The names of the days of the week, from its first day in the locale: `dom` and `domingo` in pt-BR. */
export const weekdayNamesOf = (locale: Locale): WeekdayName[] => {
	const first: Date = startOfWeek(new Date(2000, 0, 5), { weekStartsOn: weekStartOf(locale) });

	return Array.from({ length: 7 }, (_day: unknown, index: number): WeekdayName => {
		const day: Date = addDays(first, index);
		const abbreviated: string = format(day, 'EEE', { locale });
		// A column of the calendar fits three letters: some locales abbreviate a day as a whole word (`segunda` in pt-BR),
		// and their shortest name is used then (`seg`).
		return {
			short: abbreviated.length <= 3 ? abbreviated : format(day, 'EEEEEE', { locale }),
			long: format(day, 'EEEE', { locale }),
		};
	});
};

/** The names of the months, as a list shows them: `janeiro`, `fevereiro`… in pt-BR. */
export const monthNamesOf = (locale: Locale): string[] => {
	return Array.from({ length: 12 }, (_month: unknown, month: number): string => {
		return format(new Date(2000, month, 1), 'LLLL', { locale });
	});
};

/** Whether a day cannot be chosen. */
export const isDayDisabled = (day: Date, constraints: DateConstraints, today: Date): boolean => {
	const {
		minDate,
		maxDate,
		disablePast = false,
		disableFuture = false,
		shouldDisableDate,
	}: DateConstraints = constraints;

	return (
		(minDate !== undefined && isBefore(day, startOfDay(minDate))) ||
		(maxDate !== undefined && isAfter(startOfDay(day), startOfDay(maxDate))) ||
		(disablePast && isBefore(day, startOfDay(today))) ||
		(disableFuture && isAfter(startOfDay(day), startOfDay(today))) ||
		(shouldDisableDate?.(day) ?? false)
	);
};

/** Whether no day of the month can be chosen for its bounds, e.g. a month before `minDate`. */
export const isMonthOutOfBounds = (
	month: Date,
	constraints: DateConstraints,
	today: Date,
): boolean => {
	const minimum: Date | undefined = constraints.disablePast === true ? today : constraints.minDate;

	const maximum: Date | undefined =
		constraints.disableFuture === true ? today : constraints.maxDate;

	return (
		(minimum !== undefined && isBefore(endOfMonth(month), startOfDay(minimum))) ||
		(maximum !== undefined && isAfter(startOfMonth(month), startOfDay(maximum)))
	);
};

/** The day the next click chooses: the start of a new range, or its end; an end before the start starts it over. */
export const nextRange = (range: DateRange, day: Date): DateRange => {
	if (range.start === null || range.end !== null) return { start: day, end: null };
	return isBefore(day, range.start) ? { start: day, end: null } : { start: range.start, end: day };
};

/** Whether a day is inside a range, its ends included; `hovered` stands for a missing end. */
export const isWithinRange = (day: Date, range: DateRange, hovered: Date | null): boolean => {
	const end: Date | null = range.end ?? hovered;
	if (range.start === null || end === null) return false;

	const [first, last]: [Date, Date] = isBefore(end, range.start)
		? [end, range.start]
		: [range.start, end];

	return !isBefore(day, startOfDay(first)) && !isAfter(startOfDay(day), startOfDay(last));
};

/** Whether a range is longer than `maxDays` days, both ends included. */
export const exceedsMaxDays = (range: DateRange, maxDays: number | undefined): boolean => {
	if (maxDays === undefined || range.start === null || range.end === null) return false;
	return differenceInCalendarDays(range.end, range.start) + 1 > maxDays;
};

export const isSameDate = (first: Date | null, second: Date | null): boolean => {
	return first !== null && second !== null && isSameDay(first, second);
};

/** The predefined dates of a `DatePicker`: today, tomorrow and in 7, 15, 30, 60 and 90 days. */
export const defaultDatePresets = (labels: DatePickerLabels): DatePreset[] => {
	return [
		{ label: labels.today, value: (today: Date): Date => today },
		{ label: labels.tomorrow, value: (today: Date): Date => addDays(today, 1) },
		...[7, 15, 30, 60, 90].map((count: number): DatePreset => {
			return { label: labels.inDays(count), value: (today: Date): Date => addDays(today, count) };
		}),
	];
};

/**
 * The predefined periods of a `DateRangePicker`: today, tomorrow, the next 7, 15, 30, 60 and 90 days (today
 * included), this month, and the next month, quarter and year.
 */
export const defaultRangePresets = (labels: DatePickerLabels): DateRangePreset[] => {
	const day = (shift: number): DateRangePreset['range'] => {
		return (today: Date): { start: Date; end: Date } => {
			return { start: addDays(today, shift), end: addDays(today, shift) };
		};
	};

	return [
		{ label: labels.today, range: day(0) },
		{ label: labels.tomorrow, range: day(1) },
		...[7, 15, 30, 60, 90].map((count: number): DateRangePreset => {
			return {
				label: labels.nextDays(count),
				range: (today: Date): { start: Date; end: Date } => {
					return { start: today, end: addDays(today, count - 1) };
				},
			};
		}),
		{
			label: labels.thisMonth,
			range: (today: Date): { start: Date; end: Date } => {
				return { start: startOfMonth(today), end: startOfDay(endOfMonth(today)) };
			},
		},
		{
			label: labels.followingMonth,
			range: (today: Date): { start: Date; end: Date } => {
				const month: Date = addMonths(today, 1);
				return { start: startOfMonth(month), end: startOfDay(endOfMonth(month)) };
			},
		},
		{
			label: labels.followingQuarter,
			range: (today: Date): { start: Date; end: Date } => {
				const quarter: Date = addQuarters(today, 1);
				return { start: startOfQuarter(quarter), end: startOfDay(endOfQuarter(quarter)) };
			},
		},
		{
			label: labels.followingYear,
			range: (today: Date): { start: Date; end: Date } => {
				const year: Date = addYears(today, 1);
				return { start: startOfYear(year), end: startOfDay(endOfYear(year)) };
			},
		},
	];
};
