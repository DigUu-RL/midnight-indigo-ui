'use client';
// Binds the fields of the library to React Hook Form through its `useController`.
import { useController } from 'react-hook-form';
import type {
	Control,
	FieldError,
	FieldErrors,
	FieldPath,
	FieldPathValue,
	FieldValues,
	RefCallBack,
	UseControllerProps,
	UseControllerReturn,
} from 'react-hook-form';

import type { ErrorSummaryItem } from '#src/forms/error-summary/index.tsx';

export interface FieldControllerOptions<
	Values extends FieldValues,
	Name extends FieldPath<Values>,
> {
	control: Control<Values>;
	name: Name;
	/** Validation rules of React Hook Form (`required`, `validate`, ...). */
	rules?: UseControllerProps<Values, Name>['rules'];
}

/** Props to spread on a field with a value: TextField, Select, NumberField, Slider, Combobox, RadioGroup... */
export interface ControlledValueProps<Value> {
	name: string;
	value: Value;
	onValueChange: (value: Value) => void;
	onBlur: () => void;
	ref: RefCallBack;
	error: string | undefined;
	disabled?: boolean;
}

/** Props to spread on a Checkbox or a Switch bound to a boolean. */
export interface ControlledCheckedProps {
	name: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	onBlur: () => void;
	ref: RefCallBack;
	error: string | undefined;
	disabled?: boolean;
}

const messageOf = (error: FieldError | undefined): string | undefined => {
	return error?.message === undefined || error.message === '' ? undefined : error.message;
};

/**
 * `{...useFieldController({ control, name: 'email' })}` on a field gives it the value, the change and blur
 * handlers, the ref (so `setFocus` and `shouldFocusError` reach the control) and the error message.
 */
export const useFieldController = <Values extends FieldValues, Name extends FieldPath<Values>>({
	control,
	name,
	rules,
}: FieldControllerOptions<Values, Name>): ControlledValueProps<FieldPathValue<Values, Name>> => {
	const { field, fieldState }: UseControllerReturn<Values, Name> = useController({
		control,
		name,
		...(rules === undefined ? {} : { rules }),
	});

	return {
		name: field.name,
		value: field.value,
		onValueChange: field.onChange,
		onBlur: field.onBlur,
		ref: field.ref,
		error: messageOf(fieldState.error),
		...(field.disabled === undefined ? {} : { disabled: field.disabled }),
	};
};

/** Same as `useFieldController`, for a Checkbox or a Switch whose value is a boolean. */
export const useCheckedController = <Values extends FieldValues, Name extends FieldPath<Values>>({
	control,
	name,
	rules,
}: FieldControllerOptions<Values, Name>): ControlledCheckedProps => {
	const { field, fieldState }: UseControllerReturn<Values, Name> = useController({
		control,
		name,
		...(rules === undefined ? {} : { rules }),
	});

	return {
		name: field.name,
		checked: field.value === true,
		onCheckedChange: field.onChange,
		onBlur: field.onBlur,
		ref: field.ref,
		error: messageOf(fieldState.error),
		...(field.disabled === undefined ? {} : { disabled: field.disabled }),
	};
};

const isFieldError = (node: unknown): node is FieldError => {
	return (
		typeof node === 'object' && node !== null && 'type' in node && typeof node.type === 'string'
	);
};

/**
 * The errors of `formState.errors` as items of `ErrorSummary`, in the order of the form, nested fields included
 * (`address.city`, `items.0.name`).
 */
export const toErrorSummaryItems = <Values extends FieldValues>(
	errors: FieldErrors<Values>,
	prefix: string = '',
): ErrorSummaryItem[] => {
	return Object.entries(errors).flatMap(([key, node]: [string, unknown]): ErrorSummaryItem[] => {
		const name: string = prefix === '' ? key : `${prefix}.${key}`;

		if (isFieldError(node)) {
			const message: string | undefined = messageOf(node);
			return message === undefined ? [] : [{ name, message }];
		}

		return typeof node === 'object' && node !== null
			? toErrorSummaryItems(node as FieldErrors, name)
			: [];
	});
};
