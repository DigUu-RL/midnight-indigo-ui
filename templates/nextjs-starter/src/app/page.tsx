// Home page (Server Component). The streamed panel proves that late chunks reuse the theme already in the head.
import { Suspense } from 'react';
import type { ReactElement } from 'react';

import { StreamedPanel } from './streamed-panel.tsx';
import { ThemeSummary } from './theme-summary.tsx';

const HomePage = (): ReactElement => {
	return (
		<main className='page'>
			<h1>
				Midnight Indigo<span className='official-text'>: UI</span>
			</h1>
			<ThemeSummary />
			<Suspense fallback={<p className='panel'>Loading the streamed panel…</p>}>
				<StreamedPanel />
			</Suspense>
		</main>
	);
};

export default HomePage;
