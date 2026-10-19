'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { useState } from 'react';
import type { ReactElement } from 'react';

export const SaveLogbook = (): ReactElement => {
	const [saving, setSaving] = useState<boolean>(false);

	const save = (): void => {
		setSaving(true);

		window.setTimeout((): void => {
			setSaving(false);
		}, 2000);
	};

	return (
		<Button intent='official' variant='solid' loading={saving} onClick={save}>
			Save logbook
		</Button>
	);
};
