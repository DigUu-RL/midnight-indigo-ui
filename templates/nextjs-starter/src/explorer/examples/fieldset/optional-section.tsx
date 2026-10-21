'use client';
import { Fieldset, NumberField, Switch, TextField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// A section that only counts on demand: `disabled` reaches every control inside, natively, so none is focused or sent.
export const CargoSection = (): ReactElement => {
	const [carriesCargo, setCarriesCargo] = useState<boolean>(false);

	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '24rem' }}>
			<Switch label='Carry cargo' checked={carriesCargo} onCheckedChange={setCarriesCargo} />

			<Fieldset
				legend='Cargo'
				description='Declared to the customs of Ganymede.'
				disabled={!carriesCargo}
			>
				<TextField label='Contents' name='contents' defaultValue='Bell peppers' />
				<NumberField label='Crates' name='crates' defaultValue={12} min={1} />
			</Fieldset>
		</Stack>
	);
};
