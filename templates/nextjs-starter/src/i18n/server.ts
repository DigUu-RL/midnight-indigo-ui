// Translation in Server Components: the page headings, the metadata and every text rendered without JavaScript. One
// i18next instance per request and locale (React `cache`), never a module-level one shared between requests.
import { createI18n } from '@midnight-indigo/ui/i18n';
import type { i18n, TFunction } from 'i18next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { currency, isLocaleSegment, localeTags, timeZone } from '#src/i18n/locales.ts';
import type { LocaleSegment } from '#src/i18n/locales.ts';
import { messagesOf } from '#src/i18n/messages.ts';

/** `params` of every page and layout under `app/[locale]`. */
export interface LocaleParams {
	params: Promise<{ locale: string }>;
}

/** The locale of the route; an unknown one is a missing page. */
export const localeOf = async ({ params }: LocaleParams): Promise<LocaleSegment> => {
	const { locale }: { locale: string } = await params;
	if (!isLocaleSegment(locale)) notFound();
	return locale;
};

export const getTranslator = cache(async (locale: LocaleSegment): Promise<TFunction> => {
	const instance: i18n = await createI18n({
		locale: localeTags[locale],
		fallbackLocale: localeTags['en-us'],
		resources: { [localeTags[locale]]: { translation: messagesOf(locale) } },
		timeZone,
		currency,
	});

	return instance.t;
});
