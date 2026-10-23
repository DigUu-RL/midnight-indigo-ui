'use client';
// Choice of one option from a list, on the native `<select>`.
import { styled } from '@mui/material/styles';
import { useId } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	ReactElement,
	ReactNode,
} from 'react';

import type { ControlSize } from '@/src/shared/appearance';
import { Glyph } from '@/src/shared/glyphs/index';
import { themeVariables } from '@/src/theme/theme-variables';
import { FormField } from '@/src/forms/form-field/index';
import type { FieldProps, FormFieldControlProps } from '@/src/forms/form-field/index';
import { controlResetStyles, InputFrame } from '@/src/forms/input-frame/index';

const { spacing, surface, text, iconSize }: typeof themeVariables = themeVariables;

export interface SelectOption {
	/** Submitted with the `name` of the select when chosen; unique within it. */
	value: string;
	/** Text of the option in the list. */
	label: string;
	/** Keeps the option listed but not selectable. */
	disabled?: boolean;
}

export interface SelectOptionGroup {
	/** Name of the group, shown above its options. */
	label: string;
	/** Options of the group, in order. */
	options: readonly SelectOption[];
}

export interface SelectProps
	extends
		Omit<FieldProps, 'readOnly'>,
		Omit<
			ComponentPropsWithRef<'select'>,
			| 'children'
			| 'size'
			| 'multiple'
			| 'required'
			| 'disabled'
			| 'className'
			| 'style'
			| 'value'
			| 'defaultValue'
		> {
	/** Options, or groups of options. */
	options: readonly (SelectOption | SelectOptionGroup)[];
	/**
	 * Text of the empty option (`value=""`), listed first, e.g. `'Choose a state'`. With `required`, choosing it
	 * fails validation; without it, it clears the choice. Without a placeholder the first option is selected.
	 */
	placeholder?: string;
	/** Selected value, when the parent controls it; `''` selects the empty option. */
	value?: string;
	/** Initial value when uncontrolled. */
	defaultValue?: string;
	/** Called with the new value, after `onChange`. */
	onValueChange?: (value: string) => void;
	/** 32, 40 or 48 px high, like the buttons. Defaults to `'medium'`. */
	size?: ControlSize;
	/** Class of the root of the field. */
	className?: string;
	/** Style of the root of the field. */
	style?: CSSProperties;
}

const Wrapper = styled('span')({
	position: 'relative',
	display: 'flex',
	flex: '1 1 auto',
	alignSelf: 'stretch',
	minWidth: 0,
});

// The select covers the whole frame, so a click anywhere opens it; the chevron is drawn over it.
const NativeSelect = styled('select')({
	...controlResetStyles,
	appearance: 'none',
	paddingInlineEnd: `calc(${iconSize.small} + ${spacing[2]})`,
	colorScheme: 'dark',
	cursor: 'pointer',
	'& option, & optgroup': { backgroundColor: surface.overlay, color: text.primary },
});

const Chevron = styled('span')({
	position: 'absolute',
	insetInlineEnd: 0,
	insetBlock: 0,
	display: 'flex',
	alignItems: 'center',
	color: text.secondary,
	fontSize: iconSize.small,
	pointerEvents: 'none',
});

const isGroup = (entry: SelectOption | SelectOptionGroup): entry is SelectOptionGroup => {
	return 'options' in entry;
};

const renderOption = (option: SelectOption): ReactElement => {
	return (
		<option key={option.value} value={option.value} disabled={option.disabled}>
			{option.label}
		</option>
	);
};

/**
 * Native `<select>`: the platform list on touch devices, type-ahead, arrow keys and form submission come with it.
 * Read-only is not supported by the element; use `disabled`, or a `TextField` with `readOnly`, to show a fixed
 * value.
 */
export const Select = ({
	label,
	hideLabel,
	description,
	error,
	required,
	disabled = false,
	loading = false,
	fieldLabels,
	options,
	placeholder,
	value,
	defaultValue,
	onChange,
	onValueChange,
	size = 'medium',
	className,
	style,
	id,
	name,
	'aria-describedby': describedBy,
	...selectAttributes
}: SelectProps): ReactElement => {
	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;

	const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
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
			loading={loading}
			fieldLabels={fieldLabels}
			controlId={controlId}
			name={name}
			describedBy={[describedBy]}
			className={className}
			style={style}
		>
			{(control: FormFieldControlProps): ReactNode => {
				return (
					<InputFrame
						controlId={controlId}
						size={size}
						invalid={control['aria-invalid'] === true}
						disabled={disabled}
						readOnly={false}
						loading={loading}
					>
						<Wrapper>
							<NativeSelect
								{...selectAttributes}
								{...control}
								name={name}
								value={value}
								defaultValue={defaultValue}
								onChange={handleChange}
							>
								{placeholder === undefined ? null : <option value=''>{placeholder}</option>}

								{options.map((entry: SelectOption | SelectOptionGroup): ReactElement => {
									return isGroup(entry) ? (
										<optgroup key={entry.label} label={entry.label}>
											{entry.options.map(renderOption)}
										</optgroup>
									) : (
										renderOption(entry)
									);
								})}
							</NativeSelect>

							<Chevron aria-hidden='true'>
								<Glyph name='chevronDown' />
							</Chevron>
						</Wrapper>
					</InputFrame>
				);
			}}
		</FormField>
	);
};
