'use client';
import { Fieldset, TextField } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

// Fields that only make sense together share a legend, read when focus enters the first of them.
export const LandingSite = (): ReactElement => {
	return (
		<Fieldset
			legend='Landing site'
			description='Where the Bebop docks on arrival.'
			required
			style={{ width: '100%', maxWidth: '24rem' }}
		>
			<TextField label='Planet or moon' name='planet' autoComplete='address-level1' required />
			<TextField label='City' name='city' autoComplete='address-level2' required />
			<TextField label='Dock' name='dock' description='Optional, e.g. Dock 12.' />
		</Fieldset>
	);
};
