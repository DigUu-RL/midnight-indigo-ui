'use client';
// The pieces shared by the pickers: the props they take like the other fields, the text input that formats what is
// typed in the pattern of the locale, the panel anchored under the field, and the state that opens it, applies its
// choice or drops it.
import Popper from '@mui/material/Popper';
import type { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	FocusEvent,
	KeyboardEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import type { Locale } from 'date-fns';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import type { ControlSize } from '@/src/shared/appearance';
import { mergeReferences } from '@/src/shared/merge-references';
import { themeVariables } from '@/src/theme/theme-variables';
import { anchoredSurfaceStyles } from '@/src/feedback/anchored-overlay/index';
import {
	formatFieldValue,
	hasMeridiem,
	maskFieldText,
	parseFieldText,
} from '@/src/forms/date-pickers/date-format';
import type { FieldPattern } from '@/src/forms/date-pickers/date-format';
import { defaultDatePickerLabels } from '@/src/forms/date-pickers/labels';
import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';
import { TextInput } from '@/src/forms/input-frame/index';

const { layer }: typeof themeVariables = themeVariables;

/** Props of the pickers that follow the other fields of the library. */
export interface PickerFieldProps {
	/** Visible, persistent label; a placeholder never replaces it. */
	label: ReactNode;
	/** Keeps the label for assistive technologies only, when the context already shows it (e.g. a filter bar). */
	hideLabel?: boolean | undefined;
	/** Help text, read after the label. */
	description?: ReactNode;
	/** Error message, shown with an icon; inside a `Form`, the error of `name` is used when omitted. */
	error?: ReactNode;
	/** Marks the label with an asterisk and the control as `required`. */
	required?: boolean | undefined;
	/** Unavailable: skipped by Tab and not submitted. */
	disabled?: boolean | undefined;
	/** Focusable and submitted, but not editable: the panel does not open. */
	readOnly?: boolean | undefined;
	/** Submitted with the text of the field, as it is shown. */
	name?: string | undefined;
	/** Id of the field, the target of its label. */
	id?: string | undefined;
	/** 32, 40 or 48 px high, like the buttons. Defaults to `'medium'`. */
	size?: ControlSize | undefined;
	/** Overrides some or all of `defaultDatePickerLabels`. */
	labels?: Partial<DatePickerLabels> | undefined;
	/** Class of the root of the field. */
	className?: string | undefined;
	/** Style of the root of the field. */
	style?: CSSProperties | undefined;
}

export const usePickerLabels = (
	labels: Partial<DatePickerLabels> | undefined,
): DatePickerLabels => {
	return useComponentLabels('datePicker', defaultDatePickerLabels, labels);
};

export const isSameMoment = (first: Date | null, second: Date | null): boolean => {
	return (
		first === second || (first !== null && second !== null && first.getTime() === second.getTime())
	);
};

/** A value the parent controls, or one the picker keeps when uncontrolled. */
export const usePickerValue = <Value extends object | null>(
	value: Value | undefined,
	defaultValue: Value,
	onValueChange: ((value: Value) => void) | undefined,
): [Value, (value: Value) => void] => {
	const [uncontrolled, setUncontrolled] = useState<Value>(defaultValue);
	// `null` is a value the parent controls (no date), so only `undefined` leaves the value to the picker.
	const controlled: boolean = value !== undefined;

	return [
		controlled ? (value as Value) : uncontrolled,
		(next: Value): void => {
			if (!controlled) setUncontrolled(next);
			onValueChange?.(next);
		},
	];
};

export interface PickerInputProps extends Omit<
	ComponentPropsWithRef<'input'>,
	'value' | 'defaultValue' | 'onChange' | 'size' | 'pattern'
> {
	fieldPattern: FieldPattern;
	locale: Locale;
	value: Date | null;
	/** The day of a time typed alone. */
	reference: Date;
	/** Whether a complete text names a moment that can be chosen. */
	isAllowed: (value: Date) => boolean;
	/** Called with the value of the text: a moment once it is complete and allowed, else `null`. */
	onCommit: (value: Date | null) => void;
	/** Validation message while the text is not a moment that can be chosen. */
	invalidMessage: string;
}

/**
 * The text of a picker. The parts are typed as digits and the separators come by themselves; the value changes only
 * when the text is complete and allowed (`null` until then), and the text follows a value set from elsewhere, e.g.
 * the panel. While the text is not a moment that can be chosen, the input is invalid, so a `Form` reports it.
 */
export const PickerInput = ({
	fieldPattern: pattern,
	locale,
	value,
	reference,
	isAllowed,
	onCommit,
	invalidMessage,
	ref,
	...attributes
}: PickerInputProps): ReactElement => {
	const inputReference: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
	const formatted: string = value === null ? '' : formatFieldValue(value, pattern, locale);
	const [text, setText] = useState<string>(formatted);
	const [shown, setShown] = useState<Date | null>(value);

	// A value set from elsewhere replaces the text; the value this text committed does not.
	if (!isSameMoment(value, shown)) {
		setShown(value);
		setText(formatted);
	}

	const parsed: Date | null = parseFieldText(text, pattern, locale, reference);
	const invalid: boolean = text !== '' && (parsed === null || !isAllowed(parsed));

	useEffect((): void => {
		inputReference.current?.setCustomValidity(invalid ? invalidMessage : '');
	}, [invalid, invalidMessage]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const next: string = maskFieldText(event.currentTarget.value, pattern, locale);
		const nextValue: Date | null = parseFieldText(next, pattern, locale, reference);
		const committed: Date | null = nextValue !== null && isAllowed(nextValue) ? nextValue : null;
		setText(next);
		setShown(committed);
		if (!isSameMoment(committed, value)) onCommit(committed);
	};

	return (
		<TextInput
			{...attributes}
			ref={mergeReferences(ref, inputReference)}
			type='text'
			// Digits only, unless the text ends with AM or PM, which takes a letter.
			inputMode={hasMeridiem(pattern) ? 'text' : 'numeric'}
			autoComplete='off'
			maxLength={pattern.length}
			value={text}
			onChange={handleChange}
		/>
	);
};

const Surface = styled('div')({
	...anchoredSurfaceStyles,
	// The root of the popper takes the height there is beside the field, and the panel scrolls inside it.
	flex: '1 1 auto',
	minHeight: 0,
	marginBlock: 0,
	overflow: 'auto',
	padding: 0,
});

type PopperModifier = NonNullable<PopperProps['modifiers']>[number];

type ModifierArguments = Parameters<NonNullable<PopperModifier['fn']>>[0];

/** In pixels: the gap between the field and the panel, and the room kept at the edge of the viewport. */
const panelOffset: number = 4;
const viewportMargin: number = 8;

/** Lowest height of the panel, when there is less room than that on both sides of the field. */
const minimumPanelHeight: number = 192;

/** Height of a panel with its calendar, its header and its footer: below the field when there is that much room. */
const preferredPanelHeight: number = 420;

type PanelPlacement = 'bottom-start' | 'top-start';

/**
 * The side of the panel, from where the field is alone: below it when the panel fits there or there is more room below,
 * else above. It never depends on the size of the panel, which the room on its side limits: a placement that did would
 * flip back and forth between the sides when neither has room for the whole panel.
 */
const placementBeside = (field: HTMLElement): PanelPlacement => {
	const { top, bottom }: DOMRect = field.getBoundingClientRect();
	const below: number = window.innerHeight - bottom;
	return below >= preferredPanelHeight || below >= top ? 'bottom-start' : 'top-start';
};

/**
 * The panel is fixed to the viewport, which a page scroll cannot bring into view: it takes at most the height between
 * the field and the edge of the viewport on its side, and scrolls inside it, so its footer is always reachable.
 */
const fitToViewport: PopperModifier = {
	name: 'fitToViewport',
	enabled: true,
	phase: 'beforeWrite',
	requires: ['computeStyles'],
	fn: ({ state }: ModifierArguments): void => {
		const field: DOMRect = state.elements.reference.getBoundingClientRect();
		const above: boolean = state.placement.startsWith('top');
		const room: number = above ? field.top : window.innerHeight - field.bottom;
		const height: number = Math.max(room - panelOffset - viewportMargin, minimumPanelHeight);

		Object.assign(state.styles.popper ?? {}, {
			display: 'flex',
			flexDirection: 'column',
			maxHeight: `${String(height)}px`,
		});
	},
};

export interface PickerPopupProps {
	open: boolean;
	anchor: HTMLElement | null;
	id: string;
	/** Name of the panel. */
	label: string;
	/** Escape closes the panel and gives focus back to the field. */
	onEscape: () => void;
	children: ReactNode;
}

/**
 * The panel of a picker, under its field (above it when there is more room there). It is not modal: it opens on a click in
 * the field while focus stays there, so the reader can still type; the keyboard reaches it from the field with Down or
 * through the button of the field, then with Tab. It stays in the markup of the field (no portal), so focus moves from
 * one to the other in order and a dialog around the field keeps it inside.
 */
export const PickerPopup = ({
	open,
	anchor,
	id,
	label,
	onEscape,
	children,
}: PickerPopupProps): ReactElement => {
	return (
		<Popper
			open={open && anchor !== null}
			anchorEl={anchor}
			placement={anchor === null ? 'bottom-start' : placementBeside(anchor)}
			disablePortal
			popperOptions={{ strategy: 'fixed' }}
			modifiers={[
				{ name: 'offset', options: { offset: [0, panelOffset] } },
				{ name: 'flip', enabled: false },
				{ name: 'preventOverflow', options: { padding: viewportMargin } },
				fitToViewport,
			]}
			style={{ zIndex: layer.popover }}
		>
			<Surface
				id={id}
				role='dialog'
				aria-label={label}
				// Clicking an empty part of the panel focuses it, so the field does not take it for a click outside.
				tabIndex={-1}
				onKeyDown={(event: KeyboardEvent<HTMLDivElement>): void => {
					if (event.key !== 'Escape') return;
					event.preventDefault();
					onEscape();
				}}
			>
				{children}
			</Surface>
		</Popper>
	);
};

const Wrapper = styled('div')({ minWidth: 0 });

export interface PickerState {
	open: boolean;
	/** Increases each time the panel should take focus. */
	focusRequest: number;
	anchorReference: RefObject<HTMLDivElement | null>;
	inputReference: RefObject<HTMLInputElement | null>;
	/** Opens the panel; with `moveFocus`, focus goes into it. */
	openPanel: (moveFocus: boolean) => void;
	/** Closes the panel; with `returnFocus`, focus goes back to the field. */
	closePanel: (returnFocus: boolean) => void;
	/** Keys of the field: Down, or Alt and Down, opens the panel and moves focus into it. */
	handleFieldKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/** Whether the panel is open, and the ways to open and close it. `onOpen` runs as it opens, to start its choice. */
export const usePickerState = (interactive: boolean, onOpen: () => void): PickerState => {
	const anchorReference: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
	const inputReference: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [focusRequest, setFocusRequest] = useState<number>(0);

	const openPanel = (moveFocus: boolean): void => {
		if (!interactive) return;
		if (!open) onOpen();
		setOpen(true);
		// A panel opened by a click in the field leaves focus there, even after one that took it.
		setFocusRequest((request: number): number => (moveFocus ? request + 1 : 0));
	};

	const closePanel = (returnFocus: boolean): void => {
		setOpen(false);
		if (returnFocus) inputReference.current?.focus();
	};

	return {
		open,
		focusRequest,
		anchorReference,
		inputReference,
		openPanel,
		closePanel,
		handleFieldKeyDown: (event: KeyboardEvent<HTMLElement>): void => {
			if (event.key === 'Escape' && open) {
				event.preventDefault();
				closePanel(false);
				return;
			}

			if (event.key !== 'ArrowDown') return;
			event.preventDefault();
			openPanel(true);
		},
	};
};

export interface PickerWrapperProps {
	state: PickerState;
	className?: string | undefined;
	style?: CSSProperties | undefined;
	children: ReactNode;
}

/** Holds the field and its panel: focus leaving both, or a click outside both, closes the panel without its choice. */
export const PickerWrapper = ({
	state,
	className,
	style,
	children,
}: PickerWrapperProps): ReactElement => {
	const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
		if (state.open && !event.currentTarget.contains(event.relatedTarget)) state.closePanel(false);
	};

	return (
		<Wrapper className={className} style={style} onBlur={handleBlur}>
			{children}
		</Wrapper>
	);
};
