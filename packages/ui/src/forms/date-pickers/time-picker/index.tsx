'use client';
// Time field with a clock list, on the MIT-licensed time picker of MUI X.
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import type { TimePickerProps as MuiTimePickerProps } from '@mui/x-date-pickers/TimePicker';
import type { ReactElement } from 'react';

import { usePickerField } from '#src/forms/date-pickers/picker-field.tsx';
import type {
	PickerFieldBinding,
	PickerFieldProps,
} from '#src/forms/date-pickers/picker-field.tsx';

/** Field props of the library, plus the time options of MUI X (`minTime`, `maxTime`, `ampm`, `timeSteps`, ...). */
export type TimePickerProps = PickerFieldProps &
	Omit<
		MuiTimePickerProps,
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
 * The time is typed in sections (hours, minutes and, with `ampm`, the meridiem: arrows change the focused one) or
 * chosen in lists opened by its button. The 12 or 24-hour clock follows the locale unless `ampm` is set. Must be
 * inside `DatePickersProvider`.
 */
export const TimePicker = ({
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
}: TimePickerProps): ReactElement => {
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

	return <MuiTimePicker {...pickerProps} {...binding} />;
};
