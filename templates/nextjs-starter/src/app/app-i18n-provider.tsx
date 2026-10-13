'use client';
// Locale of the application and of the library texts. The root layout gives the locale, so the server and the browser
// render the same text; the time zone and the currency are set here, never taken from the machine.
import { I18nProvider } from '@midnight-indigo/ui/i18n';
import type { ReactElement, ReactNode } from 'react';

interface AppI18nProviderProps {
	locale: string;
	children: ReactNode;
}

export const AppI18nProvider = ({ locale, children }: AppI18nProviderProps): ReactElement => {
	return (
		<I18nProvider
			locale={locale}
			fallbackLocale='en-US'
			timeZone='America/Sao_Paulo'
			currency='BRL'
		>
			{children}
		</I18nProvider>
	);
};
