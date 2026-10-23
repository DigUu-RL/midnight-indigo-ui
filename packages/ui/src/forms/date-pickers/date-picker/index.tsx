'use client';
// Date field with a calendar panel: the date is typed in the field or chosen in the panel, beside predefined dates,
// and applied by its footer.
import { isSameDay, startOfDay, startOfMonth } from 'date-fns';
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
import { fieldPatternOf } from '@/src/forms/date-pickers/date-format';
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

export interface DatePickerProps extends PickerFieldProps, DateConstraints {
	/** Chosen date, when the parent controls it; `null` for none. */
	value?: Date | null | undefined;
	/** Initial date when uncontrolled. */
	defaultValue?: Date | null | undefined;
	/** Called with the new date, or `null` when cleared or while the typed date is incomplete. */
	onValueChange?: ((value: Date | null) => void) | undefined;
	/**
	 * Dates offered beside the calendar, or `false` for none. Defaults to today, tomorrow and in 7, 15, 30, 60 and 90
	 * days, with the texts of `labels`.
	 */
	presets?: readonly DatePreset[] | false | undefined;
	/** Months shown side by side. Defaults to `1`. */
	calendars?: 1 | 2 | undefined;
}

/**
 * A click in the field opens the panel and keeps focus there, so the date can still be typed: its parts come in the
 * order of the locale and the separators by themselves. Down, or the button of the field, moves focus into the
 * calendar, whose grid moves with the arrow keys; the month and the year also have lists of their own. The choice of
 * the panel reaches the field only with Apply; Cancel, Escape or a click outside drop it. Must be inside
 * `DatePickersProvider`.
 */
export const DatePicker = ({
	value,
	defaultValue = null,
	onValueChange,
	presets,
	calendars = 1,
	minDate,
	maxDate,
	disablePast,
	disableFuture,
	shouldDisableDate,
	labels: labelOverrides,
	disabled = false,
	readOnly = false,
	...fieldProps
}: DatePickerProps): ReactElement => {
	const locale: Locale = usePickersLocale();
	const labels: DatePickerLabels = usePickerLabels(labelOverrides);
	const [current, setCurrent] = usePickerValue<Date | null>(value, defaultValue, onValueChange);
	const [draft, setDraft] = useState<Date | null>(current);
	const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(current ?? new Date()));
	const today: Date = startOfDay(new Date());
	const pattern: FieldPattern = fieldPatternOf(locale, 'date', undefined);

	const constraints: DateConstraints = {
		minDate,
		maxDate,
		disablePast,
		disableFuture,
		shouldDisableDate,
	};

	const isDisabled = (day: Date): boolean => isDayDisabled(day, constraints, today);

	const state: PickerState = usePickerState(!disabled && !readOnly, (): void => {
		setDraft(current);
		setVisibleMonth(startOfMonth(current ?? today));
	});

	const choose = (day: Date | null): void => {
		setDraft(day);
		if (day !== null) setVisibleMonth(startOfMonth(day));
	};

	const panelPresets: PanelPreset[] = (
		presets === false ? [] : (presets ?? defaultDatePresets(labels))
	).map((preset: DatePreset): PanelPreset => {
		const day: Date = startOfDay(preset.value(today));

		return {
			label: preset.label,
			active: isSameDate(draft, day),
			disabled: isDisabled(day),
			onSelect: (): void => {
				choose(day);
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
			isAllowed={(day: Date): boolean => !isDisabled(day)}
			onCommit={(typed: Date | null): void => {
				setCurrent(typed);
				// The panel shows what is typed while it is open.
				choose(typed);
			}}
			dialogLabel={labels.dialog}
			openLabel={labels.openCalendar}
			glyph='calendar'
			panel={
				<PickerPanel
					presets={panelPresets}
					labels={labels}
					canApply
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
						calendars={calendars}
						visibleMonth={visibleMonth}
						onVisibleMonthChange={setVisibleMonth}
						initialFocusDay={draft ?? today}
						focusRequest={state.focusRequest}
						locale={locale}
						labels={labels}
						today={today}
						constraints={constraints}
						selectionOf={(day: Date): DaySelection => {
							return draft !== null && isSameDay(day, draft) ? 'selected' : 'none';
						}}
						isDisabled={isDisabled}
						describeDay={(): undefined => undefined}
						onDayClick={choose}
						onDayHover={(): void => undefined}
					/>
				</PickerPanel>
			}
		/>
	);
};
