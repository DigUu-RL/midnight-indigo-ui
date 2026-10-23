// Root layout of the component gallery (Server Component): a specimen sheet of every component, used by the visual
// regression tests. It is a reference for developers, not a page of the application, so it is not translated and
// lives outside `app/[locale]`, with its own root layout in English.
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { localeTags } from '@/src/i18n/locales';
import { messagesOf } from '@/src/i18n/messages';
import { AppProviders } from '@/src/shell/app-providers';

interface GalleryLayoutProps {
	children: ReactNode;
}

export const metadata: Metadata = {
	title: 'Component gallery · Midnight Indigo: UI starter',
};

const GalleryLayout = ({ children }: Readonly<GalleryLayoutProps>): ReactElement => {
	return (
		<html lang={localeTags['en-us']}>
			<body>
				<AppProviders locale={localeTags['en-us']} messages={messagesOf('en-us')}>
					{children}
				</AppProviders>
			</body>
		</html>
	);
};

export default GalleryLayout;
