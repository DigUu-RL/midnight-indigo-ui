'use client';
// Single-line field shared by TextField, PasswordField, SearchField and NumberField.
import { useId } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	ReactElement,
	ReactNode,
} from 'react';

import type { ControlSize } from '#src/shared/appearance.ts';
import { FormField } from '#src/forms/form-field/index.tsx';
import type { FieldProps, FormFieldControlProps } from '#src/forms/form-field/index.tsx';
import { adornmentIds, InputFrame, TextInput } from '#src/forms/input-frame/index.tsx';
import type { AdornmentProps } from '#src/forms/input-frame/index.tsx';

/**
 * Attributes of `<input>` that reach the element, `ref` included. `className` and `style` go to the root of the
 * field instead, and the field props replace `required`, `disabled` and `readOnly`.
 */
export type NativeInputAttributes = Omit<
	ComponentPropsWithRef<'input'>,
	| 'size'
	| 'prefix'
	| 'children'
	| 'type'
	| 'required'
	| 'disabled'
	| 'readOnly'
	| 'className'
	| 'style'
>;

/** Props shared by the single-line fields. */
export interface TextControlProps extends FieldProps, AdornmentProps, NativeInputAttributes {
	/** 32, 40 or 48 px high, like the buttons. Defaults to `'medium'`. */
	size?: ControlSize | undefined;
	/** Class of the root of the field. */
	className?: string | undefined;
	/** Style of the root of the field. */
	style?: CSSProperties | undefined;
	/** Called with the new text, after `onChange`. */
	onValueChange?: ((value: string) => void) | undefined;
}

export interface TextFieldBaseProps extends TextControlProps {
	type: string;
	decoration?: ReactNode | undefined;
	actions?: ReactNode | undefined;
}

export const TextFieldBase = ({
	label,
	hideLabel,
	description,
	error,
	required,
	disabled = false,
	readOnly = false,
	loading = false,
	fieldLabels,
	prefix,
	suffix,
	size = 'medium',
	className,
	style,
	type,
	decoration,
	actions,
	id,
	name,
	onChange,
	onValueChange,
	'aria-describedby': describedBy,
	...inputAttributes
}: TextFieldBaseProps): ReactElement => {
	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		onChange?.(event);
		onValueChange?.(event.currentTarget.value);
	};

	return (
		<FormField
			label={label}
			hideLabel={hideLabel}
			description={description}
			error={error}
			required={required}
			disabled={disabled}
			readOnly={readOnly}
			loading={loading}
			fieldLabels={fieldLabels}
			controlId={controlId}
			name={name}
			describedBy={[...adornmentIds(controlId, { prefix, suffix }), describedBy]}
			className={className}
			style={style}
		>
			{(control: FormFieldControlProps): ReactNode => {
				return (
					<InputFrame
						controlId={control.id}
						size={size}
						invalid={control['aria-invalid'] === true}
						disabled={disabled}
						readOnly={readOnly}
						loading={loading}
						prefix={prefix}
						suffix={suffix}
						decoration={decoration}
						actions={actions}
					>
						<TextInput
							{...inputAttributes}
							{...control}
							type={type}
							name={name}
							onChange={handleChange}
						/>
					</InputFrame>
				);
			}}
		</FormField>
	);
};
