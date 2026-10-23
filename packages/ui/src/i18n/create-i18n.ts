// A configured i18next instance per call (never the global one), so concurrent server requests and nested providers
// do not share a language.
import i18next from 'i18next';
import type { BackendModule, i18n as I18nInstance, InitOptions, ReadCallback } from 'i18next';

import { createFormatters } from '@/src/i18n/formatters';
import type { Formatters } from '@/src/i18n/formatters';
import { libraryNamespace, libraryResources, mergeResources } from '@/src/i18n/library-messages';
import type { I18nResources, Messages } from '@/src/i18n/library-messages';

export interface I18nOptions {
	/** Locale to render, e.g. `'pt-BR'`. Given by the application (route, cookie, user setting), never detected. */
	locale: string;
	/** Locale(s) used for keys the locale does not have, e.g. `'en-US'`. */
	fallbackLocale: string | readonly string[];
	/** Messages bundled with the application, by locale and namespace. Merged over the texts of the library. */
	resources?: I18nResources | undefined;
	/**
	 * Loads the messages of a locale and namespace that `resources` lacks (e.g. `import()` of a JSON file), on creation
	 * and when the locale changes. Resolve `undefined` when there are none.
	 */
	loadMessages?: ((locale: string, namespace: string) => Promise<Messages | undefined>) | undefined;
	/** Namespaces of the application to load. Defaults to those in `resources`, or `['translation']`. */
	namespaces?: readonly string[] | undefined;
	/** Namespace of `t` when the key names none. Defaults to the first of `namespaces`. */
	defaultNamespace?: string | undefined;
	/** IANA time zone of the dates, e.g. `'America/Sao_Paulo'`; also used by `{{value, datetime}}` in messages. */
	timeZone?: string | undefined;
	/** ISO 4217 code, e.g. `'BRL'`; also used by `{{value, currency}}` in messages. */
	currency?: string | undefined;
	/** Called once per key that resolves in no locale. Defaults to `console.warn`; pass `() => {}` to silence it. */
	onMissingKey?: ((key: string, namespace: string, locales: readonly string[]) => void) | undefined;
	/** Any other i18next option, applied last (e.g. `interpolation`, `keySeparator`). */
	options?: InitOptions | undefined;
}

export interface CreatedI18n {
	instance: I18nInstance;
	/** Settles once the resources of the locale are loaded; at once when they are all in `resources`. */
	ready: Promise<I18nInstance>;
}

const warnInConsole = (key: string, namespace: string, locales: readonly string[]): void => {
	console.warn(
		`[Midnight Indigo: UI] Missing translation "${namespace}:${key}" for ${locales.join(', ')}.`,
	);
};

const messagesBackend = (
	loadMessages: (locale: string, namespace: string) => Promise<Messages | undefined>,
): BackendModule => {
	return {
		type: 'backend',
		init: (): void => undefined,
		read: (locale: string, namespace: string, callback: ReadCallback): void => {
			loadMessages(locale, namespace).then(
				(messages: Messages | undefined): void => {
					callback(null, messages ?? {});
				},
				(error: unknown): void => {
					callback(error instanceof Error ? error : new Error(String(error)), false);
				},
			);
		},
	};
};

const applicationNamespaces = (resources: I18nResources): string[] => {
	const namespaces: Set<string> = new Set<string>(
		Object.values(resources).flatMap(
			(byNamespace: Readonly<Record<string, Messages>>): string[] => {
				return Object.keys(byNamespace);
			},
		),
	);

	namespaces.delete(libraryNamespace);
	return namespaces.size === 0 ? ['translation'] : [...namespaces];
};

const dateOptionNames: readonly string[] = [
	'dateStyle',
	'timeStyle',
	'calendar',
	'dayPeriod',
	'numberingSystem',
	'hour12',
	'hourCycle',
	'timeZone',
	'weekday',
	'era',
	'year',
	'month',
	'day',
	'hour',
	'minute',
	'second',
	'fractionalSecondDigits',
	'timeZoneName',
];

const numberOptionNames: readonly string[] = [
	'currency',
	'currencyDisplay',
	'currencySign',
	'notation',
	'compactDisplay',
	'signDisplay',
	'useGrouping',
	'minimumIntegerDigits',
	'minimumFractionDigits',
	'maximumFractionDigits',
	'minimumSignificantDigits',
	'maximumSignificantDigits',
	'roundingMode',
	'trailingZeroDisplay',
	'numberingSystem',
];

// i18next passes the options of the `t` call along with those of the format; only the `Intl` ones are kept, so that
// the cached formats do not vary with the interpolated values.
const pickOptions = (options: object, names: readonly string[]): Record<string, unknown> => {
	return Object.fromEntries(
		Object.entries(options).filter(([name]: [string, unknown]): boolean => names.includes(name)),
	);
};

const pickDateOptions = (options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions => {
	return pickOptions(options, dateOptionNames);
};

const pickNumberOptions = (options: Intl.NumberFormatOptions): Intl.NumberFormatOptions => {
	return pickOptions(options, numberOptionNames);
};

// `{{value, datetime}}` and `{{value, currency}}` of i18next would use the time zone of the runtime and require a
// currency in every message; these use the configured ones.
const configureFormats = (instance: I18nInstance, timeZone?: string, currency?: string): void => {
	const formattersByLocale: Map<string, Formatters> = new Map<string, Formatters>();

	const formattersFor = (locale: string): Formatters => {
		const existing: Formatters | undefined = formattersByLocale.get(locale);
		if (existing !== undefined) return existing;

		const created: Formatters = createFormatters({ locale, timeZone, currency });
		formattersByLocale.set(locale, created);
		return created;
	};

	const localeOf = (locale: string | undefined): string => locale ?? instance.language;

	instance.services.formatter?.add(
		'datetime',
		(
			value: Date | number,
			locale: string | undefined,
			options: Intl.DateTimeFormatOptions,
		): string => {
			return formattersFor(localeOf(locale)).formatDate(value, pickDateOptions(options));
		},
	);

	instance.services.formatter?.add(
		'currency',
		(value: number, locale: string | undefined, options: Intl.NumberFormatOptions): string => {
			return formattersFor(localeOf(locale)).formatCurrency(value, pickNumberOptions(options));
		},
	);
};

/** Creates the instance synchronously; with `loadMessages`, `ready` settles when the loads finish. */
export const initializeI18n = ({
	locale,
	fallbackLocale,
	resources = {},
	loadMessages,
	namespaces,
	defaultNamespace,
	timeZone,
	currency,
	onMissingKey = warnInConsole,
	options = {},
}: I18nOptions): CreatedI18n => {
	const instance: I18nInstance = i18next.createInstance();
	if (loadMessages !== undefined) instance.use(messagesBackend(loadMessages));

	const ownNamespaces: readonly string[] = namespaces ?? applicationNamespaces(resources);
	const reportedKeys: Set<string> = new Set<string>();

	const ready: Promise<I18nInstance> = instance
		.init({
			lng: locale,
			fallbackLng: typeof fallbackLocale === 'string' ? fallbackLocale : [...fallbackLocale],
			resources: mergeResources(libraryResources, resources),
			partialBundledLanguages: loadMessages !== undefined,
			ns: [...ownNamespaces, libraryNamespace],
			defaultNS: defaultNamespace ?? ownNamespaces[0] ?? 'translation',
			initAsync: false,
			// Keys stay camelCase: plural categories and contexts are nested objects (`count: { one, other }`), not
			// `_one`/`_other` suffixes.
			pluralSeparator: '.',
			contextSeparator: '.',
			// React escapes the text it renders; escaping here would show `&amp;` in a file name.
			interpolation: { escapeValue: false },
			saveMissing: true,
			// i18next calls it at every `t` of the key; a re-render would repeat the report.
			missingKeyHandler: (locales: readonly string[], namespace: string, key: string): void => {
				const reportKey: string = `${locales.join(',')}|${namespace}:${key}`;
				if (reportedKeys.has(reportKey)) return;

				reportedKeys.add(reportKey);
				onMissingKey(key, namespace, locales);
			},
			// The provider re-renders on language and store changes instead of suspending.
			react: { useSuspense: false, bindI18n: 'languageChanged loaded', bindI18nStore: 'added' },
			...options,
		})
		.then((): I18nInstance => instance);

	configureFormats(instance, timeZone, currency);
	return { instance, ready };
};

/**
 * A ready i18next instance, with the texts of the library and the formats configured. Use it where there is no
 * React tree, e.g. to translate in a Server Component, a route handler or a test.
 */
export const createI18n = async (options: I18nOptions): Promise<I18nInstance> => {
	return initializeI18n(options).ready;
};
