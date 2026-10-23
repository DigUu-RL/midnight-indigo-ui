'use client';
// Structure of a field: a real label, a description, the control and an error message, associated by ids.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import { forwardAllBut, visuallyHiddenStyles } from '@/src/shared/appearance';
import { Glyph } from '@/src/shared/glyphs/index';
import { themeVariables } from '@/src/theme/theme-variables';
import { useFormError } from '@/src/forms/form-context';

const { spacing, typography, text, intent, state }: typeof themeVariables = themeVariables;

/** Texts that `FormField` reads to assistive technologies. Translate them with the rest of the interface. */
export interface FormFieldLabels {
	/** Read with the field while `loading`. */
	loading: string;
}

export const defaultFormFieldLabels: Readonly<FormFieldLabels> = Object.freeze({
	loading: 'Loading',
});

/** Props shared by every field. */
export interface FieldProps {
	/** Visible, persistent label; a placeholder never replaces it. */
	label: ReactNode;
	/** Keeps the label for assistive technologies only, when the context already shows it (e.g. a search bar). */
	hideLabel?: boolean | undefined;
	/** Help text, read after the label. */
	description?: ReactNode | undefined;
	/**
	 * Error message. When set, the control is `aria-invalid` and the message, marked with an icon, is read with it.
	 * Inside a `Form`, a field with a `name` shows the error of that name unless `error` is given.
	 */
	error?: ReactNode | undefined;
	/** Marks the label with an asterisk and the control as `required`. */
	required?: boolean | undefined;
	/** Unavailable: skipped by Tab and not submitted. */
	disabled?: boolean | undefined;
	/** Focusable and submitted, but not editable. */
	readOnly?: boolean | undefined;
	/** The field waits for data (e.g. its options): `aria-busy`, a ring and a hidden `'Loading'` text. */
	loading?: boolean | undefined;
	/** Overrides some or all of `defaultFormFieldLabels`. */
	fieldLabels?: Partial<FormFieldLabels> | undefined;
}

/** Attributes that `FormField` gives to the control it renders. */
export interface FormFieldControlProps {
	/** Id of the control, the target of the label. */
	id: string;
	/** Ids of the description, the error and the loading text, then those of `describedBy`. */
	'aria-describedby': string | undefined;
	/** `true` while the field shows an error. */
	'aria-invalid': true | undefined;
	/** `true` while the field is `loading`. */
	'aria-busy': true | undefined;
	/** The `required` of the field. */
	required: boolean;
	/** The `disabled` of the field. */
	disabled: boolean;
	/** The `readOnly` of the field. */
	readOnly: boolean;
}

export interface FormFieldProps
	extends FieldProps, Omit<ComponentPropsWithRef<'div'>, 'children' | 'id'> {
	/** Id of the control; generated when omitted. */
	controlId?: string | undefined;
	/** Id of the label, for controls whose parts are labelled by it (e.g. the listbox of a combobox). */
	labelId?: string | undefined;
	/** Name of the control, used to read its error from the enclosing `Form`. */
	name?: string | undefined;
	/** Extra ids that describe the control, e.g. a character counter. */
	describedBy?: (string | undefined)[] | undefined;
	/** Renders the control with the given attributes spread on it. */
	children: (control: FormFieldControlProps) => ReactNode;
}

interface LabelStyleProps {
	fieldDisabled: boolean;
	visuallyHidden: boolean;
}

/** Space-separated list of the defined ids, or `undefined` when there is none. */
export const joinIds = (...ids: (string | false | undefined)[]): string | undefined => {
	const defined: string[] = ids.filter((id: string | false | undefined): id is string => {
		return typeof id === 'string' && id !== '';
	});

	return defined.length === 0 ? undefined : defined.join(' ');
};

/** Whether a message is present: `undefined`, `null`, `false` and `''` are not. */
export const hasContent = (content: ReactNode): boolean => {
	return content !== undefined && content !== null && content !== false && content !== '';
};

const FieldRoot = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	minWidth: 0,
});

/** Label of a field, or legend of a group; a disabled one takes the disabled text color. */
export const labelStyles = ({ fieldDisabled, visuallyHidden }: LabelStyleProps): CSSObject => {
	return visuallyHidden
		? visuallyHiddenStyles
		: {
				...typography.label,
				color: fieldDisabled ? state.disabledText : text.primary,
				alignSelf: 'flex-start',
			};
};

export const labelForwarding: { shouldForwardProp: (property: PropertyKey) => boolean } = {
	shouldForwardProp: forwardAllBut('fieldDisabled', 'visuallyHidden'),
};

const FieldLabel = styled('label', labelForwarding)<LabelStyleProps>(labelStyles);

const Asterisk = styled('span')({
	marginInlineStart: spacing[1],
	color: intent.error.text,
});

const DescriptionText = styled('div')({ ...typography.bodySmall, color: text.secondary });

/** Asterisk after the label of a required field; the control itself is `required`, which is what is announced. */
export const RequiredMark = (): ReactElement => <Asterisk aria-hidden='true'>*</Asterisk>;

export const FieldDescription = ({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}): ReactElement => {
	return <DescriptionText id={id}>{children}</DescriptionText>;
};

const ErrorText = styled('div')({
	...typography.bodySmall,
	display: 'flex',
	alignItems: 'flex-start',
	gap: spacing[1],
	color: intent.error.text,
	'& > svg': { marginBlockStart: '0.2em' },
});

const HiddenSpan = styled('span')(visuallyHiddenStyles);

/** Text for assistive technologies only. */
export const HiddenText = (props: ComponentPropsWithRef<'span'>): ReactElement => {
	return <HiddenSpan {...props} />;
};

/**
 * Error message with an icon, so the error never depends on color. It is not a live region: it is read with the
 * control when the control gets focus, and `Form` moves focus to the error summary after a failed submission, so
 * validation never announces the same error at every keystroke.
 */
export const FieldError = ({ id, children }: { id: string; children: ReactNode }): ReactElement => {
	return (
		<ErrorText id={id}>
			<Glyph name='alert' />
			<span>{children}</span>
		</ErrorText>
	);
};

export interface FieldMessageIds {
	description: string | undefined;
	error: string | undefined;
	loading: string | undefined;
}

/** Ids of the messages that a field renders, and the error it shows (its own, or the one of its `Form`). */
export const useFieldMessages = (
	controlId: string,
	{ description, error, loading }: Pick<FieldProps, 'description' | 'error' | 'loading'>,
	name: string | undefined,
): { ids: FieldMessageIds; error: ReactNode; invalid: boolean } => {
	const formError: string | undefined = useFormError(name);
	const shownError: ReactNode = error === undefined ? formError : error;
	const invalid: boolean = hasContent(shownError);

	return {
		ids: {
			description: hasContent(description) ? `${controlId}-description` : undefined,
			error: invalid ? `${controlId}-error` : undefined,
			loading: loading === true ? `${controlId}-loading` : undefined,
		},
		error: shownError,
		invalid,
	};
};

/**
 * Lays out a field and associates its parts with the control: the label by `for`, the description, the error and
 * the loading text by `aria-describedby`. The fields of this library use it; use it directly for a custom control.
 */
export const FormField = ({
	label,
	hideLabel = false,
	description,
	error,
	required = false,
	disabled = false,
	readOnly = false,
	loading = false,
	fieldLabels,
	controlId,
	labelId,
	name,
	describedBy = [],
	children,
	...attributes
}: FormFieldProps): ReactElement => {
	const generatedId: string = useId();
	const id: string = controlId ?? generatedId;

	const text: FormFieldLabels = useComponentLabels(
		'formField',
		defaultFormFieldLabels,
		fieldLabels,
	);

	const messages: { ids: FieldMessageIds; error: ReactNode; invalid: boolean } = useFieldMessages(
		id,
		{ description, error, loading },
		name,
	);

	const control: FormFieldControlProps = {
		id,
		'aria-describedby': joinIds(
			messages.ids.description,
			messages.ids.error,
			messages.ids.loading,
			...describedBy,
		),
		'aria-invalid': messages.invalid ? true : undefined,
		'aria-busy': loading ? true : undefined,
		required,
		disabled,
		readOnly,
	};

	return (
		<FieldRoot {...attributes}>
			<FieldLabel id={labelId} htmlFor={id} fieldDisabled={disabled} visuallyHidden={hideLabel}>
				{label}
				{required ? <RequiredMark /> : null}
			</FieldLabel>

			{messages.ids.description === undefined ? null : (
				<FieldDescription id={messages.ids.description}>{description}</FieldDescription>
			)}

			{children(control)}

			{messages.ids.loading === undefined ? null : (
				<HiddenText id={messages.ids.loading}>{text.loading}</HiddenText>
			)}

			{messages.ids.error === undefined ? null : (
				<FieldError id={messages.ids.error}>{messages.error}</FieldError>
			)}
		</FieldRoot>
	);
};
