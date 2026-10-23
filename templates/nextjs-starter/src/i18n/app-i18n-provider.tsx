'use client';
// Locale of the application and of the library texts. The root layout reads the locale from the route and gives it with
// its messages, so the server and the browser render the same text; the time zone and the currency are set here, never
// taken from the machine.
import { I18nProvider } from '@midnight-indigo/ui/i18n';
import type { Messages } from '@midnight-indigo/ui/i18n';
import type { ReactElement, ReactNode } from 'react';

import { currency, localeTags, timeZone } from '@/src/i18n/locales';

interface AppI18nProviderProps {
	/** BCP 47 tag, e.g. `pt-BR`. */
	locale: string;
	/** The messages of `locale` only: the others never reach the browser. */
	messages: Messages;
	children: ReactNode;
}

export const AppI18nProvider = ({
	locale,
	messages,
	children,
}: AppI18nProviderProps): ReactElement => {
	return (
		<I18nProvider
			locale={locale}
			fallbackLocale={localeTags['en-us']}
			resources={{ [locale]: { translation: messages } }}
			timeZone={timeZone}
			currency={currency}
		>
			{children}
		</I18nProvider>
	);
};
