'use client';
// A button that opens a list to choose one option, in the header of a calendar: the month or the year. Only the options
// in view are rendered, so the list of the years can grow as it is scrolled down, without an end unless the calendar
// has one. It follows the select-only combobox pattern of the WAI-ARIA Authoring Practices: focus moves into the
// listbox, the arrows move the active option (`aria-activedescendant`), Enter or Space chooses it, Escape closes.
import { styled } from '@mui/material/styles';
import { useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, ReactElement, RefObject, UIEvent } from 'react';

import { colorTransitionStyles, focusRingStyles } from '@/src/shared/appearance';
import { Glyph } from '@/src/shared/glyphs/index';
import { scrollbarStyles } from '@/src/theme/native-styles';
import { themeVariables } from '@/src/theme/theme-variables';
import { HiddenText } from '@/src/forms/form-field/index';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	border,
	state,
	elevation,
	fontWeight,
	controlHeight,
}: typeof themeVariables = themeVariables;

export interface CalendarSelectOption {
	label: string;
	disabled: boolean;
}

export interface CalendarSelectProps {
	/** Name of the list, e.g. `'Year'`. */
	label: string;
	/** Number of the options known so far. */
	count: number;
	optionAt: (index: number) => CalendarSelectOption;
	selectedIndex: number;
	onSelect: (index: number) => void;
	/** Called when the end of the list is in view, to add options to it. */
	onReachEnd?: (() => void) | undefined;
}

/** In pixels: the rendered window and the scroll position are counted in rows. */
const rowHeight: number = 32;
const visibleRows: number = 7;
const overscanRows: number = 3;
/** Rows from the end at which `onReachEnd` is called. */
const endThreshold: number = 4;
const typeaheadDelay: number = 700;

const Root = styled('span')({ position: 'relative', display: 'inline-flex' });

const Trigger = styled('button')({
	display: 'inline-flex',
	alignItems: 'center',
	gap: spacing[1],
	minHeight: controlHeight.small,
	paddingInline: spacing[2],
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: border.default,
	borderRadius: radius.controlSmall,
	backgroundColor: surface.field,
	color: text.primary,
	...typography.bodySmall,
	fontWeight: fontWeight.medium,
	textTransform: 'capitalize',
	cursor: 'pointer',
	...colorTransitionStyles,
	...focusRingStyles,
	'&:hover': { borderColor: text.muted },
	'& > svg': { width: '1em', height: '1em', color: text.secondary },
});

const Listbox = styled('div')({
	...scrollbarStyles,
	position: 'absolute',
	insetBlockStart: `calc(100% + ${spacing[1]})`,
	insetInlineStart: 0,
	zIndex: 2,
	boxSizing: 'content-box',
	minWidth: '100%',
	height: `${String(rowHeight * visibleRows)}px`,
	overflowY: 'auto',
	padding: spacing[1],
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: border.default,
	borderRadius: radius.overlay,
	backgroundColor: surface.overlay,
	boxShadow: elevation.overlay,
	outline: 'none',
	'&:focus-visible': { borderColor: text.muted },
});

const Option = styled('div')({
	position: 'absolute',
	insetInline: spacing[1],
	display: 'flex',
	alignItems: 'center',
	height: `${String(rowHeight)}px`,
	paddingInline: spacing[2],
	borderRadius: radius.controlSmall,
	...typography.bodySmall,
	color: text.primary,
	textTransform: 'capitalize',
	whiteSpace: 'nowrap',
	cursor: 'pointer',
	'&[data-active="true"]': { backgroundColor: state.hover },
	'&[aria-selected="true"]': { backgroundColor: state.selected, fontWeight: fontWeight.semibold },
	'&[aria-disabled="true"]': { color: state.disabledText, cursor: 'not-allowed' },
});

const clamp = (index: number, count: number): number => Math.min(Math.max(index, 0), count - 1);

export const CalendarSelect = ({
	label,
	count,
	optionAt,
	selectedIndex,
	onSelect,
	onReachEnd,
}: CalendarSelectProps): ReactElement => {
	const listId: string = useId();
	const labelId: string = useId();
	const valueId: string = useId();
	const triggerReference: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);
	const listReference: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
	const typeahead: RefObject<{ text: string; time: number }> = useRef({ text: '', time: 0 });
	const [open, setOpen] = useState<boolean>(false);
	const [activeIndex, setActiveIndex] = useState<number>(selectedIndex);
	const [scrollTop, setScrollTop] = useState<number>(0);

	const scrollTo = (index: number, centered: boolean): void => {
		const list: HTMLDivElement | null = listReference.current;
		if (list === null) return;
		const top: number = index * rowHeight;
		const viewport: number = rowHeight * visibleRows;

		list.scrollTop = centered
			? top - (viewport - rowHeight) / 2
			: Math.min(Math.max(list.scrollTop, top + rowHeight - viewport), top);

		setScrollTop(list.scrollTop);
	};

	// On open, the list takes focus with the chosen option active and in the middle of the view.
	useEffect((): void => {
		if (!open) return;
		listReference.current?.focus();
		scrollTo(selectedIndex, true);
		// Only when it opens: the selected index does not change while it is open.
	}, [open]);

	const close = (returnFocus: boolean): void => {
		setOpen(false);
		if (returnFocus) triggerReference.current?.focus();
	};

	const choose = (index: number): void => {
		if (optionAt(index).disabled) return;
		onSelect(index);
		close(true);
	};

	const activate = (index: number): void => {
		const next: number = clamp(index, count);
		setActiveIndex(next);
		scrollTo(next, false);
		if (next >= count - endThreshold) onReachEnd?.();
	};

	const findByText = (typed: string): number => {
		const query: string = typed.toLocaleLowerCase();

		return (
			Array.from({ length: count }, (_option: unknown, index: number): number => index).find(
				(index: number): boolean => optionAt(index).label.toLocaleLowerCase().startsWith(query),
			) ?? -1
		);
	};

	const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		const moves: Readonly<Record<string, number>> = {
			ArrowDown: activeIndex + 1,
			ArrowUp: activeIndex - 1,
			PageDown: activeIndex + visibleRows,
			PageUp: activeIndex - visibleRows,
			Home: 0,
			End: count - 1,
		};

		const move: number | undefined = moves[event.key];

		if (move !== undefined) {
			event.preventDefault();
			activate(move);
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			choose(activeIndex);
			return;
		}

		if (event.key === 'Escape') {
			// The list closes; the panel around it stays open.
			event.preventDefault();
			event.stopPropagation();
			close(true);
			return;
		}

		if (event.key === 'Tab') {
			close(false);
			return;
		}

		if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
		const now: number = Date.now();

		const previous: string =
			now - typeahead.current.time < typeaheadDelay ? typeahead.current.text : '';

		typeahead.current = { text: `${previous}${event.key}`, time: now };
		const found: number = findByText(typeahead.current.text);
		if (found !== -1) activate(found);
	};

	const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
		const top: number = event.currentTarget.scrollTop;
		setScrollTop(top);
		const lastInView: number = Math.ceil((top + rowHeight * visibleRows) / rowHeight);
		if (lastInView >= count - endThreshold) onReachEnd?.();
	};

	const handleBlur = (event: FocusEvent<HTMLSpanElement>): void => {
		if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
	};

	const first: number = Math.max(Math.floor(scrollTop / rowHeight) - overscanRows, 0);
	const last: number = Math.min(first + visibleRows + overscanRows * 2, count - 1);
	const optionIdOf = (index: number): string => `${listId}-${String(index)}`;

	return (
		<Root onBlur={handleBlur}>
			<HiddenText id={labelId}>{label}</HiddenText>

			<Trigger
				ref={triggerReference}
				type='button'
				aria-haspopup='listbox'
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				aria-labelledby={`${labelId} ${valueId}`}
				onClick={(): void => {
					setActiveIndex(selectedIndex);
					setOpen(!open);
				}}
				onKeyDown={(event: KeyboardEvent<HTMLButtonElement>): void => {
					if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
					event.preventDefault();
					setActiveIndex(selectedIndex);
					setOpen(true);
				}}
			>
				<span id={valueId}>{optionAt(selectedIndex).label}</span>
				<Glyph name='chevronDown' />
			</Trigger>

			{open ? (
				<Listbox
					ref={listReference}
					id={listId}
					role='listbox'
					// A region that scrolls is reached by the keyboard; focus moves here as the list opens.
					tabIndex={0}
					aria-labelledby={labelId}
					aria-activedescendant={optionIdOf(activeIndex)}
					onKeyDown={handleListKeyDown}
					onScroll={handleScroll}
				>
					<div style={{ position: 'relative', height: `${String(count * rowHeight)}px` }}>
						{Array.from(
							{ length: Math.max(last - first + 1, 0) },
							(_option: unknown, offset: number): ReactElement => {
								const index: number = first + offset;
								const option: CalendarSelectOption = optionAt(index);

								return (
									<Option
										key={index}
										id={optionIdOf(index)}
										role='option'
										aria-selected={index === selectedIndex}
										aria-disabled={option.disabled ? true : undefined}
										// A list that grows has no known size yet.
										aria-setsize={onReachEnd === undefined ? count : -1}
										aria-posinset={index + 1}
										data-active={index === activeIndex}
										style={{ top: `${String(index * rowHeight)}px` }}
										onPointerMove={(): void => {
											setActiveIndex(index);
										}}
										onClick={(): void => {
											choose(index);
										}}
									>
										{option.label}
									</Option>
								);
							},
						)}
					</div>
				</Listbox>
			) : null}
		</Root>
	);
};
