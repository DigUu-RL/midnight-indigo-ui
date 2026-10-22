'use client';
// Field props shared by the date and time pickers, turned into the text field slot of MUI X.
import { styled } from '@mui/material/styles';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { useFormError } from '#src/forms/form-context.ts';
import { hasContent } from '#src/forms/form-field/index.tsx';

const { spacing, intent }: typeof themeVariables = themeVariables;

/** Props of the pickers that follow the other fields of the library. */
export interface PickerFieldProps {
	/** Visible, persistent label; a placeholder never replaces it. */
	label: ReactNode;
	/** Help text, read after the label. */
	description?: ReactNode;
	/** Error message, shown with an icon; inside a `Form`, the error of `name` is used when omitted. */
	error?: ReactNode;
	/** Marks the label with an asterisk and the control as `required`. */
	required?: boolean | undefined;
	/** Unavailable: skipped by Tab and not submitted. */
	disabled?: boolean | undefined;
	/** Focusable and submitted, but not editable. */
	readOnly?: boolean | undefined;
	/** Submitted with the value of the field, formatted as shown. */
	name?: string | undefined;
	/** Id of the field, the target of its label. */
	id?: string | undefined;
	/** Class of the root of the field. */
	className?: string | undefined;
	/** Style of the root of the field. */
	style?: CSSProperties | undefined;
	/** Selected value, when the parent controls it. */
	value?: Date | null | undefined;
	/** Initial value when uncontrolled. */
	defaultValue?: Date | null | undefined;
	/** Called with the new value, or `null` when cleared or incomplete. */
	onValueChange?: ((value: Date | null) => void) | undefined;
}

const ErrorLine = styled('span')({
	display: 'flex',
	alignItems: 'flex-start',
	gap: spacing[1],
	color: intent.error.text,
	'& > svg': { marginBlockStart: '0.2em', flexShrink: 0 },
});

const Lines = styled('span')({ display: 'flex', flexDirection: 'column', gap: spacing[1] });

const HelperText = ({
	description,
	error,
}: {
	description: ReactNode;
	error: ReactNode;
}): ReactElement => {
	return (
		<Lines>
			{hasContent(description) ? <span>{description}</span> : null}

			{hasContent(error) ? (
				<ErrorLine>
					<Glyph name='alert' />
					<span>{error}</span>
				</ErrorLine>
			) : null}
		</Lines>
	);
};

/** The parts of a picker that the library decides: text field slot, value and change handler. */
export interface PickerFieldBinding {
	slotProps: {
		textField: {
			label: ReactNode;
			helperText?: ReactNode;
			error: boolean;
			required: boolean;
			name?: string;
			id?: string;
			className?: string;
			style?: CSSProperties;
			fullWidth: true;
		};
	};
	disabled: boolean;
	readOnly: boolean;
	value?: Date | null;
	defaultValue?: Date | null;
	onChange: (value: Date | null) => void;
}

/**
 * The label, description and error go to the text field of MUI X, which associates them with the field by ids
 * (`aria-describedby`, `aria-invalid`); the error keeps its icon, so it does not depend on color.
 */
export const usePickerField = ({
	label,
	description,
	error,
	required = false,
	disabled = false,
	readOnly = false,
	name,
	id,
	className,
	style,
	value,
	defaultValue,
	onValueChange,
}: PickerFieldProps): PickerFieldBinding => {
	const formError: string | undefined = useFormError(name);
	const shownError: ReactNode = error === undefined ? formError : error;
	const hasHelper: boolean = hasContent(description) || hasContent(shownError);

	return {
		slotProps: {
			// MUI X takes no explicit `undefined`, so only the given attributes are set.
			textField: {
				label,
				error: hasContent(shownError),
				required,
				fullWidth: true,
				...(hasHelper
					? { helperText: <HelperText description={description} error={shownError} /> }
					: {}),
				...(name === undefined ? {} : { name }),
				...(id === undefined ? {} : { id }),
				...(className === undefined ? {} : { className }),
				...(style === undefined ? {} : { style }),
			},
		},
		disabled,
		readOnly,
		...(value === undefined ? {} : { value }),
		...(defaultValue === undefined ? {} : { defaultValue }),
		// While a date is typed only in part, MUI X reports an invalid date; it is not a value yet.
		onChange: (next: Date | null): void => {
			onValueChange?.(next !== null && Number.isNaN(next.getTime()) ? null : next);
		},
	};
};
