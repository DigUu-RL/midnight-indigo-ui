// Public subpath `@midnight-indigo/ui/i18n`. Requires the optional peers `i18next` and `react-i18next`; the other
// subpaths never load them.
export { createI18n } from '#src/i18n/create-i18n.ts';
export type { I18nOptions } from '#src/i18n/create-i18n.ts';
export { createFormatters, FormattersConfigurationError } from '#src/i18n/formatters.ts';
export type { Formatters, FormattersOptions } from '#src/i18n/formatters.ts';
export { I18nProvider, useFormatters, useI18n } from '#src/i18n/i18n-provider/index.tsx';
export type { I18nProviderProps, I18nValue } from '#src/i18n/i18n-provider/index.tsx';
export { libraryNamespace, libraryResources, mergeResources } from '#src/i18n/library-messages.ts';
export type { I18nResources, LibraryMessages, Messages } from '#src/i18n/library-messages.ts';
export { englishMessages } from '#src/i18n/messages/en-us.ts';
export { brazilianPortugueseMessages } from '#src/i18n/messages/pt-br.ts';
export type {
	ComponentLabels,
	ComponentLabelTypes,
	ComponentName,
} from '#src/shared/component-labels/index.tsx';
