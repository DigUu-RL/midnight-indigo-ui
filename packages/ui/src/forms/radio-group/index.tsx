'use client';
// Native radio buttons under one legend, for a choice of exactly one option.
import { useId, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { ChoiceField } from '@/src/forms/checkbox/index';
import { OptionList } from '@/src/forms/choice-control/index';
import type { ChoiceOption, ChoiceOrientation } from '@/src/forms/choice-control/index';
import { Fieldset } from '@/src/forms/fieldset/index';
import type { FieldsetProps } from '@/src/forms/fieldset/index';
import { useFormError } from '@/src/forms/form-context';
import { hasContent } from '@/src/forms/form-field/index';

export interface RadioGroupProps extends Omit<
	FieldsetProps,
	'children' | 'errorName' | 'defaultValue' | 'onChange' | 'role'
> {
	/** Shared by the radios, which makes them one group; generated when omitted. */
	name?: string | undefined;
	/** A radio for each option, in order. */
	options: readonly ChoiceOption[];
	/** Checked value, when the parent controls it; `''` checks none. */
	value?: string | undefined;
	/** Initially checked value when uncontrolled. */
	defaultValue?: string | undefined;
	/** Called with the checked value. */
	onValueChange?: ((value: string) => void) | undefined;
	/** Stacks the options, or puts them in a row that wraps. Defaults to `'vertical'`. */
	orientation?: ChoiceOrientation | undefined;
}

/**
 * A `radiogroup` of native radios: Tab enters the group at the checked option (or the first), arrow keys move and
 * check, and `required` asks for one to be checked.
 */
export const RadioGroup = ({
	name,
	options,
	value,
	defaultValue = '',
	onValueChange,
	orientation = 'vertical',
	error,
	required = false,
	disabled = false,
	...fieldsetProps
}: RadioGroupProps): ReactElement => {
	const generatedName: string = useId();
	const groupName: string = name ?? generatedName;
	const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);
	const checkedValue: string = value ?? uncontrolledValue;
	const formError: string | undefined = useFormError(name);
	const shownError: ReactNode = error === undefined ? formError : error;
	const invalid: boolean = hasContent(shownError);

	const choose = (optionValue: string): void => {
		if (value === undefined) setUncontrolledValue(optionValue);
		onValueChange?.(optionValue);
	};

	return (
		<Fieldset
			{...fieldsetProps}
			role='radiogroup'
			aria-required={required ? true : undefined}
			aria-invalid={invalid ? true : undefined}
			error={shownError}
			required={required}
			disabled={disabled}
		>
			<OptionList orientation={orientation}>
				{options.map((option: ChoiceOption): ReactElement => {
					return (
						<ChoiceField
							key={option.value}
							inGroup
							kind='radio'
							name={groupName}
							value={option.value}
							label={option.label}
							description={option.description}
							required={required}
							disabled={option.disabled === true || disabled}
							checked={checkedValue === option.value}
							groupInvalid={invalid}
							onCheckedChange={(checked: boolean): void => {
								if (checked) choose(option.value);
							}}
						/>
					);
				})}
			</OptionList>
		</Fieldset>
	);
};
