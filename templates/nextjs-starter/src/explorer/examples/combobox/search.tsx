import { Combobox } from '@midnight-indigo/ui/forms';
import type { ComboboxOption } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

const pilots: readonly string[] = [
	'Amuro Ray',
	'Char Aznable',
	'Kamille Bidan',
	'Judau Ashta',
	'Setsuna F. Seiei',
	'Heero Yuy',
	'Kira Yamato',
	'Athrun Zala',
	'Banagher Links',
	'Shinji Ikari',
	'Asuka Langley Soryu',
	'Rei Ayanami',
	'Simon',
	'Kamina',
	'Spike Spiegel',
	'Poe Dameron',
	'Wedge Antilles',
	'Han Solo',
	'Luke Skywalker',
	'Samus Aran',
	'Fox McCloud',
	'Falco Lombardi',
];

const options: readonly ComboboxOption[] = pilots.map((pilot: string): ComboboxOption => {
	return { value: pilot.toLowerCase().replaceAll(/\W+/g, '-'), label: pilot };
});

// The typed text matches the start of the names, and only the first five matches are listed: a message under the list
// asks to keep typing to narrow the rest.
export const WingmanSearch = (): ReactElement => {
	return (
		<div style={{ width: '100%', maxWidth: '20rem' }}>
			<Combobox
				name='wingman'
				label='Wingman'
				description='Type the first letters of a name.'
				placeholder='Search pilots'
				filter='startsWith'
				maxVisibleOptions={5}
				options={options}
			/>
		</div>
	);
};
