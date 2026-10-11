// Async Server Component rendered per request and streamed after the page shell.
import { themeVariables } from '@midnight-indigo/ui/theme';
import { connection } from 'next/server';
import type { ReactElement } from 'react';

const streamingDelayInMilliseconds: number = 300;

export const StreamedPanel = async (): Promise<ReactElement> => {
	await connection();
	await new Promise((resolve: (value: unknown) => void): void => {
		setTimeout(resolve, streamingDelayInMilliseconds);
	});

	return (
		<section className='panel' style={{ borderColor: themeVariables.intent.success.border }}>
			<p>Streamed panel, styled with the same theme variables.</p>
		</section>
	);
};
