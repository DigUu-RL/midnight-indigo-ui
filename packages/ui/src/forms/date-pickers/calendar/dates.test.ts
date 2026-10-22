import { enUS } from 'date-fns/locale/en-US';
import { ptBR } from 'date-fns/locale/pt-BR';
import { describe, expect, it } from 'vitest';

import {
	defaultDatePresets,
	defaultRangePresets,
	exceedsMaxDays,
	isDayDisabled,
	isMonthOutOfBounds,
	nextRange,
	weekdayNamesOf,
	weeksOfMonth,
} from '#src/forms/date-pickers/calendar/dates.ts';
import type {
	DateRange,
	DateRangePreset,
	WeekdayName,
} from '#src/forms/date-pickers/calendar/dates.ts';
import { defaultDatePickerLabels } from '#src/forms/date-pickers/labels.ts';

const today: Date = new Date(2026, 9, 21);

describe('the calendar', (): void => {
	it('shows six weeks from the first day of the week of the locale', (): void => {
		const weeks: Date[][] = weeksOfMonth(new Date(2026, 9, 1), enUS);

		expect(weeks).toHaveLength(6);
		expect(weeks[0]?.[0]).toEqual(new Date(2026, 8, 27));

		expect(weekdayNamesOf(ptBR).map((weekday: WeekdayName): string => weekday.short)).toEqual([
			'dom',
			'seg',
			'ter',
			'qua',
			'qui',
			'sex',
			'sab',
		]);

		expect(weekdayNamesOf(enUS)[0]?.short).toBe('Sun');
		expect(weekdayNamesOf(enUS)[1]?.long).toBe('Monday');
	});

	it('leaves out the days the constraints exclude', (): void => {
		const weekend = (day: Date): boolean => day.getDay() === 0 || day.getDay() === 6;

		expect(isDayDisabled(new Date(2026, 9, 20), { disablePast: true }, today)).toBe(true);
		expect(isDayDisabled(today, { disablePast: true }, today)).toBe(false);
		expect(isDayDisabled(new Date(2026, 9, 24), { shouldDisableDate: weekend }, today)).toBe(true);

		expect(
			isDayDisabled(new Date(2026, 9, 31), { maxDate: new Date(2026, 9, 30, 18) }, today),
		).toBe(true);

		expect(
			isDayDisabled(new Date(2026, 9, 30), { maxDate: new Date(2026, 9, 30, 18) }, today),
		).toBe(false);

		expect(isMonthOutOfBounds(new Date(2026, 8, 1), { disablePast: true }, today)).toBe(true);
		expect(isMonthOutOfBounds(new Date(2026, 9, 1), { disablePast: true }, today)).toBe(false);
	});
});

describe('a range', (): void => {
	it('starts with a click, ends with the next one, and starts over before its start', (): void => {
		const started: DateRange = nextRange({ start: null, end: null }, today);
		expect(started).toEqual({ start: today, end: null });

		const ended: DateRange = nextRange(started, new Date(2026, 9, 25));
		expect(ended).toEqual({ start: today, end: new Date(2026, 9, 25) });

		expect(nextRange(ended, new Date(2026, 10, 2))).toEqual({
			start: new Date(2026, 10, 2),
			end: null,
		});

		expect(nextRange(started, new Date(2026, 9, 1))).toEqual({
			start: new Date(2026, 9, 1),
			end: null,
		});
	});

	it('counts both ends against its longest length', (): void => {
		expect(exceedsMaxDays({ start: today, end: new Date(2026, 9, 27) }, 7)).toBe(false);
		expect(exceedsMaxDays({ start: today, end: new Date(2026, 9, 28) }, 7)).toBe(true);
	});
});

describe('the presets', (): void => {
	it('offer today, tomorrow and some days ahead', (): void => {
		expect(
			defaultDatePresets(defaultDatePickerLabels).map((preset): string => preset.label),
		).toEqual([
			'Today',
			'Tomorrow',
			'In 7 days',
			'In 15 days',
			'In 30 days',
			'In 60 days',
			'In 90 days',
		]);
	});

	it('offer periods that include today, and the months, quarter and year ahead', (): void => {
		const presets: DateRangePreset[] = defaultRangePresets(defaultDatePickerLabels);

		const rangeOf = (label: string): { start: Date; end: Date } | undefined => {
			return presets
				.find((preset: DateRangePreset): boolean => preset.label === label)
				?.range(today);
		};

		expect(rangeOf('Next 7 days')).toEqual({ start: today, end: new Date(2026, 9, 27) });

		expect(rangeOf('This month')).toEqual({
			start: new Date(2026, 9, 1),
			end: new Date(2026, 9, 31),
		});

		expect(rangeOf('Next quarter')).toEqual({
			start: new Date(2027, 0, 1),
			end: new Date(2027, 2, 31),
		});

		expect(rangeOf('Next year')).toEqual({
			start: new Date(2027, 0, 1),
			end: new Date(2027, 11, 31),
		});
	});
});
