// Choosing among many options: a combobox that filters as the user types, and a native select.
import { Combobox, Select } from '@midnight-indigo/ui/forms';
import type { ComboboxOption, SelectOption } from '@midnight-indigo/ui/forms';
import { useMemo } from 'react';
import type { ReactElement } from 'react';

import { createLabels } from '#src/datasets.ts';

interface ChoiceScenarioProps {
	optionCount: number;
}

/** Options without `disabled`, the shape that both `ComboboxOption` and `SelectOption` accept. */
interface EnabledOption {
	value: string;
	label: string;
}

const useOptions = (optionCount: number): EnabledOption[] => {
	return useMemo((): EnabledOption[] => {
		return createLabels(optionCount).map((label: string, index: number): EnabledOption => {
			return { value: String(index + 1), label };
		});
	}, [optionCount]);
};

export const ComboboxScenario = ({ optionCount }: ChoiceScenarioProps): ReactElement => {
	const options: ComboboxOption[] = useOptions(optionCount);
	return <Combobox label='Product' options={options} />;
};

export const SelectScenario = ({ optionCount }: ChoiceScenarioProps): ReactElement => {
	const options: SelectOption[] = useOptions(optionCount);
	return <Select label='Product' placeholder='Choose a product' options={options} />;
};
