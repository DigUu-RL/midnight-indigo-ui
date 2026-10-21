'use client';
import { FileUpload } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

// Several files, each one checked against the limits the field states: a file of another type, larger than 2 MB or
// past the third is left out, and a status message says why.
export const BountyDossier = (): ReactElement => {
	return (
		<FileUpload
			label='Evidence'
			description='Reports of the sightings of Vicious.'
			name='evidence'
			accept='.pdf'
			maxSize={2 * 1024 * 1024}
			maxFiles={3}
			multiple
			style={{ width: '100%', maxWidth: '32rem' }}
		/>
	);
};
