'use client';
// One month, or two side by side, each one under a header with the lists of its month and of its year; the arrows
// outside the headers show the months before and after. The keyboard moves one focused day across the months, as in
// the date picker dialog of the WAI-ARIA Authoring Practices: the arrows by day and by week, Home and End to the ends of
// the week, Page Up and Page Down by month, with Shift by year. A day out of view brings its month into view.
import { keyframes, styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles';
import {
	addDays,
	addMonths,
	addYears,
	differenceInCalendarMonths,
	endOfWeek,
	format,
	getMonth,
	getYear,
	isSameMonth,
	setMonth,
	setYear,
	startOfMonth,
	startOfWeek,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement, RefObject } from 'react';

import { IconButton } from '@/src/buttons/icon-button/index';
import { Glyph } from '@/src/shared/glyphs/index';
import { themeVariables } from '@/src/theme/theme-variables';
import { CalendarSelect } from '@/src/forms/date-pickers/calendar/calendar-select';
import type { CalendarSelectOption } from '@/src/forms/date-pickers/calendar/calendar-select';
import {
	isMonthOutOfBounds,
	monthNamesOf,
	weekStartOf,
} from '@/src/forms/date-pickers/calendar/dates';
import type { DateConstraints } from '@/src/forms/date-pickers/calendar/dates';
import { dayKeyOf, MonthGrid } from '@/src/forms/date-pickers/calendar/month-grid';
import type { DaySelection } from '@/src/forms/date-pickers/calendar/month-grid';
import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';

const { spacing, border, controlHeight, motion }: typeof themeVariables = themeVariables;

type Keyframes = ReturnType<typeof keyframes>;

/** Which way the months moved: toward the next ones, the previous ones, or not at all (the first render). */
type Slide = 'next' | 'previous' | 'none';

// The new days come in from the side the reader moves toward, a little way, as they fade in. The duration tokens are
// zero under reduced motion, which stops it.
const slideDistance: string = '0.75rem';

const fromRight: Keyframes = keyframes({
	from: { opacity: 0, transform: `translateX(${slideDistance})` },
});

const fromLeft: Keyframes = keyframes({
	from: { opacity: 0, transform: `translateX(-${slideDistance})` },
});

// The days slide inside their own column, never over the month beside it; the margin keeps room for the focus ring.
const SlideFrame = styled('div')({
	overflow: 'hidden',
	margin: `calc(-1 * ${spacing[1]})`,
	padding: spacing[1],
});

const SlidingDays = styled('div')({
	animationDuration: motion.duration.slow,
	// The standard curve spreads the movement over the whole duration, so the slide reads as one smooth move.
	animationTimingFunction: motion.easing.standard,
	'&[data-slide="from-right"]': { animationName: fromRight },
	'&[data-slide="from-left"]': { animationName: fromLeft },
});

export interface CalendarViewProps {
	/** Months side by side. */
	calendars: 1 | 2;
	/** First month in view. */
	visibleMonth: Date;
	onVisibleMonthChange: (month: Date) => void;
	/** The day focused first: the chosen one, else today. */
	initialFocusDay: Date;
	/** Moves focus to the focused day each time it changes, if above `0`. */
	focusRequest: number;
	locale: Locale;
	labels: DatePickerLabels;
	today: Date;
	constraints: DateConstraints;
	selectionOf: (day: Date) => DaySelection;
	isDisabled: (day: Date) => boolean;
	describeDay: (day: Date) => string | undefined;
	onDayClick: (day: Date) => void;
	onDayHover: (day: Date | null) => void;
}

const Months = styled('div')({
	display: 'flex',
	gap: spacing[4],
	'& > * + *': { paddingInlineStart: spacing[4], borderInlineStart: `1px solid ${border.subtle}` },
});

// Seven columns of 2.25rem: a month never stretches with the panel, nor shrinks under its days.
const Month = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[2],
	flex: '0 0 auto',
	width: '15.75rem',
});

const Header = styled('div')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[2],
	minHeight: controlHeight.small,
});

const Selects = styled('div')({ display: 'flex', gap: spacing[2], flex: '1 1 auto' });

/** Years offered from the start, and added each time the end of the list is in view. */
export const narrowScreenQuery: string = '(max-width: 40rem)';

const yearsPerLoad: number = 50;
const firstYearWithoutBound: number = 1900;

/** The day reached by a key of the grid, or `undefined` for a key it does not handle. */
const dayReachedBy = (
	event: KeyboardEvent<HTMLButtonElement>,
	day: Date,
	locale: Locale,
	rightToLeft: boolean,
): Date | undefined => {
	const forward: number = rightToLeft ? -1 : 1;
	const weekStartsOn: ReturnType<typeof weekStartOf> = weekStartOf(locale);

	const moves: Readonly<Record<string, () => Date>> = {
		ArrowRight: (): Date => addDays(day, forward),
		ArrowLeft: (): Date => addDays(day, -forward),
		ArrowDown: (): Date => addDays(day, 7),
		ArrowUp: (): Date => addDays(day, -7),
		Home: (): Date => startOfWeek(day, { weekStartsOn }),
		End: (): Date => endOfWeek(day, { weekStartsOn }),
		PageDown: (): Date => (event.shiftKey ? addYears(day, 1) : addMonths(day, 1)),
		PageUp: (): Date => (event.shiftKey ? addYears(day, -1) : addMonths(day, -1)),
	};

	return moves[event.key]?.();
};

export const CalendarView = ({
	calendars,
	visibleMonth,
	onVisibleMonthChange,
	initialFocusDay,
	focusRequest,
	locale,
	labels,
	today,
	constraints,
	selectionOf,
	isDisabled,
	describeDay,
	onDayClick,
	onDayHover,
}: CalendarViewProps): ReactElement => {
	const theme: Theme = useTheme();
	const [shownMonth, setShownMonth] = useState<Date>(visibleMonth);
	const [slide, setSlide] = useState<Slide>('none');

	// A change of the months in view sets the way they slide, during the render that shows them.
	if (!isSameMonth(shownMonth, visibleMonth)) {
		setShownMonth(visibleMonth);
		setSlide(differenceInCalendarMonths(visibleMonth, shownMonth) > 0 ? 'next' : 'previous');
	}

	// The next months come from the end of the line: the right, or the left in a right-to-left page.
	const fromRightSide: boolean = (slide === 'next') !== (theme.direction === 'rtl');

	const slideName: string | undefined =
		slide === 'none' ? undefined : fromRightSide ? 'from-right' : 'from-left';

	// Two months side by side do not fit a narrow screen: it shows one.
	const narrow: boolean = useMediaQuery(narrowScreenQuery);
	const shownCalendars: number = narrow ? 1 : calendars;
	const rootReference: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
	const [focusedDay, setFocusedDay] = useState<Date>(initialFocusDay);
	const [focusPending, setFocusPending] = useState<boolean>(false);

	useEffect((): void => {
		if (focusRequest > 0) setFocusPending(true);
	}, [focusRequest]);

	const months: Date[] = Array.from(
		{ length: shownCalendars },
		(_month: unknown, index: number): Date => {
			return addMonths(startOfMonth(visibleMonth), index);
		},
	);

	// A day out of the months in view (after a preset or a list moved them) gives focus to the first day in view.
	const inView: boolean = months.some((month: Date): boolean => isSameMonth(month, focusedDay));
	const shownFocus: Date = inView ? focusedDay : startOfMonth(visibleMonth);

	const minimumYear: number =
		constraints.disablePast === true
			? getYear(today)
			: constraints.minDate === undefined
				? Math.min(firstYearWithoutBound, getYear(visibleMonth))
				: getYear(constraints.minDate);

	const boundedMaximum: number | undefined =
		constraints.disableFuture === true
			? getYear(today)
			: constraints.maxDate === undefined
				? undefined
				: getYear(constraints.maxDate);

	const [loadedMaximum, setLoadedMaximum] = useState<number>(
		Math.max(getYear(today), getYear(visibleMonth)) + yearsPerLoad,
	);

	const maximumYear: number = boundedMaximum ?? Math.max(loadedMaximum, getYear(visibleMonth) + 1);

	useEffect((): void => {
		if (!focusPending) return;

		const button: HTMLButtonElement | null | undefined = rootReference.current?.querySelector(
			`[data-day="${dayKeyOf(shownFocus)}"]`,
		);

		button?.focus();
		setFocusPending(false);
	}, [focusPending, shownFocus]);

	const showMonthOf = (day: Date): void => {
		const first: Date = months[0] ?? visibleMonth;
		const offset: number = differenceInCalendarMonths(day, first);
		if (offset < 0) onVisibleMonthChange(startOfMonth(day));

		if (offset >= shownCalendars) {
			onVisibleMonthChange(addMonths(startOfMonth(day), 1 - shownCalendars));
		}
	};

	const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date): void => {
		const reached: Date | undefined = dayReachedBy(event, day, locale, theme.direction === 'rtl');
		if (reached === undefined) return;
		event.preventDefault();
		setFocusedDay(reached);
		showMonthOf(reached);
		setFocusPending(true);
	};

	const monthNames: string[] = monthNamesOf(locale);

	const previousDisabled: boolean = isMonthOutOfBounds(
		addMonths(visibleMonth, -1),
		constraints,
		today,
	);

	const nextDisabled: boolean = isMonthOutOfBounds(
		addMonths(visibleMonth, shownCalendars),
		constraints,
		today,
	);

	return (
		<Months ref={rootReference}>
			{months.map((month: Date, index: number): ReactElement => {
				const isFirst: boolean = index === 0;
				const isLast: boolean = index === months.length - 1;

				const showMonth = (shown: Date): void => {
					onVisibleMonthChange(addMonths(shown, -index));
				};

				return (
					<Month key={index}>
						<Header>
							{isFirst ? (
								<IconButton
									label={labels.previousMonth}
									size='small'
									disabled={previousDisabled}
									onClick={(): void => {
										onVisibleMonthChange(addMonths(visibleMonth, -1));
									}}
								>
									<Glyph name={theme.direction === 'rtl' ? 'chevronRight' : 'chevronLeft'} />
								</IconButton>
							) : null}

							<Selects>
								<CalendarSelect
									label={labels.month}
									count={12}
									selectedIndex={getMonth(month)}
									optionAt={(monthIndex: number): CalendarSelectOption => {
										return {
											label: monthNames[monthIndex] ?? '',
											disabled: isMonthOutOfBounds(setMonth(month, monthIndex), constraints, today),
										};
									}}
									onSelect={(monthIndex: number): void => {
										showMonth(setMonth(month, monthIndex));
									}}
								/>

								<CalendarSelect
									label={labels.year}
									count={maximumYear - minimumYear + 1}
									selectedIndex={getYear(month) - minimumYear}
									optionAt={(yearIndex: number): CalendarSelectOption => {
										return { label: String(minimumYear + yearIndex), disabled: false };
									}}
									onSelect={(yearIndex: number): void => {
										showMonth(setYear(month, minimumYear + yearIndex));
									}}
									onReachEnd={
										boundedMaximum === undefined
											? (): void => {
													setLoadedMaximum(maximumYear + yearsPerLoad);
												}
											: undefined
									}
								/>
							</Selects>

							{isLast ? (
								<IconButton
									label={labels.nextMonth}
									size='small'
									disabled={nextDisabled}
									onClick={(): void => {
										onVisibleMonthChange(addMonths(visibleMonth, 1));
									}}
								>
									<Glyph name={theme.direction === 'rtl' ? 'chevronLeft' : 'chevronRight'} />
								</IconButton>
							) : null}
						</Header>

						<SlideFrame>
							{/* A new key for each month restarts the animation as its days replace those of the last one. */}

							<SlidingDays key={dayKeyOf(month)} data-slide={slideName}>
								<MonthGrid
									month={month}
									locale={locale}
									label={format(month, 'LLLL yyyy', { locale })}
									today={today}
									focusedDay={shownFocus}
									selectionOf={selectionOf}
									isDisabled={isDisabled}
									describeDay={describeDay}
									onDayClick={(day: Date): void => {
										setFocusedDay(day);
										onDayClick(day);
									}}
									onDayHover={onDayHover}
									onDayKeyDown={handleDayKeyDown}
								/>
							</SlidingDays>
						</SlideFrame>
					</Month>
				);
			})}
		</Months>
	);
};
