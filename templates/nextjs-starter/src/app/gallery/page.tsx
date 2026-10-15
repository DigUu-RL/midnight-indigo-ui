// Component gallery (Server Component). The streamed panel proves that late chunks reuse the theme already in the head.
import { themeVariables } from '@midnight-indigo/ui/theme';
import { Suspense } from 'react';
import type { ReactElement } from 'react';

import { ComponentsShowcase } from '#src/gallery/components-showcase.tsx';
import { DataDisplayShowcase } from '#src/gallery/data-display-showcase.tsx';
import { NavigationShowcase } from '#src/gallery/navigation-showcase.tsx';
import { OverlaysShowcase } from '#src/gallery/overlays-showcase.tsx';
import { ProfileForm } from '#src/gallery/profile-form.tsx';
import { StreamedPanel } from '#src/gallery/streamed-panel.tsx';
import { ThemeSummary } from '#src/gallery/theme-summary.tsx';
import { TypographySpecimen } from '#src/gallery/typography-specimen.tsx';

const GalleryPage = (): ReactElement => {
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
			<NavigationShowcase />
			<DataDisplayShowcase />

			<Suspense fallback={<p className='panel'>Loading the streamed panel…</p>}>
				<StreamedPanel />
			</Suspense>
		</main>
	);
};

export default GalleryPage;
