'use client';
// Date field with a calendar, on the MIT-licensed date picker of MUI X.
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DatePickerProps as MuiDatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { ReactElement } from 'react';

import { usePickerField } from '#src/forms/date-pickers/picker-field.tsx';
import type {
	PickerFieldBinding,
	PickerFieldProps,
} from '#src/forms/date-pickers/picker-field.tsx';

/** Field props of the library, plus the date options of MUI X (`minDate`, `maxDate`, `views`, `format`, ...). */
export type DatePickerProps = PickerFieldProps &
	Omit<
		MuiDatePickerProps,
		| 'label'
		| 'name'
		| 'disabled'
		| 'readOnly'
		| 'value'
		| 'defaultValue'
		| 'onChange'
		| 'slotProps'
		| 'className'
		| 'sx'
	>;

/**
 * The date is typed in sections (day, month, year: arrows change the focused one) or chosen in a calendar dialog
 * opened by its button, whose grid moves with the arrow keys. Must be inside `DatePickersProvider`.
 */
export const DatePicker = ({
	label,
	description,
	error,
	required,
	disabled,
	readOnly,
	name,
	id,
	className,
	style,
	value,
	defaultValue,
	onValueChange,
	...pickerProps
}: DatePickerProps): ReactElement => {
	const binding: PickerFieldBinding = usePickerField({
		label,
		description,
		error,
		required,
		disabled,
		readOnly,
		name,
		id,
		className,
		style,
		value,
		defaultValue,
		onValueChange,
	});

	return <MuiDatePicker {...pickerProps} {...binding} />;
};
