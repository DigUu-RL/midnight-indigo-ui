'use client';
// Numeric field: native number input with `min`, `max` and `step`, and optional step buttons.
import { useRef } from 'react';
import type { ChangeEvent, ReactElement, RefObject } from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { IconButton } from '#src/buttons/icon-button/index.tsx';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { mergeReferences } from '#src/shared/merge-references.ts';
import { TextFieldBase } from '#src/forms/text-field-base/index.tsx';
import type { TextControlProps } from '#src/forms/text-field-base/index.tsx';

/** Texts of the number field. Translate them with the rest of the interface. */
export interface NumberFieldLabels {
	increment: string;
	decrement: string;
}

export const defaultNumberFieldLabels: Readonly<NumberFieldLabels> = Object.freeze({
	increment: 'Increase',
	decrement: 'Decrease',
});

export interface NumberFieldProps extends Omit<TextControlProps, 'onValueChange'> {
	/** Called with the new number, or `null` while the field is empty or not a number. */
	onValueChange?: (value: number | null) => void;
	/** Shows buttons that step the value down and up. Defaults to `false`. */
	steppers?: boolean;
	/** Overrides some or all of `defaultNumberFieldLabels`. */
	labels?: Partial<NumberFieldLabels>;
}

const toNumber = (input: HTMLInputElement): number | null => {
	return Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber;
};

/**
 * `<input type="number">`: Arrow Up and Down step the value, `min`, `max` and `step` are validated by the browser,
 * and the value is submitted as typed. The step buttons are for pointers only (`tabIndex={-1}`), as in the
 * spin button pattern: the keyboard already steps the value.
 */
export const NumberField = ({
	onValueChange,
	steppers = false,
	labels,
	ref,
	onChange,
	disabled = false,
	readOnly = false,
	inputMode = 'decimal',
	...props
}: NumberFieldProps): ReactElement => {
	const text: NumberFieldLabels = useComponentLabels(
		'numberField',
		defaultNumberFieldLabels,
		labels,
	);

	const inputReference: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
	const editable: boolean = !disabled && !readOnly;

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		onChange?.(event);
		onValueChange?.(toNumber(event.currentTarget));
	};

	const step = (direction: 1 | -1): void => {
		const input: HTMLInputElement | null = inputReference.current;
		if (input === null) return;

		try {
			if (direction === 1) input.stepUp();
			if (direction === -1) input.stepDown();
		} catch {
			// An invalid `step` makes the browser refuse; the value stays as it is.
			return;
		}

		// Stepping does not fire `input` by itself; React compares the value with the last one it saw.
		input.dispatchEvent(new Event('input', { bubbles: true }));
	};

	return (
		<TextFieldBase
			{...props}
			ref={mergeReferences(ref, inputReference)}
			type='number'
			inputMode={inputMode}
			onChange={handleChange}
			disabled={disabled}
			readOnly={readOnly}
			actions={
				steppers ? (
					<>
						<IconButton
							label={text.decrement}
							size='small'
							tabIndex={-1}
							disabled={!editable}
							onClick={(): void => {
								step(-1);
							}}
						>
							<Glyph name='minus' />
						</IconButton>

						<IconButton
							label={text.increment}
							size='small'
							tabIndex={-1}
							disabled={!editable}
							onClick={(): void => {
								step(1);
							}}
						>
							<Glyph name='plus' />
						</IconButton>
					</>
				) : null
			}
		/>
	);
};
