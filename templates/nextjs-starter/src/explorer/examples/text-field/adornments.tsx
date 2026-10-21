'use client';
import { TextField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// The prefix and the suffix are read after the label, so the name of each field stays `Handle` and `Crew page`.
export const CrewLinks = (): ReactElement => {
	const [page, setPage] = useState<string>('bebop');

	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '24rem' }}>
			<TextField label='Handle' prefix='@' defaultValue='spike' autoComplete='off' />

			<TextField
				label='Crew page'
				prefix='https://'
				suffix='.crews.space'
				value={page}
				onValueChange={setPage}
				autoComplete='off'
				spellCheck={false}
			/>

			<p style={{ margin: 0 }}>Your crew is at https://{page.trim() || '…'}.crews.space.</p>
		</Stack>
	);
};
