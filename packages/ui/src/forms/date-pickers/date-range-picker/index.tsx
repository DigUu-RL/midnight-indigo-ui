'use client';
// Field of a range of dates with a panel of two months side by side: the first and the last day are typed in the
// field or chosen in the calendars, beside predefined periods, and applied by its footer.
import { styled } from '@mui/material/styles';
import { isAfter, isBefore, isSameDay, startOfDay, startOfMonth } from 'date-fns';
import type { Locale } from 'date-fns';
import { useId, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';

import { IconButton } from '#src/buttons/icon-button/index.tsx';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { CalendarView } from '#src/forms/date-pickers/calendar/calendar-view.tsx';
import {
	defaultRangePresets,
	emptyRange,
	exceedsMaxDays,
	isDayDisabled,
	isSameDate,
	isWithinRange,
	nextRange,
} from '#src/forms/date-pickers/calendar/dates.ts';
import type {
	DateConstraints,
	DateRange,
	DateRangePreset,
} from '#src/forms/date-pickers/calendar/dates.ts';
import type { DaySelection } from '#src/forms/date-pickers/calendar/month-grid.tsx';
import { PickerPanel } from '#src/forms/date-pickers/calendar/picker-panel.tsx';
import type { PanelPreset } from '#src/forms/date-pickers/calendar/picker-panel.tsx';
import { fieldPatternOf, fieldPlaceholderOf } from '#src/forms/date-pickers/date-format.ts';
import type { FieldPattern } from '#src/forms/date-pickers/date-format.ts';
import { usePickersLocale } from '#src/forms/date-pickers/date-pickers-provider/index.tsx';
import type { DatePickerLabels } from '#src/forms/date-pickers/labels.ts';
import {
	PickerInput,
	PickerPopup,
	PickerWrapper,
	usePickerLabels,
	usePickerState,
	usePickerValue,
} from '#src/forms/date-pickers/picker-field.tsx';
import type {
	PickerFieldProps,
	PickerInputProps,
	PickerState,
} from '#src/forms/date-pickers/picker-field.tsx';
import { useFormError } from '#src/forms/form-context.ts';
import { FormField, HiddenText } from '#src/forms/form-field/index.tsx';
import type { FormFieldControlProps } from '#src/forms/form-field/index.tsx';
import { InputFrame } from '#src/forms/input-frame/index.tsx';

const { text }: typeof themeVariables = themeVariables;

export interface DateRangePickerProps
	extends Omit<PickerFieldProps, 'name' | 'id'>, DateConstraints {
	/** Chosen range, when the parent controls it; either end is `null` until it is chosen. */
	value?: DateRange | undefined;
	/** Initial range when uncontrolled. */
	defaultValue?: DateRange | undefined;
	/** Called with the new range; an end typed in part is `null`. */
	onValueChange?: ((value: DateRange) => void) | undefined;
	/** Submitted with the text of the first day; inside a `Form`, its error is shown. */
	startName?: string | undefined;
	/** Submitted with the text of the last day; inside a `Form`, its error is shown. */
	endName?: string | undefined;
	/** Id of the field of the first day, the target of the label. */
	id?: string | undefined;
	/**
	 * Periods offered beside the calendars, or `false` for none. Defaults to today, tomorrow, the next 7, 15, 30, 60
	 * and 90 days, this month, and the next month, quarter and year, with the texts of `labels`.
	 */
	presets?: readonly DateRangePreset[] | false | undefined;
	/** Months shown side by side. Defaults to `2`. */
	calendars?: 1 | 2 | undefined;
	/** Most days of a range, both ends included: the days further from the start cannot be its end. */
	maxDays?: number | undefined;
}

const Separator = styled('span')({ flexShrink: 0, color: text.secondary });

// The frame is as wide as the two dates, not as the column: each date takes the width of its text, side by side. Where
// the browser sizes a field by its content, it does; elsewhere a date takes as many digits as its pattern has characters.
const Anchor = styled('div')({
	display: 'inline-flex',
	maxWidth: '100%',
	'& input': {
		flex: '0 1 auto',
		width: 'var(--picker-text-width)',
		'@supports (field-sizing: content)': { width: 'auto', fieldSizing: 'content' },
	},
});

const textWidthOf = (length: number): CSSProperties => {
	return { '--picker-text-width': `${String(length)}ch` } as CSSProperties;
};

/** The selection a day shows: alone, an end, inside, or inside the range the pointer would choose. */
const selectionIn = (day: Date, range: DateRange, hovered: Date | null): DaySelection => {
	const { start, end }: DateRange = range;
	if (start === null) return 'none';

	if (end === null) {
		if (isSameDay(day, start)) return 'selected';
		const previewing: boolean = hovered !== null && isAfter(hovered, start);
		return previewing && isWithinRange(day, range, hovered) ? 'preview' : 'none';
	}

	if (isSameDay(start, end)) return isSameDay(day, start) ? 'selected' : 'none';
	if (isSameDay(day, start)) return 'start';
	if (isSameDay(day, end)) return 'end';
	return isWithinRange(day, range, null) ? 'inside' : 'none';
};

/**
 * The first and the last day are two fields in one frame, named by the label and by `labels.start` and `labels.end`.
 * A click in either one opens the panel and keeps focus there; Down, or the button, moves focus into the calendars.
 * The first click on a day starts the range, the second ends it (a day before the start starts it over), and the
 * days between show the range the pointer would choose. The choice reaches the fields only with Apply; Cancel, Escape
 * or a click outside drop it. Must be inside `DatePickersProvider`.
 */
export const DateRangePicker = ({
	label,
	hideLabel,
	description,
	error,
	required = false,
	disabled = false,
	readOnly = false,
	startName,
	endName,
	id,
	size = 'medium',
	labels: labelOverrides,
	className,
	style,
	value,
	defaultValue = emptyRange,
	onValueChange,
	presets,
	calendars = 2,
	maxDays,
	minDate,
	maxDate,
	disablePast,
	disableFuture,
	shouldDisableDate,
}: DateRangePickerProps): ReactElement => {
	const locale: Locale = usePickersLocale();
	const labels: DatePickerLabels = usePickerLabels(labelOverrides);
	const popupId: string = useId();
	const labelId: string = useId();
	const startLabelId: string = useId();
	const endLabelId: string = useId();
	const endId: string = useId();
	const [current, setCurrent] = usePickerValue<DateRange>(value, defaultValue, onValueChange);
	const [draft, setDraft] = useState<DateRange>(current);
	const [hovered, setHovered] = useState<Date | null>(null);
	const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(current.start ?? new Date()));
	const today: Date = startOfDay(new Date());
	const pattern: FieldPattern = fieldPatternOf(locale, 'date', undefined);
	const startError: string | undefined = useFormError(startName);
	const endError: string | undefined = useFormError(endName);

	const constraints: DateConstraints = {
		minDate,
		maxDate,
		disablePast,
		disableFuture,
		shouldDisableDate,
	};

	const isDisabled = (day: Date): boolean => {
		const choosingEnd: boolean =
			draft.start !== null && draft.end === null && !isBefore(day, draft.start);

		const tooLong: boolean =
			choosingEnd && exceedsMaxDays({ start: draft.start, end: day }, maxDays);

		return isDayDisabled(day, constraints, today) || tooLong;
	};

	const state: PickerState = usePickerState(!disabled && !readOnly, (): void => {
		setDraft(current);
		setHovered(null);
		setVisibleMonth(startOfMonth(current.start ?? today));
	});

	const show = (range: DateRange): void => {
		setDraft(range);
		if (range.start !== null) setVisibleMonth(startOfMonth(range.start));
	};

	const commit = (range: DateRange): void => {
		setCurrent(range);
		show(range);
	};

	const panelPresets: PanelPreset[] = (
		presets === false ? [] : (presets ?? defaultRangePresets(labels))
	).map((preset: DateRangePreset): PanelPreset => {
		const { start, end }: { start: Date; end: Date } = preset.range(today);
		const range: DateRange = { start: startOfDay(start), end: startOfDay(end) };

		return {
			label: preset.label,
			active: isSameDate(draft.start, range.start) && isSameDate(draft.end, range.end),
			disabled:
				isDayDisabled(range.start ?? today, constraints, today) ||
				isDayDisabled(range.end ?? today, constraints, today) ||
				exceedsMaxDays(range, maxDays),
			onSelect: (): void => {
				show(range);
			},
		};
	});

	const complete: boolean = (draft.start === null) === (draft.end === null);
	const placeholder: string = fieldPlaceholderOf(pattern, labels, locale);
	const isAllowedDay = (day: Date): boolean => !isDayDisabled(day, constraints, today);

	return (
		<PickerWrapper state={state} className={className} style={style}>
			<FormField
				label={label}
				hideLabel={hideLabel}
				description={description}
				error={error ?? startError ?? endError}
				required={required}
				disabled={disabled}
				readOnly={readOnly}
				controlId={id}
				labelId={labelId}
			>
				{(control: FormFieldControlProps): ReactElement => {
					const inputProps: Omit<PickerInputProps, 'value' | 'isAllowed' | 'onCommit'> = {
						'aria-describedby': control['aria-describedby'],
						'aria-invalid': control['aria-invalid'],
						required,
						disabled,
						readOnly,
						role: 'combobox',
						'aria-haspopup': 'dialog',
						'aria-expanded': state.open,
						'aria-controls': state.open ? popupId : undefined,
						placeholder,
						fieldPattern: pattern,
						locale,
						reference: today,
						invalidMessage: labels.invalid,
						onClick: (): void => {
							state.openPanel(false);
						},
						onKeyDown: state.handleFieldKeyDown,
					};

					return (
						<Anchor ref={state.anchorReference} style={textWidthOf(pattern.length)}>
							<HiddenText id={startLabelId}>{labels.start}</HiddenText>
							<HiddenText id={endLabelId}>{labels.end}</HiddenText>

							<InputFrame
								controlId={control.id}
								size={size}
								invalid={control['aria-invalid'] === true}
								disabled={disabled}
								readOnly={readOnly}
								loading={false}
								actions={
									<IconButton
										label={labels.openCalendar}
										size='small'
										disabled={disabled || readOnly}
										aria-haspopup='dialog'
										aria-expanded={state.open}
										aria-controls={state.open ? popupId : undefined}
										onClick={(): void => {
											if (state.open) {
												state.closePanel(true);
												return;
											}

											state.openPanel(true);
										}}
									>
										<Glyph name='calendar' />
									</IconButton>
								}
							>
								<PickerInput
									{...inputProps}
									ref={state.inputReference}
									id={control.id}
									name={startName}
									aria-labelledby={`${labelId} ${startLabelId}`}
									value={current.start}
									isAllowed={isAllowedDay}
									onCommit={(start: Date | null): void => {
										commit({ start, end: current.end });
									}}
								/>

								<Separator aria-hidden='true'>–</Separator>

								<PickerInput
									{...inputProps}
									id={endId}
									name={endName}
									aria-labelledby={`${labelId} ${endLabelId}`}
									value={current.end}
									isAllowed={(day: Date): boolean => {
										return (
											isAllowedDay(day) && (current.start === null || !isBefore(day, current.start))
										);
									}}
									onCommit={(end: Date | null): void => {
										commit({ start: current.start, end });
									}}
								/>
							</InputFrame>
						</Anchor>
					);
				}}
			</FormField>

			<PickerPopup
				open={state.open}
				anchor={state.anchorReference.current}
				id={popupId}
				label={labels.rangeDialog}
				onEscape={(): void => {
					state.closePanel(true);
				}}
			>
				<PickerPanel
					presets={panelPresets}
					labels={labels}
					canApply={complete}
					canClear={draft.start !== null}
					onClear={(): void => {
						setDraft(emptyRange);
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
						initialFocusDay={draft.start ?? today}
						focusRequest={state.focusRequest}
						locale={locale}
						labels={labels}
						today={today}
						constraints={constraints}
						selectionOf={(day: Date): DaySelection => selectionIn(day, draft, hovered)}
						isDisabled={isDisabled}
						describeDay={(day: Date): string | undefined => {
							if (draft.end === null || isSameDate(draft.start, draft.end)) return undefined;
							if (isSameDate(day, draft.start)) return labels.rangeStart;
							return isSameDate(day, draft.end) ? labels.rangeEnd : undefined;
						}}
						onDayClick={(day: Date): void => {
							setDraft(nextRange(draft, day));
						}}
						onDayHover={setHovered}
					/>
				</PickerPanel>
			</PickerPopup>
		</PickerWrapper>
	);
};
