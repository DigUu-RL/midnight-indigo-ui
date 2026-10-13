'use client';
// Gives the application `t` and the formatters, and every component of the library its texts, in the locale given by
// the application.
import { createContext, use, useEffect, useMemo, useState } from 'react';
import type { Context, ReactElement, ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import type { i18n as I18nInstance, TFunction } from 'i18next';

import { ComponentLabelsProvider } from '#src/shared/component-labels/index.tsx';
import type { ComponentLabels } from '#src/shared/component-labels/index.tsx';
import { createComponentLabels } from '#src/i18n/component-labels.ts';
import { initializeI18n } from '#src/i18n/create-i18n.ts';
import type { I18nOptions } from '#src/i18n/create-i18n.ts';
import { createFormatters } from '#src/i18n/formatters.ts';
import type { Formatters } from '#src/i18n/formatters.ts';
import { libraryNamespace, mergeResources } from '#src/i18n/library-messages.ts';
import type { I18nResources, Messages } from '#src/i18n/library-messages.ts';

export interface I18nProviderProps extends I18nOptions {
	children?: ReactNode;
}

interface I18nState {
	instance: I18nInstance;
	formatters: Formatters;
}

const I18nContext: Context<I18nState | null> = createContext<I18nState | null>(null);

const addResources = (instance: I18nInstance, resources: I18nResources): void => {
	Object.entries(resources).forEach(
		([locale, namespaces]: [string, Readonly<Record<string, Messages>>]): void => {
			Object.entries(namespaces).forEach(([namespace, messages]: [string, Messages]): void => {
				instance.addResourceBundle(locale, namespace, messages, true, true);
			});
		},
	);
};

/**
 * Client Component. The locale, time zone and currency are props, so the server and the browser render the same text:
 * in the Next.js App Router, read the locale from the route (or a cookie) in the root layout and pass it, with the
 * messages of the first render in `resources`. `loadMessages` and `onMissingKey` are functions, so pass them from a
 * Client Component of the application. The instance is created once; a new `locale` changes its language, and new
 * `resources` are merged into it.
 */
export const I18nProvider = ({ children, ...options }: I18nProviderProps): ReactElement => {
	const { locale, resources, timeZone, currency }: I18nOptions = options;
	const [instance] = useState((): I18nInstance => initializeI18n(options).instance);
	const [addedResources, setAddedResources] = useState<I18nResources | undefined>(resources);

	// Resources given after the first render are merged during render, so they are in the first commit that uses them.
	if (resources !== addedResources) {
		setAddedResources(resources);
		addResources(instance, mergeResources({}, resources ?? {}));
	}

	useEffect((): void => {
		if (instance.language !== locale) void instance.changeLanguage(locale);
	}, [instance, locale]);

	// Subscribes to language changes and loads, which produce a new `t`.
	const { t }: { t: TFunction } = useTranslation(libraryNamespace, { i18n: instance });
	const language: string = instance.language;

	const formatters: Formatters = useMemo((): Formatters => {
		return createFormatters({ locale: language, timeZone, currency });
	}, [language, timeZone, currency]);

	const labels: ComponentLabels = useMemo((): ComponentLabels => {
		return createComponentLabels(instance, language, formatters);
		// `t` is not read, but it changes whenever messages are loaded or added.
	}, [instance, language, formatters, t]);

	const state: I18nState = useMemo(
		(): I18nState => ({ instance, formatters }),
		[instance, formatters],
	);

	return (
		<I18nextProvider i18n={instance}>
			<I18nContext value={state}>
				<ComponentLabelsProvider labels={labels}>{children}</ComponentLabelsProvider>
			</I18nContext>
		</I18nextProvider>
	);
};

const useI18nState = (hook: string): I18nState => {
	const state: I18nState | null = use(I18nContext);

	if (state === null) {
		throw new Error(`[Midnight Indigo: UI] ${hook} must be used inside an I18nProvider.`);
	}

	return state;
};

export interface I18nValue extends Formatters {
	/** Translates keys of the namespace given to `useI18n` (or the default one); `'namespace:key'` reaches others. */
	t: TFunction;
	/** Changes the language of the provider; the promise settles when its messages are loaded. */
	changeLocale: (locale: string) => Promise<void>;
	/** The i18next instance, for anything this hook does not cover. */
	i18n: I18nInstance;
}

/** `t` for the namespace(s), the locale and the formatters of the nearest `I18nProvider`. */
export const useI18n = (namespace?: string | readonly string[]): I18nValue => {
	const { instance, formatters }: I18nState = useI18nState('useI18n');

	const { t }: { t: TFunction } = useTranslation(
		namespace === undefined || typeof namespace === 'string' ? namespace : [...namespace],
		{ i18n: instance },
	);

	return {
		...formatters,
		t,
		changeLocale: async (locale: string): Promise<void> => {
			await instance.changeLanguage(locale);
		},
		i18n: instance,
	};
};

/** The formatters of the nearest `I18nProvider`: its locale, time zone and currency. */
export const useFormatters = (): Formatters => useI18nState('useFormatters').formatters;
