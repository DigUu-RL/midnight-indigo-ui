'use client';
// Several checkboxes under one legend, for a choice of any number of options.
import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { ChoiceField } from '#src/forms/checkbox/index.tsx';
import { OptionList } from '#src/forms/choice-control/index.tsx';
import type { ChoiceOption, ChoiceOrientation } from '#src/forms/choice-control/index.tsx';
import { Fieldset } from '#src/forms/fieldset/index.tsx';
import type { FieldsetProps } from '#src/forms/fieldset/index.tsx';
import { useFormError } from '#src/forms/form-context.ts';
import { hasContent } from '#src/forms/form-field/index.tsx';

export interface CheckboxGroupProps extends Omit<
	FieldsetProps,
	'children' | 'errorName' | 'defaultValue' | 'onChange'
> {
	/** Shared by every checkbox, so the form submits one entry per checked option. */
	name?: string | undefined;
	options: readonly ChoiceOption[];
	/** Checked values, when the parent controls them. */
	value?: readonly string[] | undefined;
	/** Initially checked values when uncontrolled. */
	defaultValue?: readonly string[] | undefined;
	/** Called with the checked values, in the order of `options`. */
	onValueChange?: ((value: string[]) => void) | undefined;
	/** Defaults to `'vertical'`. */
	orientation?: ChoiceOrientation | undefined;
}

/**
 * A `Fieldset` of native checkboxes: Tab moves between them and Space toggles each one. `required` only marks the
 * legend, since HTML has no "at least one" rule: validate it and pass `error`.
 */
export const CheckboxGroup = ({
	name,
	options,
	value,
	defaultValue = [],
	onValueChange,
	orientation = 'vertical',
	error,
	disabled = false,
	id,
	...fieldsetProps
}: CheckboxGroupProps): ReactElement => {
	const [uncontrolledValue, setUncontrolledValue] = useState<readonly string[]>(defaultValue);
	const checkedValues: readonly string[] = value ?? uncontrolledValue;
	const formError: string | undefined = useFormError(name);
	const shownError: ReactNode = error === undefined ? formError : error;

	const toggle = (optionValue: string, checked: boolean): void => {
		const next: string[] = options
			.map((option: ChoiceOption): string => option.value)
			.filter((candidate: string): boolean => {
				return candidate === optionValue ? checked : checkedValues.includes(candidate);
			});

		if (value === undefined) setUncontrolledValue(next);
		onValueChange?.(next);
	};

	return (
		<Fieldset {...fieldsetProps} id={id} error={shownError} disabled={disabled}>
			<OptionList orientation={orientation}>
				{options.map((option: ChoiceOption): ReactElement => {
					return (
						<ChoiceField
							key={option.value}
							inGroup
							kind='checkbox'
							name={name}
							value={option.value}
							label={option.label}
							description={option.description}
							disabled={option.disabled === true || disabled}
							checked={checkedValues.includes(option.value)}
							groupInvalid={hasContent(shownError)}
							onCheckedChange={(checked: boolean): void => {
								toggle(option.value, checked);
							}}
						/>
					);
				})}
			</OptionList>
		</Fieldset>
	);
};
