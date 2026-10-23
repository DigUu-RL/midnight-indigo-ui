'use client';
// Search field with an optional clear button; Escape clears it too.
import { useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactElement, RefObject } from 'react';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import { IconButton } from '@/src/buttons/icon-button/index';
import { Glyph } from '@/src/shared/glyphs/index';
import { mergeReferences, setNativeValue } from '@/src/shared/merge-references';
import { TextFieldBase } from '@/src/forms/text-field-base/index';
import type { TextControlProps } from '@/src/forms/text-field-base/index';

/** Texts of the search field. Translate them with the rest of the interface. */
export interface SearchFieldLabels {
	/** Name of the clear button. */
	clear: string;
}

export const defaultSearchFieldLabels: Readonly<SearchFieldLabels> = Object.freeze({
	clear: 'Clear search',
});

export interface SearchFieldProps extends TextControlProps {
	/** Overrides some or all of `defaultSearchFieldLabels`. */
	labels?: Partial<SearchFieldLabels>;
	/** Shows a clear button while there is text. Defaults to `true`. */
	clearable?: boolean;
}

/**
 * `<input type="search">`. Put it inside the `<form role="search">` (or `<search>`) of the page, which makes the
 * search a landmark; the field itself does not, so a page can have several. Clearing sets the value as typing
 * would (`onChange` and `onValueChange` receive `''`) and returns focus to the input.
 */
export const SearchField = ({
	labels,
	clearable = true,
	ref,
	value,
	defaultValue,
	onChange,
	onKeyDown,
	disabled = false,
	readOnly = false,
	...props
}: SearchFieldProps): ReactElement => {
	const text: SearchFieldLabels = useComponentLabels(
		'searchField',
		defaultSearchFieldLabels,
		labels,
	);

	const inputReference: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

	const [uncontrolledFilled, setUncontrolledFilled] = useState<boolean>(
		defaultValue !== undefined && String(defaultValue) !== '',
	);

	const filled: boolean = value === undefined ? uncontrolledFilled : String(value) !== '';
	const editable: boolean = !disabled && !readOnly;

	const clear = (): void => {
		const input: HTMLInputElement | null = inputReference.current;
		if (input === null) return;
		setNativeValue(input, '');
		input.focus();
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setUncontrolledFilled(event.currentTarget.value !== '');
		onChange?.(event);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
		onKeyDown?.(event);
		if (event.key !== 'Escape' || !filled || !editable || event.defaultPrevented) return;
		event.preventDefault();
		clear();
	};

	return (
		<TextFieldBase
			{...props}
			ref={mergeReferences(ref, inputReference)}
			value={value}
			defaultValue={defaultValue}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			disabled={disabled}
			readOnly={readOnly}
			type='search'
			decoration={<Glyph name='search' />}
			actions={
				clearable && filled && editable ? (
					<IconButton label={text.clear} size='small' onClick={clear}>
						<Glyph name='close' />
					</IconButton>
				) : null
			}
		/>
	);
};
