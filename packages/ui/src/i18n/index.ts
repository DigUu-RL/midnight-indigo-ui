// Public subpath `@midnight-indigo/ui/i18n`. Requires the optional peers `i18next` and `react-i18next`; the other
// subpaths never load them.
export { createI18n } from '@/src/i18n/create-i18n';
export type { I18nOptions } from '@/src/i18n/create-i18n';
export { createFormatters, FormattersConfigurationError } from '@/src/i18n/formatters';
export type { Formatters, FormattersOptions } from '@/src/i18n/formatters';
export { I18nProvider, useFormatters, useI18n } from '@/src/i18n/i18n-provider/index';
export type { I18nProviderProps, I18nValue } from '@/src/i18n/i18n-provider/index';
export { RichMessage } from '@/src/i18n/rich-message/index';
export type { RichMessageProps } from '@/src/i18n/rich-message/index';
export {
	createRichTranslator,
	defaultRichTags,
	renderRichText,
	toPlainText,
} from '@/src/i18n/rich-text';
export type {
	MalformedMessageHandler,
	RichTag,
	RichTags,
	RichTextOptions,
	RichTextProblem,
	RichTranslator,
	RichTranslatorOptions,
	RichValues,
} from '@/src/i18n/rich-text';
export { libraryNamespace, libraryResources, mergeResources } from '@/src/i18n/library-messages';
export type { I18nResources, LibraryMessages, Messages } from '@/src/i18n/library-messages';
export { englishMessages } from '@/src/i18n/messages/en-us';
export { brazilianPortugueseMessages } from '@/src/i18n/messages/pt-br';
export type {
	ComponentLabels,
	ComponentLabelTypes,
	ComponentName,
} from '@/src/shared/component-labels/index';
