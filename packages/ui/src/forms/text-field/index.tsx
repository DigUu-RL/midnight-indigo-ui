'use client';
// Single-line text field with a label, description, error and optional prefix and suffix.
import type { ReactElement } from 'react';

import { TextFieldBase } from '@/src/forms/text-field-base/index';
import type { TextControlProps } from '@/src/forms/text-field-base/index';

/** Types with their own field: `password` (PasswordField), `search` (SearchField), `number` (NumberField). */
export type TextFieldType = 'text' | 'email' | 'tel' | 'url';

export interface TextFieldProps extends TextControlProps {
	/** Gives the right keyboard and validation; set `autoComplete` too (e.g. `'email'`). Defaults to `'text'`. */
	type?: TextFieldType;
}

/**
 * Native `<input>`: controlled with `value`, uncontrolled with `defaultValue`, and submitted with its `name` like
 * any form field. Attributes other than the field props, `ref` included, reach the input.
 */
export const TextField = ({ type = 'text', ...props }: TextFieldProps): ReactElement => {
	return <TextFieldBase {...props} type={type} />;
};
