'use client';
// Time field with a panel of the lists of the hours and the minutes.
import { getHours, getMinutes, startOfDay } from 'date-fns';
import type { Locale } from 'date-fns';
import { useState } from 'react';
import type { ReactElement } from 'react';

import { PickerPanel } from '@/src/forms/date-pickers/calendar/picker-panel';
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

export interface TimePickerProps extends PickerFieldProps {
	/** Chosen time, when the parent controls it, on any day; `null` for none. */
	value?: Date | null | undefined;
	/** Initial time when uncontrolled. */
	defaultValue?: Date | null | undefined;
	/** Called with the new time, on the day of the value (else today), or `null` while the typed one is incomplete. */
	onValueChange?: ((value: Date | null) => void) | undefined;
	/** Earliest time that can be chosen; only its hours and minutes count. */
	minTime?: Date | undefined;
	/** Latest time that can be chosen; only its hours and minutes count. */
	maxTime?: Date | undefined;
	/** 12-hour clock with AM and PM (`true`) or 24-hour clock (`false`). Defaults to the clock of the locale. */
	ampm?: boolean | undefined;
	/** Minutes between two options of the list of the minutes. Defaults to `5`. */
	minuteStep?: number | undefined;
}

const minutesOfDay = (time: Date): number => getHours(time) * 60 + getMinutes(time);

/**
 * The time is typed (hours, minutes and, on a 12-hour clock, AM or PM) or chosen in lists that open from the field.
 * The 12 or 24-hour clock follows the locale unless `ampm` is set. The choice of the lists reaches the field only with
 * Apply. Must be inside `DatePickersProvider`.
 */
export const TimePicker = ({
	value,
	defaultValue = null,
	onValueChange,
	minTime,
	maxTime,
	ampm,
	minuteStep = 5,
	labels: labelOverrides,
	disabled = false,
	readOnly = false,
	...fieldProps
}: TimePickerProps): ReactElement => {
	const locale: Locale = usePickersLocale();
	const labels: DatePickerLabels = usePickerLabels(labelOverrides);
	const [current, setCurrent] = usePickerValue<Date | null>(value, defaultValue, onValueChange);
	const [draft, setDraft] = useState<Date | null>(current);
	const reference: Date = startOfDay(current ?? new Date());
	const pattern: FieldPattern = fieldPatternOf(locale, 'time', ampm);

	const isTimeDisabled = (time: Date): boolean => {
		return (
			(minTime !== undefined && minutesOfDay(time) < minutesOfDay(minTime)) ||
			(maxTime !== undefined && minutesOfDay(time) > minutesOfDay(maxTime))
		);
	};

	const state: PickerState = usePickerState(!disabled && !readOnly, (): void => {
		setDraft(current);
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
			reference={reference}
			isAllowed={(time: Date): boolean => !isTimeDisabled(time)}
			onCommit={(typed: Date | null): void => {
				setCurrent(typed);
				setDraft(typed);
			}}
			dialogLabel={labels.timeDialog}
			openLabel={labels.openTime}
			glyph='clock'
			panel={
				<PickerPanel
					presets={[]}
					labels={labels}
					canApply={draft === null || !isTimeDisabled(draft)}
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
					<TimeColumns
						value={draft}
						referenceDay={reference}
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
