// The providers of every page (Server Component). The Emotion cache provider must wrap `UiProvider` so that Material UI
// styles are collected during server rendering and streamed into the `<head>` instead of being injected after
// hydration. Geist Sans and Geist Mono are self-hosted: the font packages ship the files, the bundler serves them and no
// request leaves the origin.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { ToastProvider } from '@midnight-indigo/ui/feedback';
import type { Messages } from '@midnight-indigo/ui/i18n';
import { UiProvider } from '@midnight-indigo/ui/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { ReactElement, ReactNode } from 'react';

import { AppI18nProvider } from '@/src/i18n/app-i18n-provider';
import { AppNavigationProvider } from '@/src/shell/app-navigation-provider';
import { theme } from '@/src/theme';
import '@/src/shell/globals.css';

interface AppProvidersProps {
	/** BCP 47 tag, e.g. `pt-BR`. */
	locale: string;
	messages: Messages;
	children: ReactNode;
}

export const AppProviders = ({ locale, messages, children }: AppProvidersProps): ReactElement => {
	return (
		<AppRouterCacheProvider>
			<UiProvider theme={theme}>
				<AppI18nProvider locale={locale} messages={messages}>
					<AppNavigationProvider>
						<ToastProvider>{children}</ToastProvider>
					</AppNavigationProvider>
				</AppI18nProvider>
			</UiProvider>
		</AppRouterCacheProvider>
	);
};
