'use client';
import { Combobox } from '@midnight-indigo/ui/forms';
import type { ComboboxOption } from '@midnight-indigo/ui/forms';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

const registry: readonly ComboboxOption[] = [
	{ value: 'asimov-solensan', label: 'Asimov Solensan' },
	{ value: 'abdul-hakim', label: 'Abdul Hakim' },
	{ value: 'mad-pierrot', label: 'Mad Pierrot' },
	{ value: 'teddy-bomber', label: 'Teddy Bomber' },
	{ value: 'rocco-bonnaro', label: 'Rocco Bonnaro' },
	{ value: 'vincent-volaju', label: 'Vincent Volaju' },
];

/** Stands in for a request to the bounty registry of the ISSP. */
const searchRegistry = async (query: string): Promise<ComboboxOption[]> => {
	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, 600);
	});

	return registry.filter((option: ComboboxOption): boolean => {
		return option.label.toLowerCase().includes(query.trim().toLowerCase());
	});
};

// The options come from a request for the typed text: the field is busy while it runs, and `filter='none'` keeps the
// list as the registry returns it.
export const RegistrySearch = (): ReactElement => {
	const [query, setQuery] = useState<string>('');
	const [options, setOptions] = useState<readonly ComboboxOption[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect((): (() => void) => {
		let current: boolean = true;
		setLoading(true);

		void searchRegistry(query).then((found: ComboboxOption[]): void => {
			if (!current) return;
			setOptions(found);
			setLoading(false);
		});

		return (): void => {
			current = false;
		};
	}, [query]);

	return (
		<div style={{ width: '100%', maxWidth: '20rem' }}>
			<Combobox
				name='target'
				label='Target'
				description='Searches the bounty registry of the ISSP.'
				filter='none'
				options={options}
				loading={loading}
				inputValue={query}
				onInputValueChange={setQuery}
			/>
		</div>
	);
};
