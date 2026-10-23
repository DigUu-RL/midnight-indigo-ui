'use client';
// Field of an instant, a date and a time together, with a panel of a calendar beside the lists of the time.
import {
	getHours,
	getMinutes,
	isAfter,
	isBefore,
	isSameDay,
	setHours,
	setMinutes,
	startOfDay,
	startOfMinute,
	startOfMonth,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { useState } from 'react';
import type { ReactElement } from 'react';

import { CalendarView } from '@/src/forms/date-pickers/calendar/calendar-view';
import {
	defaultDatePresets,
	isDayDisabled,
	isSameDate,
} from '@/src/forms/date-pickers/calendar/dates';
import type { DateConstraints, DatePreset } from '@/src/forms/date-pickers/calendar/dates';
import type { DaySelection } from '@/src/forms/date-pickers/calendar/month-grid';
import { PickerPanel } from '@/src/forms/date-pickers/calendar/picker-panel';
import type { PanelPreset } from '@/src/forms/date-pickers/calendar/picker-panel';
import { TimeColumns } from '@/src/forms/date-pickers/calendar/time-columns';
import { fieldPatternOf, meridiemTextsOf } from '@/src/forms/date-pickers/date-format';
import type { FieldPattern } from '@/src/forms/date-pickers/date-format';
import { usePickersLocale } from '@/src/forms/date-pickers/date-pickers-provider/index';
import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';
import {
	usePickerLabels,
	usePickerState,
	usePickerValue,
} from '@/src/forms/date-pickers/picker-field';
import type { PickerFieldProps, PickerState } from '@/src/forms/date-pickers/picker-field';
import { SinglePicker } from '@/src/forms/date-pickers/single-picker';

export interface DateTimePickerProps extends PickerFieldProps, DateConstraints {
	/** Chosen instant, when the parent controls it; `null` for none. */
	value?: Date | null | undefined;
	/** Initial instant when uncontrolled. */
	defaultValue?: Date | null | undefined;
	/** Called with the new instant, or `null` when cleared or while the typed one is incomplete. */
	onValueChange?: ((value: Date | null) => void) | undefined;
	/** 12-hour clock with AM and PM (`true`) or 24-hour clock (`false`). Defaults to the clock of the locale. */
	ampm?: boolean | undefined;
	/** Minutes between two options of the list of the minutes. Defaults to `5`. */
	minuteStep?: number | undefined;
	/**
	 * Dates offered beside the calendar, which keep the chosen time, or `false` for none. Defaults to today, tomorrow
	 * and in 7, 15, 30, 60 and 90 days.
	 */
	presets?: readonly DatePreset[] | false | undefined;
}

/** The instant with the day of `day` and the time of `time`. */
const withTimeOf = (day: Date, time: Date): Date => {
	return setMinutes(setHours(startOfDay(day), getHours(time)), getMinutes(time));
};

/** Now, rounded down to a step of the minutes: the time of a day chosen before any time. */
const roundedNow = (minuteStep: number): Date => {
	const now: Date = startOfMinute(new Date());
	return setMinutes(now, getMinutes(now) - (getMinutes(now) % minuteStep));
};

/**
 * One field for an instant (e.g. a meeting): typed in the order of the locale, or chosen in a calendar and in the
 * lists of the hours and the minutes, side by side. `minDate` and `maxDate` bound the instant, not only the day. Use it
 * only when date and time belong together; otherwise a `DatePicker` and a `TimePicker` are simpler. Must be inside
 * `DatePickersProvider`.
 */
export const DateTimePicker = ({
	value,
	defaultValue = null,
	onValueChange,
	ampm,
	minuteStep = 5,
	presets,
	minDate,
	maxDate,
	disablePast = false,
	disableFuture = false,
	shouldDisableDate,
	labels: labelOverrides,
	disabled = false,
	readOnly = false,
	...fieldProps
}: DateTimePickerProps): ReactElement => {
	const locale: Locale = usePickersLocale();
	const labels: DatePickerLabels = usePickerLabels(labelOverrides);
	const [current, setCurrent] = usePickerValue<Date | null>(value, defaultValue, onValueChange);
	const [draft, setDraft] = useState<Date | null>(current);
	const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(current ?? new Date()));
	const now: Date = new Date();
	const today: Date = startOfDay(now);
	const pattern: FieldPattern = fieldPatternOf(locale, 'dateTime', ampm);

	const constraints: DateConstraints = {
		minDate,
		maxDate,
		disablePast,
		disableFuture,
		shouldDisableDate,
	};

	const isDisabled = (day: Date): boolean => isDayDisabled(day, constraints, today);

	const isTimeDisabled = (moment: Date): boolean => {
		return (
			(minDate !== undefined && isBefore(moment, minDate)) ||
			(maxDate !== undefined && isAfter(moment, maxDate)) ||
			(disablePast && isBefore(moment, startOfMinute(now))) ||
			(disableFuture && isAfter(moment, now))
		);
	};

	const isAllowed = (moment: Date): boolean => !isDisabled(moment) && !isTimeDisabled(moment);

	const state: PickerState = usePickerState(!disabled && !readOnly, (): void => {
		setDraft(current);
		setVisibleMonth(startOfMonth(current ?? today));
	});

	const chooseDay = (day: Date): void => {
		setDraft(withTimeOf(day, draft ?? roundedNow(minuteStep)));
		setVisibleMonth(startOfMonth(day));
	};

	const panelPresets: PanelPreset[] = (
		presets === false ? [] : (presets ?? defaultDatePresets(labels))
	).map((preset: DatePreset): PanelPreset => {
		const day: Date = startOfDay(preset.value(today));

		return {
			label: preset.label,
			active: draft !== null && isSameDay(draft, day),
			disabled: isDisabled(day),
			onSelect: (): void => {
				chooseDay(day);
			},
		};
	});

	return (
		<SinglePicker
			{...fieldProps}
			disabled={disabled}
			readOnly={readOnly}
			state={state}
			pattern={pattern}
			locale={locale}
			labels={labels}
			value={current}
			reference={today}
			isAllowed={isAllowed}
			onCommit={(typed: Date | null): void => {
				setCurrent(typed);
				setDraft(typed);
				if (typed !== null) setVisibleMonth(startOfMonth(typed));
			}}
			dialogLabel={labels.dialog}
			openLabel={labels.openCalendar}
			glyph='calendar'
			panel={
				<PickerPanel
					presets={panelPresets}
					labels={labels}
					canApply={draft === null || isAllowed(draft)}
					canClear={draft !== null}
					onClear={(): void => {
						setDraft(null);
					}}
					onCancel={(): void => {
						state.closePanel(true);
					}}
					onApply={(): void => {
						setCurrent(draft);
						state.closePanel(true);
					}}
				>
					<CalendarView
						calendars={1}
						visibleMonth={visibleMonth}
						onVisibleMonthChange={setVisibleMonth}
						initialFocusDay={draft ?? today}
						focusRequest={state.focusRequest}
						locale={locale}
						labels={labels}
						today={today}
						constraints={constraints}
						selectionOf={(day: Date): DaySelection => {
							return isSameDate(day, draft) ? 'selected' : 'none';
						}}
						isDisabled={isDisabled}
						describeDay={(): undefined => undefined}
						onDayClick={chooseDay}
						onDayHover={(): void => undefined}
					/>

					<TimeColumns
						value={draft}
						referenceDay={draft ?? today}
						onChange={setDraft}
						twelveHour={pattern.twelveHour}
						minuteStep={minuteStep}
						meridiemTexts={meridiemTextsOf(locale)}
						isTimeDisabled={isTimeDisabled}
						labels={labels}
					/>
				</PickerPanel>
			}
		/>
	);
};
