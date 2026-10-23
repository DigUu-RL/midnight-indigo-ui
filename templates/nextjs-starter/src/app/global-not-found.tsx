// The page of any path no route matches (Server Component). The root layout is inside `app/[locale]`, so Next.js has no
// layout to compose a 404 from: this file renders the whole document itself, with the providers and the shell, in the
// language of the path. The proxy has given every such path a locale and passes it in a request header.
import { headers } from 'next/headers';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
	defaultLocaleSegment,
	isLocaleSegment,
	localeHeaderName,
	localeTags,
} from '@/src/i18n/locales';
import type { LocaleSegment } from '@/src/i18n/locales';
import { messagesOf } from '@/src/i18n/messages';
import { getTranslator } from '@/src/i18n/server';
import { AppProviders } from '@/src/shell/app-providers';
import { AppShell } from '@/src/shell/app-shell';
import { NotFoundContent } from '@/src/shell/not-found-content';

const requestedLocale = async (): Promise<LocaleSegment> => {
	const locale: string | undefined = (await headers()).get(localeHeaderName) ?? undefined;
	return isLocaleSegment(locale) ? locale : defaultLocaleSegment;
};

export const generateMetadata = async (): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await requestedLocale());
	return { title: `${translate('notFound.title')} · ${translate('app.name')}` };
};

const GlobalNotFound = async (): Promise<ReactElement> => {
	const locale: LocaleSegment = await requestedLocale();

	return (
		<html lang={localeTags[locale]}>
			<body>
				<AppProviders locale={localeTags[locale]} messages={messagesOf(locale)}>
					<AppShell locale={locale}>
						<NotFoundContent locale={locale} />
					</AppShell>
				</AppProviders>
			</body>
		</html>
	);
};

export default GlobalNotFound;
