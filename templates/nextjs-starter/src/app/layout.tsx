// Root layout (Server Component). The Emotion cache provider must wrap `UiProvider` so that Material UI styles
// are collected during server rendering and streamed into the `<head>` instead of being injected after hydration.
// Inter is self-hosted: the font package ships the files, the bundler serves them and no request leaves the origin.
import '@fontsource-variable/inter';
import { UiProvider } from '@midnight-indigo/ui/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { theme } from '#src/theme.ts';
import '#src/app/globals.css';

interface RootLayoutProps {
	children: ReactNode;
}

export const metadata: Metadata = {
	title: 'Midnight Indigo: UI starter',
};

const RootLayout = ({ children }: Readonly<RootLayoutProps>): ReactElement => {
	return (
		<html lang='en'>
			<body>
				<AppRouterCacheProvider>
					<UiProvider theme={theme}>{children}</UiProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
};

export default RootLayout;
