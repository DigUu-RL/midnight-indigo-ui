// Root layout (Server Component). The Emotion cache provider must wrap `UiProvider` so that Material UI styles
// are collected during server rendering and streamed into the `<head>` instead of being injected after hydration.
// Geist Sans is self-hosted: the font package ships the files, the bundler serves them and no request leaves the
// origin.
import '@fontsource-variable/geist';
import { ToastProvider } from '@midnight-indigo/ui/feedback';
import { UiProvider } from '@midnight-indigo/ui/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { AppNavigationProvider } from '#src/app/app-navigation-provider.tsx';
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
					<UiProvider theme={theme}>
						<AppNavigationProvider>
							<ToastProvider>{children}</ToastProvider>
						</AppNavigationProvider>
					</UiProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
};

export default RootLayout;
