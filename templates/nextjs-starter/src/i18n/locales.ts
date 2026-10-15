// The locales of the starter. The URL carries the locale as its first segment, in lower case (`/pt-br/orders`); the
// messages, the formatters and `<html lang>` use its BCP 47 tag (`pt-BR`). Nothing here depends on React or Next.js,
// so the proxy, the server and the browser share it.

export type LocaleSegment = 'en-us' | 'pt-br';

export const localeSegments: readonly LocaleSegment[] = ['en-us', 'pt-br'];

export const defaultLocaleSegment: LocaleSegment = 'en-us';

export const localeTags: Readonly<Record<LocaleSegment, string>> = {
	'en-us': 'en-US',
	'pt-br': 'pt-BR',
};

/** The name of each language in that language, so that a reader finds their own whatever the page is in. */
export const localeNames: Readonly<Record<LocaleSegment, string>> = {
	'en-us': 'English',
	'pt-br': 'Português',
};

/** The language the user chose last in the language links, so that `/` opens in it. */
export const localeCookieName: string = 'locale';

const localeCookieMaximumAgeInSeconds: number = 60 * 60 * 24 * 365;

/** The `document.cookie` assignment that remembers a chosen locale for a year. */
export const localeCookieOf = (locale: LocaleSegment): string => {
	return `${localeCookieName}=${locale}; Path=/; Max-Age=${String(localeCookieMaximumAgeInSeconds)}; SameSite=Lax`;
};

/** Request header in which the proxy passes the locale of the path, for the page of a missing path. */
export const localeHeaderName: string = 'x-locale';

/** Dates and amounts follow the business, not the language: the Aurora stores are in Brazil. */
export const timeZone: string = 'America/Sao_Paulo';
export const currency: string = 'BRL';

export const isLocaleSegment = (value: string | undefined): value is LocaleSegment => {
	return localeSegments.includes(value as LocaleSegment);
};

/** The locale of a path, or `undefined` when its first segment is not one: `/pt-br/orders` → `pt-br`. */
export const localeOfPath = (path: string): LocaleSegment | undefined => {
	const [, segment]: string[] = path.split('/');
	return isLocaleSegment(segment) ? segment : undefined;
};

/** The same page in another locale: `/pt-br/orders` → `/en-us/orders`; a path without a locale gets one. */
export const localizePath = (path: string, locale: LocaleSegment): string => {
	const rest: string = localeOfPath(path) === undefined ? path : path.replace(/^\/[^/]+/, '');
	return `/${locale}${rest === '/' ? '' : rest}`;
};

interface LanguagePreference {
	tag: string;
	weight: number;
}

const preferenceOf = (entry: string): LanguagePreference => {
	const [tag = '', ...parameters]: string[] = entry.trim().toLowerCase().split(';');

	const weight: string | undefined = parameters.find((parameter: string): boolean => {
		return parameter.trim().startsWith('q=');
	});

	return { tag, weight: weight === undefined ? 1 : Number(weight.trim().slice(2)) || 0 };
};

const segmentForTag = (tag: string): LocaleSegment | undefined => {
	const language: string = tag.split('-')[0] ?? '';

	return isLocaleSegment(tag)
		? tag
		: localeSegments.find((segment: LocaleSegment): boolean => segment.startsWith(`${language}-`));
};

/**
 * The supported locale the browser prefers, from its `Accept-Language` header: an exact match first, then the same
 * language in another region (`pt-PT` → `pt-br`, `en-GB` → `en-us`). `undefined` when it accepts none of them.
 */
export const negotiateLocale = (acceptLanguage: string | null): LocaleSegment | undefined => {
	return (acceptLanguage ?? '')
		.split(',')
		.map(preferenceOf)
		.filter((preference: LanguagePreference): boolean => preference.weight > 0)
		.toSorted((first: LanguagePreference, second: LanguagePreference): number => {
			return second.weight - first.weight;
		})
		.map((preference: LanguagePreference): LocaleSegment | undefined => {
			return segmentForTag(preference.tag);
		})
		.find((segment: LocaleSegment | undefined): boolean => segment !== undefined);
};
