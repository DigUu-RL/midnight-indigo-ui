// Texts of the components as i18next resources, in a namespace of their own so they never collide with the keys of
// the application.
import type { ComponentName } from '#src/shared/component-labels/index.tsx';
import { englishMessages } from '#src/i18n/messages/en-us.ts';
import { brazilianPortugueseMessages } from '#src/i18n/messages/pt-br.ts';

/** JSON messages of one namespace: strings, possibly grouped in nested objects. */
export interface Messages {
	readonly [key: string]: string | Messages;
}

/** Messages by locale and namespace, e.g. `{ 'pt-BR': { translation: { ... } } }`. */
export type I18nResources = Readonly<Record<string, Readonly<Record<string, Messages>>>>;

/** The texts of every component, by component name; see `englishMessages` for the keys. */
export type LibraryMessages = Readonly<Record<ComponentName, Messages>>;

/** Namespace of the component texts. Add messages to it to translate or override them. */
export const libraryNamespace: string = 'midnight-indigo';

/** The locales maintained by the library, ready to be merged with those of the application. */
export const libraryResources: I18nResources = Object.freeze({
	'en-US': { [libraryNamespace]: englishMessages },
	'pt-BR': { [libraryNamespace]: brazilianPortugueseMessages },
});

const isMessages = (value: string | Messages | undefined): value is Messages => {
	return typeof value === 'object';
};

const mergeMessages = (base: Messages, override: Messages): Messages => {
	const merged: Record<string, string | Messages> = { ...base };

	Object.entries(override).forEach(([key, value]: [string, string | Messages]): void => {
		const current: string | Messages | undefined = merged[key];
		merged[key] = isMessages(current) && isMessages(value) ? mergeMessages(current, value) : value;
	});

	return merged;
};

/** Deep merge of resources: messages of `override` replace those of `base` key by key. */
export const mergeResources = (base: I18nResources, override: I18nResources): I18nResources => {
	const merged: Record<string, Record<string, Messages>> = {};

	[base, override].forEach((resources: I18nResources): void => {
		Object.entries(resources).forEach(
			([locale, namespaces]: [string, Readonly<Record<string, Messages>>]): void => {
				const target: Record<string, Messages> = merged[locale] ?? {};
				merged[locale] = target;

				Object.entries(namespaces).forEach(([namespace, messages]: [string, Messages]): void => {
					const current: Messages | undefined = target[namespace];
					target[namespace] = current === undefined ? messages : mergeMessages(current, messages);
				});
			},
		);
	});

	return merged;
};
