'use client';
// Date and time field with a calendar and a clock list, on the MIT-licensed date-time picker of MUI X.
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { DateTimePickerProps as MuiDateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import type { ReactElement } from 'react';

import { usePickerField } from '#src/forms/date-pickers/picker-field.tsx';
import type {
	PickerFieldBinding,
	PickerFieldProps,
} from '#src/forms/date-pickers/picker-field.tsx';

/** Field props of the library, plus the options of MUI X (`minDateTime`, `maxDateTime`, `ampm`, `views`, ...). */
export type DateTimePickerProps = PickerFieldProps &
	Omit<
		MuiDateTimePickerProps,
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
 * One field for an instant (e.g. a meeting): typed in sections or chosen in a calendar followed by time lists. Use it
 * only when date and time belong together; otherwise a `DatePicker` and a `TimePicker` are simpler. Must be
 * inside `DatePickersProvider`.
 */
export const DateTimePicker = ({
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
}: DateTimePickerProps): ReactElement => {
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

	return <MuiDateTimePicker {...pickerProps} {...binding} />;
};
