'use client';
// Password field with a button that shows or hides the characters, keeping the value and the caret.
import { useState } from 'react';
import type { ReactElement } from 'react';

import { IconButton } from '#src/buttons/icon-button/index.tsx';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { TextFieldBase } from '#src/forms/text-field-base/index.tsx';
import type { TextControlProps } from '#src/forms/text-field-base/index.tsx';

/** Texts of the password field. Translate them with the rest of the interface. */
export interface PasswordFieldLabels {
	/** Name of the toggle button, which is pressed while the password is visible. */
	showPassword: string;
}

export const defaultPasswordFieldLabels: Readonly<PasswordFieldLabels> = Object.freeze({
	showPassword: 'Show password',
});

export interface PasswordFieldProps extends TextControlProps {
	/** Overrides some or all of `defaultPasswordFieldLabels`. */
	labels?: Partial<PasswordFieldLabels>;
	/** Starts with the characters visible. Defaults to `false`. */
	defaultVisible?: boolean;
}

/**
 * The toggle is a button with a fixed name and `aria-pressed`, so its state is announced, not its name changed. It
 * changes only the `type` of the same input: the value, the selection and a browser autofill stay.
 */
export const PasswordField = ({
	labels,
	defaultVisible = false,
	autoComplete = 'current-password',
	disabled,
	...props
}: PasswordFieldProps): ReactElement => {
	const text: PasswordFieldLabels = { ...defaultPasswordFieldLabels, ...labels };
	const [visible, setVisible] = useState<boolean>(defaultVisible);

	return (
		<TextFieldBase
			{...props}
			disabled={disabled}
			type={visible ? 'text' : 'password'}
			autoComplete={autoComplete}
			spellCheck={false}
			autoCapitalize='off'
			actions={
				<IconButton
					label={text.showPassword}
					aria-pressed={visible}
					size='small'
					disabled={disabled}
					onClick={(): void => {
						setVisible(!visible);
					}}
				>
					<Glyph name={visible ? 'eyeOff' : 'eye'} />
				</IconButton>
			}
		/>
	);
};
