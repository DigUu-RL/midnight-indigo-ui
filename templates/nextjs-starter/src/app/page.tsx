// Home page (Server Component). The streamed panel proves that late chunks reuse the theme already in the head.
import { themeVariables } from '@midnight-indigo/ui/theme';
import { Suspense } from 'react';
import type { ReactElement } from 'react';

import { ComponentsShowcase } from '#src/app/components-showcase.tsx';
import { OverlaysShowcase } from '#src/app/overlays-showcase.tsx';
import { ProfileForm } from '#src/app/profile-form.tsx';
import { StreamedPanel } from '#src/app/streamed-panel.tsx';
import { ThemeSummary } from '#src/app/theme-summary.tsx';
import { TypographySpecimen } from '#src/app/typography-specimen.tsx';

const HomePage = (): ReactElement => {
	return (
		<main className='page'>
			<h1 style={themeVariables.typography.headingLarge}>
				Midnight Indigo<span className='official-text'>: UI</span>
			</h1>
			<ThemeSummary />
			<TypographySpecimen />
			<ComponentsShowcase />
			<ProfileForm />
			<OverlaysShowcase />
			<Suspense fallback={<p className='panel'>Loading the streamed panel…</p>}>
				<StreamedPanel />
			</Suspense>
		</main>
	);
};

export default HomePage;
