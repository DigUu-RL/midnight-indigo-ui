'use client';
// A single checkbox with its label, description and error; also the base of Switch.
import { useEffect, useId, useRef } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { mergeReferences } from '#src/shared/merge-references.ts';
import { ChoiceInput, ChoiceRow, switchIndent } from '#src/forms/choice-control/index.tsx';
import type { ChoiceKind } from '#src/forms/choice-control/index.tsx';
import { hasContent, joinIds, useFieldMessages } from '#src/forms/form-field/index.tsx';
import type { FieldProps } from '#src/forms/form-field/index.tsx';

/** Attributes of `<input>` that reach the element, `ref` included; `className` and `style` go to the row. */
export type NativeChoiceAttributes = Omit<
	ComponentPropsWithRef<'input'>,
	| 'type'
	| 'size'
	| 'children'
	| 'required'
	| 'disabled'
	| 'readOnly'
	| 'className'
	| 'style'
	| 'role'
>;

/** Props shared by `Checkbox` and `Switch`. */
export interface ChoiceControlBaseProps
	extends
		Omit<FieldProps, 'label' | 'hideLabel' | 'readOnly' | 'loading' | 'fieldLabels'>,
		NativeChoiceAttributes {
	/**
	 * What the control turns on, in bold beside it, e.g. `'Enable email notifications'`. Optional: without it, name
	 * the control with `aria-label` or `aria-labelledby` (e.g. a checkbox in a table row).
	 */
	label?: ReactNode;
	/**
	 * What happens when it is on, below the label, e.g. `'Sends a notification by email for each new report'`. Read
	 * after the name.
	 */
	description?: ReactNode;
	/** Called with the new state, after `onChange`. */
	onCheckedChange?: ((checked: boolean) => void) | undefined;
	/** Class of the row. */
	className?: string | undefined;
	/** Style of the row. */
	style?: CSSProperties | undefined;
}

export interface CheckboxProps extends ChoiceControlBaseProps {
	/** Shows a dash instead of the check, e.g. for "select all" when only some items are selected. */
	indeterminate?: boolean | undefined;
}

export interface ChoiceFieldProps extends CheckboxProps {
	kind: ChoiceKind;
	/** The group around the control is invalid; the message belongs to the group. */
	groupInvalid?: boolean | undefined;
	/** An option of a group: its label is regular text, since the legend already heads the group. */
	inGroup?: boolean | undefined;
}

const isFilled = (text: string | undefined): boolean => text !== undefined && text.trim() !== '';

const hasName = (label: ReactNode, attributes: NativeChoiceAttributes): boolean => {
	return (
		hasContent(label) ||
		isFilled(attributes['aria-labelledby']) ||
		isFilled(attributes['aria-label'])
	);
};

/** Checkbox or switch: a native checkbox inside its label, controlled with `checked` or not with `defaultChecked`. */
export const ChoiceField = ({
	kind,
	label,
	description,
	error,
	required = false,
	disabled = false,
	indeterminate = false,
	groupInvalid = false,
	inGroup = false,
	onChange,
	onCheckedChange,
	className,
	style,
	id,
	name,
	ref,
	'aria-describedby': describedBy,
	...inputAttributes
}: ChoiceFieldProps): ReactElement => {
	if (!hasName(label, inputAttributes)) {
		throw new TypeError(
			`A ${kind} needs a label, aria-label or aria-labelledby: a nameless control is not usable.`,
		);
	}

	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;
	const inputReference: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

	// Inside a group the name is shared, so the error of the name belongs to the group, not to each control.
	const messages: ReturnType<typeof useFieldMessages> = useFieldMessages(
		controlId,
		{ description, error },
		groupInvalid || kind === 'radio' ? undefined : name,
	);

	const invalid: boolean = messages.invalid || groupInvalid;

	// `indeterminate` exists only as a DOM property.
	useEffect((): void => {
		if (inputReference.current !== null) inputReference.current.indeterminate = indeterminate;
	}, [indeterminate]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		onChange?.(event);
		onCheckedChange?.(event.currentTarget.checked);
	};

	return (
		<ChoiceRow
			className={className}
			style={style}
			label={label}
			emphasized={!inGroup}
			required={required && kind !== 'radio'}
			disabled={disabled}
			descriptionId={messages.ids.description}
			description={description}
			errorId={messages.ids.error}
			error={messages.error}
			indent={kind === 'switch' ? switchIndent : undefined}
			control={
				<ChoiceInput
					{...inputAttributes}
					ref={mergeReferences(ref, inputReference)}
					id={controlId}
					name={name}
					type={kind === 'radio' ? 'radio' : 'checkbox'}
					role={kind === 'switch' ? 'switch' : undefined}
					required={required}
					disabled={disabled}
					aria-invalid={invalid ? true : undefined}
					aria-describedby={joinIds(messages.ids.description, messages.ids.error, describedBy)}
					onChange={handleChange}
					kind={kind}
					invalid={invalid}
				/>
			}
		/>
	);
};

/**
 * Native checkbox: Space toggles it, `value` (default `'on'`) is submitted with its `name` when checked, and
 * `required` asks for it to be checked.
 */
export const Checkbox = (props: CheckboxProps): ReactElement => {
	return <ChoiceField {...props} kind='checkbox' />;
};
