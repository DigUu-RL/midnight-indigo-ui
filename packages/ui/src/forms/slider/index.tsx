'use client';
// Choice of a number in a range, on the native range input, with the current value shown and announced.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useId, useState } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	ReactElement,
	ReactNode,
} from 'react';

import { focusRingStyles, forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { FormField } from '#src/forms/form-field/index.tsx';
import type { FieldProps, FormFieldControlProps } from '#src/forms/form-field/index.tsx';

const { spacing, typography, radius, text, border, state, intent }: typeof themeVariables =
	themeVariables;

export interface SliderProps
	extends
		Omit<FieldProps, 'readOnly' | 'loading' | 'fieldLabels'>,
		Omit<
			ComponentPropsWithRef<'input'>,
			| 'type'
			| 'size'
			| 'children'
			| 'required'
			| 'disabled'
			| 'readOnly'
			| 'className'
			| 'style'
			| 'value'
			| 'defaultValue'
			| 'min'
			| 'max'
			| 'step'
		> {
	/** Defaults to 0. */
	min?: number | undefined;
	/** Defaults to 100. */
	max?: number | undefined;
	/** Defaults to 1. */
	step?: number | undefined;
	/** Current value, when the parent controls it. */
	value?: number | undefined;
	/** Initial value when uncontrolled. Defaults to `min`. */
	defaultValue?: number | undefined;
	/** Called with the new value, after `onChange`. */
	onValueChange?: ((value: number) => void) | undefined;
	/**
	 * Text of the value, shown beside the label and read by assistive technologies (`aria-valuetext`), e.g.
	 * `(value) => \`${value} %\``. Defaults to the number.
	 */
	formatValue?: ((value: number) => string) | undefined;
	/**
	 * Content after the track, typically a `NumberField` bound to the same value: when precision matters, typing a
	 * number is easier than dragging (WCAG 2.5.7).
	 */
	input?: ReactNode;
	/** Class of the root of the field. */
	className?: string | undefined;
	/** Style of the root of the field. */
	style?: CSSProperties | undefined;
}

interface TrackStyleProps {
	invalid: boolean;
}

const thumbSize: string = '1.25rem';
const trackHeight: string = '0.375rem';
const fillVariable: string = '--mi-slider-fill';

const thumbStyles: CSSObject = {
	boxSizing: 'border-box',
	width: thumbSize,
	height: thumbSize,
	borderRadius: radius.pill,
	border: `2px solid ${intent.official.contrastText}`,
	backgroundColor: intent.official.main,
	cursor: 'grab',
};

// The filled part of the track (`official.main`) and the rest (`border.strong`) both meet 3:1 on every surface.
const Range = styled('input', {
	shouldForwardProp: forwardAllBut('invalid'),
})<TrackStyleProps>(({ invalid }: TrackStyleProps): CSSObject => {
	const rest: string = invalid ? intent.error.border : border.strong;

	return {
		appearance: 'none',
		flex: '1 1 auto',
		minWidth: 0,
		height: thumbSize,
		margin: 0,
		background: 'none',
		cursor: 'pointer',
		...focusRingStyles,
		'&::-webkit-slider-runnable-track': {
			height: trackHeight,
			borderRadius: radius.pill,
			background: `linear-gradient(to right, ${intent.official.main} var(${fillVariable}), ${rest} var(${fillVariable}))`,
		},
		'&::-moz-range-track': {
			height: trackHeight,
			borderRadius: radius.pill,
			backgroundColor: rest,
		},
		'&::-moz-range-progress': {
			height: trackHeight,
			borderRadius: radius.pill,
			backgroundColor: intent.official.main,
		},
		'&::-webkit-slider-thumb': {
			...thumbStyles,
			appearance: 'none',
			marginBlockStart: `calc((${trackHeight} - ${thumbSize}) / 2)`,
		},
		'&::-moz-range-thumb': thumbStyles,
		'[dir="rtl"] &::-webkit-slider-runnable-track': {
			background: `linear-gradient(to left, ${intent.official.main} var(${fillVariable}), ${rest} var(${fillVariable}))`,
		},
		'&:disabled': { cursor: 'not-allowed' },
		'&:disabled::-webkit-slider-runnable-track': { background: state.disabledBorder },
		'&:disabled::-moz-range-progress': { backgroundColor: state.disabledBorder },
		'&:disabled::-webkit-slider-thumb': {
			backgroundColor: state.disabledText,
			borderColor: state.disabledSurface,
			cursor: 'not-allowed',
		},
		'&:disabled::-moz-range-thumb': {
			backgroundColor: state.disabledText,
			borderColor: state.disabledSurface,
		},
	};
});

// The value is already read from the slider (`aria-valuetext`), so the visible copy is hidden from the tree.
const Output = styled('output')({
	...typography.label,
	minWidth: '3ch',
	textAlign: 'end',
	color: text.secondary,
	fontVariantNumeric: 'tabular-nums',
});

const Row = styled('div')({ display: 'flex', alignItems: 'center', gap: spacing[3] });

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
};

/**
 * Native `<input type="range">`: arrows step it, Page Up and Down take larger steps, Home and End go to the ends,
 * and the value is submitted with its `name`. The value is visible after the track, in an `<output>`.
 */
export const Slider = ({
	label,
	hideLabel,
	description,
	error,
	required,
	disabled = false,
	min = 0,
	max = 100,
	step = 1,
	value,
	defaultValue,
	onChange,
	onValueChange,
	formatValue = String,
	input,
	className,
	style,
	id,
	name,
	'aria-describedby': describedBy,
	...inputAttributes
}: SliderProps): ReactElement => {
	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;
	const [uncontrolledValue, setUncontrolledValue] = useState<number>(defaultValue ?? min);
	const current: number = clamp(value ?? uncontrolledValue, min, max);
	const fraction: number = max === min ? 0 : (current - min) / (max - min);
	const trackStyle: CSSProperties = { [fillVariable]: `${String(fraction * 100)}%` };

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const next: number = Number(event.currentTarget.value);
		if (value === undefined) setUncontrolledValue(next);
		onChange?.(event);
		onValueChange?.(next);
	};

	return (
		<FormField
			label={label}
			hideLabel={hideLabel}
			description={description}
			error={error}
			required={required}
			disabled={disabled}
			controlId={controlId}
			name={name}
			describedBy={[describedBy]}
			className={className}
			style={style}
		>
			{(control: FormFieldControlProps): ReactNode => {
				return (
					<Row>
						<Range
							{...inputAttributes}
							{...control}
							type='range'
							name={name}
							min={min}
							max={max}
							step={step}
							value={current}
							aria-valuetext={formatValue(current)}
							onChange={handleChange}
							style={trackStyle}
							invalid={control['aria-invalid'] === true}
						/>

						<Output htmlFor={controlId} aria-hidden='true'>
							{formatValue(current)}
						</Output>

						{input}
					</Row>
				);
			}}
		</FormField>
	);
};
