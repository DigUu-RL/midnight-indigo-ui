'use client';
// The days of one month, as a grid of weeks: a button per day, focused one at a time (the panel moves the focus with
// the keyboard), named by its full date. The days of the months around it are shown faded and are not buttons, so a
// day is never offered twice when two months are side by side.
import { styled } from '@mui/material/styles';
import { format, isSameDay, isSameMonth } from 'date-fns';
import type { Locale } from 'date-fns';
import { useMemo } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';

import { colorTransitionStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { weekdayNamesOf, weeksOfMonth } from '#src/forms/date-pickers/calendar/dates.ts';
import type { WeekdayName } from '#src/forms/date-pickers/calendar/dates.ts';
import { HiddenText } from '#src/forms/form-field/index.tsx';

const {
	spacing,
	typography,
	radius,
	text,
	state,
	intent,
	focus,
	fontWeight,
	controlHeight,
}: typeof themeVariables = themeVariables;

/**
 * How a day stands in the choice: chosen alone (also a range of one day, or a start without its end yet), an end of a
 * longer range, inside one, or inside the range the pointer would choose.
 */
export type DaySelection = 'selected' | 'start' | 'end' | 'inside' | 'preview' | 'none';

export interface MonthGridProps {
	month: Date;
	locale: Locale;
	/** Name of the grid, e.g. `October 2026`. */
	label: string;
	today: Date;
	/** The day that takes focus in the grid, if it is in this month. */
	focusedDay: Date;
	selectionOf: (day: Date) => DaySelection;
	isDisabled: (day: Date) => boolean;
	/** Text added to the name of a day, e.g. `start of the period`. */
	describeDay: (day: Date) => string | undefined;
	onDayClick: (day: Date) => void;
	onDayHover: (day: Date | null) => void;
	onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>, day: Date) => void;
}

/** Key of a day in the markup, to find its button. */
export const dayKeyOf = (day: Date): string => format(day, 'yyyy-MM-dd');

// Not the look of a data table of the native baseline: no header band, no rules between the weeks.
const Grid = styled('table')({
	'& thead': { backgroundColor: 'transparent', borderBlockEnd: 0 },
	'& tbody > tr + tr': { borderBlockStart: 0 },
	borderCollapse: 'separate',
	borderSpacing: `0 ${spacing[1]}`,
	tableLayout: 'fixed',
	width: '100%',
});

const WeekdayCell = styled('th')({
	backgroundColor: 'transparent',
	border: 0,
	paddingInline: 0,
	paddingBlock: spacing[1],
	...typography.caption,
	letterSpacing: 0,
	fontWeight: fontWeight.medium,
	color: text.secondary,
	textAlign: 'center',
	textTransform: 'lowercase',
	// A name longer than its column is cut, never drawn over the next one; the full name is read by its hidden text.
	overflow: 'hidden',
	textOverflow: 'clip',
	whiteSpace: 'nowrap',
});

// The band of a range joins the days of a week; at its ends it reaches the middle of the day only, on the inner side.
const bandStyles = {
	content: '""',
	position: 'absolute',
	insetBlock: 0,
	backgroundColor: intent.brand.container,
} as const;

const DayCell = styled('td')({
	position: 'relative',
	padding: 0,
	textAlign: 'center',
	'&[data-selection="inside"]': { backgroundColor: intent.brand.container },
	'&[data-selection="preview"]': { backgroundColor: state.hover },
	'&[data-selection="start"]::before': {
		...bandStyles,
		insetInlineStart: '50%',
		insetInlineEnd: 0,
	},
	'&[data-selection="end"]::before': { ...bandStyles, insetInlineStart: 0, insetInlineEnd: '50%' },
});

const DayButton = styled('button')({
	position: 'relative',
	boxSizing: 'border-box',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: controlHeight.small,
	height: controlHeight.small,
	padding: 0,
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: 'transparent',
	borderRadius: radius.control,
	backgroundColor: 'transparent',
	color: text.primary,
	...typography.bodySmall,
	fontVariantNumeric: 'tabular-nums',
	cursor: 'pointer',
	...colorTransitionStyles,
	'&:hover': { backgroundColor: state.hover },
	'&:focus-visible': { outline: `${focus.width} solid ${focus.ring}`, outlineOffset: '1px' },
	'&[aria-current="date"]': { borderColor: intent.brand.border, fontWeight: fontWeight.semibold },
	'&[data-selection="selected"], &[data-selection="start"], &[data-selection="end"]': {
		backgroundColor: intent.brand.main,
		borderColor: intent.brand.main,
		color: intent.brand.contrastText,
		fontWeight: fontWeight.semibold,
	},
	'&[aria-disabled="true"]': {
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		color: state.disabledText,
		textDecoration: 'line-through',
		cursor: 'not-allowed',
	},
});

const OutsideDay = styled('span')({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: controlHeight.small,
	height: controlHeight.small,
	...typography.bodySmall,
	fontVariantNumeric: 'tabular-nums',
	// Faded beside the days of the month, but still legible (4.5:1): they are text, not a disabled control.
	color: text.muted,
});

interface GridDay {
	day: Date;
	key: string;
	number: string;
	/** Full date, e.g. Wednesday, October 21st, 2026. */
	name: string;
	inMonth: boolean;
}

export const MonthGrid = ({
	month,
	locale,
	label,
	today,
	focusedDay,
	selectionOf,
	isDisabled,
	describeDay,
	onDayClick,
	onDayHover,
	onDayKeyDown,
}: MonthGridProps): ReactElement => {
	const monthKey: string = dayKeyOf(month);
	const weekdays: WeekdayName[] = useMemo((): WeekdayName[] => weekdayNamesOf(locale), [locale]);
	const focusInMonth: boolean = isSameMonth(focusedDay, month);

	// The days and their texts change with the month and the locale only, not as the pointer moves over them.
	const weeks: GridDay[][] = useMemo((): GridDay[][] => {
		return weeksOfMonth(month, locale).map((week: Date[]): GridDay[] => {
			return week.map((day: Date): GridDay => {
				return {
					day,
					key: dayKeyOf(day),
					number: format(day, 'd', { locale }),
					name: format(day, 'PPPP', { locale }),
					inMonth: isSameMonth(day, month),
				};
			});
		});
		// The key stands for the month, which is a new object at each render.
	}, [monthKey, locale]);

	return (
		<Grid
			role='grid'
			aria-label={label}
			onPointerLeave={(): void => {
				onDayHover(null);
			}}
		>
			<thead>
				<tr>
					{weekdays.map((weekday: WeekdayName): ReactElement => {
						return (
							<WeekdayCell key={weekday.long} scope='col'>
								<span aria-hidden='true'>{weekday.short}</span>
								<HiddenText>{weekday.long}</HiddenText>
							</WeekdayCell>
						);
					})}
				</tr>
			</thead>

			<tbody>
				{weeks.map((week: GridDay[]): ReactElement => {
					return (
						<tr key={week[0]?.key ?? monthKey}>
							{week.map(({ day, key, number, name, inMonth }: GridDay): ReactElement => {
								if (!inMonth) {
									return (
										<DayCell key={key}>
											<OutsideDay aria-hidden='true'>{number}</OutsideDay>
										</DayCell>
									);
								}

								const selection: DaySelection = selectionOf(day);
								const disabled: boolean = isDisabled(day);
								const description: string | undefined = describeDay(day);

								return (
									<DayCell
										key={key}
										role='gridcell'
										aria-selected={selection !== 'none' && selection !== 'preview'}
										data-selection={selection}
									>
										<DayButton
											type='button'
											data-day={key}
											data-selection={selection}
											tabIndex={focusInMonth && isSameDay(day, focusedDay) ? 0 : -1}
											aria-current={isSameDay(day, today) ? 'date' : undefined}
											aria-disabled={disabled ? true : undefined}
											aria-label={[name, description]
												.filter((part: string | undefined): boolean => part !== undefined)
												.join(', ')}
											onClick={(): void => {
												if (!disabled) onDayClick(day);
											}}
											onPointerEnter={(): void => {
												onDayHover(disabled ? null : day);
											}}
											onKeyDown={(event: KeyboardEvent<HTMLButtonElement>): void => {
												onDayKeyDown(event, day);
											}}
										>
											{number}
										</DayButton>
									</DayCell>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</Grid>
	);
};
