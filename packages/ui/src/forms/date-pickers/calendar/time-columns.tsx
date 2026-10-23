'use client';
// The lists of a time, side by side: hours, minutes and, on a 12-hour clock, AM or PM. Each one is a listbox whose
// choice follows the arrows (`aria-activedescendant`), as in the WAI-ARIA Authoring Practices for a single-select list.
import { styled } from '@mui/material/styles';
import { getHours, getMinutes, setHours, setMinutes, startOfMinute } from 'date-fns';
import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactElement, RefObject } from 'react';

import { scrollbarStyles } from '@/src/theme/native-styles';
import { themeVariables } from '@/src/theme/theme-variables';
import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';

const {
	spacing,
	typography,
	radius,
	text,
	state,
	border,
	intent,
	focus,
	fontWeight,
}: typeof themeVariables = themeVariables;

interface TimeOption {
	value: number;
	label: string;
	disabled: boolean;
}

const Columns = styled('div')({
	display: 'flex',
	gap: spacing[1],
	blockSize: '100%',
	minBlockSize: '16rem',
	maxBlockSize: '19rem',
});

const List = styled('div')({
	...scrollbarStyles,
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	overflowY: 'auto',
	paddingInline: spacing[1],
	paddingBlock: spacing[1],
	borderRadius: radius.control,
	outline: 'none',
	'&:focus-visible': { outline: `${focus.width} solid ${focus.ring}`, outlineOffset: '1px' },
	'& + &': { borderInlineStart: `1px solid ${border.subtle}` },
});

const Option = styled('div')({
	flexShrink: 0,
	minInlineSize: '2.75rem',
	paddingBlock: spacing[1],
	paddingInline: spacing[2],
	borderRadius: radius.controlSmall,
	...typography.bodySmall,
	fontVariantNumeric: 'tabular-nums',
	textAlign: 'center',
	color: text.primary,
	cursor: 'pointer',
	'&:hover': { backgroundColor: state.hover },
	'&[aria-selected="true"]': {
		backgroundColor: intent.brand.main,
		color: intent.brand.contrastText,
		fontWeight: fontWeight.semibold,
	},
	'&[aria-disabled="true"]': { color: state.disabledText, cursor: 'not-allowed' },
});

interface TimeListProps {
	label: string;
	options: readonly TimeOption[];
	selected: number | null;
	onSelect: (value: number) => void;
}

const TimeList = ({ label, options, selected, onSelect }: TimeListProps): ReactElement => {
	const listId: string = useId();
	const listReference: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

	const selectedIndex: number = options.findIndex(
		(option: TimeOption): boolean => option.value === selected,
	);

	const optionIdOf = (index: number): string => `${listId}-${String(index)}`;

	// The chosen option stays in view as the arrows move it.
	useEffect((): void => {
		const list: HTMLDivElement | null = listReference.current;
		const element: Element | undefined = list?.children[selectedIndex];
		if (list === null || !(element instanceof HTMLElement)) return;
		const bottom: number = element.offsetTop + element.offsetHeight;
		if (element.offsetTop < list.scrollTop) list.scrollTop = element.offsetTop;
		if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
	}, [selectedIndex]);

	const move = (from: number, step: number): void => {
		const enabled: number[] = options
			.map((option: TimeOption, index: number): number => (option.disabled ? -1 : index))
			.filter((index: number): boolean => index !== -1);

		if (enabled.length === 0) return;
		const position: number = enabled.indexOf(from);

		const next: number =
			position === -1
				? (enabled[step > 0 ? 0 : enabled.length - 1] ?? 0)
				: (enabled[Math.min(Math.max(position + step, 0), enabled.length - 1)] ?? 0);

		onSelect(options[next]?.value ?? 0);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		const steps: Readonly<Record<string, number>> = {
			ArrowDown: 1,
			ArrowUp: -1,
			PageDown: 5,
			PageUp: -5,
			Home: -options.length,
			End: options.length,
		};

		const step: number | undefined = steps[event.key];
		if (step === undefined) return;
		event.preventDefault();
		move(selectedIndex, step);
	};

	return (
		<List
			ref={listReference}
			role='listbox'
			tabIndex={0}
			aria-label={label}
			aria-activedescendant={selectedIndex === -1 ? undefined : optionIdOf(selectedIndex)}
			onKeyDown={handleKeyDown}
		>
			{options.map((option: TimeOption, index: number): ReactElement => {
				return (
					<Option
						key={option.value}
						id={optionIdOf(index)}
						role='option'
						aria-selected={option.value === selected}
						aria-disabled={option.disabled ? true : undefined}
						onClick={(): void => {
							if (!option.disabled) onSelect(option.value);
							listReference.current?.focus();
						}}
					>
						{option.label}
					</Option>
				);
			})}
		</List>
	);
};

export interface TimeColumnsProps {
	value: Date | null;
	/** The day of a time chosen while there is no value. */
	referenceDay: Date;
	onChange: (value: Date) => void;
	twelveHour: boolean;
	/** Minutes between two options. Defaults to `5`. */
	minuteStep: number;
	meridiemTexts: readonly [string, string];
	isTimeDisabled: (time: Date) => boolean;
	labels: DatePickerLabels;
}

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export const TimeColumns = ({
	value,
	referenceDay,
	onChange,
	twelveHour,
	minuteStep,
	meridiemTexts,
	isTimeDisabled,
	labels,
}: TimeColumnsProps): ReactElement => {
	const base: Date = startOfMinute(value ?? setMinutes(setHours(referenceDay, 0), 0));
	const hours: number | null = value === null ? null : getHours(value);
	const minutes: number | null = value === null ? null : getMinutes(value);
	const afternoon: boolean = (hours ?? 0) >= 12;

	const withHours = (hour: number): Date => setHours(base, hour);

	const hourOptions: TimeOption[] = twelveHour
		? Array.from({ length: 12 }, (_hour: unknown, index: number): TimeOption => {
				const hour: number = (index === 0 ? 0 : index) + (afternoon ? 12 : 0);
				return {
					value: hour,
					label: twoDigits(index === 0 ? 12 : index),
					disabled: isTimeDisabled(withHours(hour)),
				};
			})
		: Array.from({ length: 24 }, (_hour: unknown, hour: number): TimeOption => {
				return { value: hour, label: twoDigits(hour), disabled: isTimeDisabled(withHours(hour)) };
			});

	const minuteOptions: TimeOption[] = Array.from(
		{ length: Math.ceil(60 / minuteStep) },
		(_minute: unknown, index: number): TimeOption => {
			const minute: number = index * minuteStep;
			return {
				value: minute,
				label: twoDigits(minute),
				disabled: isTimeDisabled(setMinutes(base, minute)),
			};
		},
	);

	const [morning, evening]: readonly [string, string] = meridiemTexts;

	return (
		<Columns>
			<TimeList
				label={labels.hours}
				options={hourOptions}
				selected={hours}
				onSelect={(hour: number): void => {
					onChange(withHours(hour));
				}}
			/>

			<TimeList
				label={labels.minutes}
				options={minuteOptions}
				// A minute between two steps keeps no option chosen until one is.
				selected={minutes}
				onSelect={(minute: number): void => {
					onChange(setMinutes(base, minute));
				}}
			/>

			{twelveHour ? (
				<TimeList
					label={labels.meridiem}
					options={[
						{ value: 0, label: morning, disabled: false },
						{ value: 1, label: evening, disabled: false },
					]}
					selected={value === null ? null : afternoon ? 1 : 0}
					onSelect={(half: number): void => {
						const hour: number = getHours(base) % 12;
						onChange(setHours(base, hour + (half === 1 ? 12 : 0)));
					}}
				/>
			) : null}
		</Columns>
	);
};
