'use client';
// Group of related controls named by a legend, with a description and an error for the whole group.
import { styled } from '@mui/material/styles';
import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { themeVariables } from '@/src/theme/theme-variables';
import {
	FieldDescription,
	FieldError,
	joinIds,
	labelForwarding,
	labelStyles,
	RequiredMark,
	useFieldMessages,
} from '@/src/forms/form-field/index';

const { spacing }: typeof themeVariables = themeVariables;

export interface FieldsetProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'children'> {
	/** Name of the group, read when focus enters it, e.g. `'Delivery address'`. */
	legend: ReactNode;
	/** Keeps the legend for assistive technologies only. */
	hideLegend?: boolean | undefined;
	/** Help text for the whole group. */
	description?: ReactNode;
	/** Error of the group, e.g. `'Choose at least one channel'`, marked with an icon. */
	error?: ReactNode;
	/** Marks the legend with an asterisk; the controls inside carry their own `required`. */
	required?: boolean | undefined;
	/** Disables every control inside, natively. */
	disabled?: boolean | undefined;
	/** Name of the field the group stands for, to read its error from the enclosing `Form`. */
	errorName?: string | undefined;
	/** The controls of the group. */
	children: ReactNode;
}

const Root = styled('fieldset')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[2],
	minWidth: 0,
	margin: 0,
	padding: 0,
	border: 0,
});

const Legend = styled('legend', labelForwarding)(labelStyles);

const Body = styled('div')({ display: 'flex', flexDirection: 'column', gap: spacing[2] });

/**
 * Native `<fieldset>` and `<legend>`: the legend names the group and `disabled` reaches every control inside. The
 * description and the error are attached with `aria-describedby`.
 */
export const Fieldset = ({
	legend,
	hideLegend = false,
	description,
	error,
	required = false,
	disabled = false,
	errorName,
	children,
	id,
	'aria-describedby': describedBy,
	...attributes
}: FieldsetProps): ReactElement => {
	const generatedId: string = useId();
	const groupId: string = id ?? generatedId;

	const messages: ReturnType<typeof useFieldMessages> = useFieldMessages(
		groupId,
		{ description, error },
		errorName,
	);

	return (
		<Root
			{...attributes}
			id={groupId}
			disabled={disabled}
			aria-describedby={joinIds(messages.ids.description, messages.ids.error, describedBy)}
		>
			<Legend fieldDisabled={disabled} visuallyHidden={hideLegend}>
				{legend}
				{required ? <RequiredMark /> : null}
			</Legend>

			{messages.ids.description === undefined ? null : (
				<FieldDescription id={messages.ids.description}>{description}</FieldDescription>
			)}

			<Body>{children}</Body>

			{messages.ids.error === undefined ? null : (
				<FieldError id={messages.ids.error}>{messages.error}</FieldError>
			)}
		</Root>
	);
};
