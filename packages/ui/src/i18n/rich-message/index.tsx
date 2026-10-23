'use client';
// A translation with tags, as an element of a Client Component. In a Server Component, use `rich` of
// `createRichTranslator` instead.
import type { ReactElement } from 'react';

import { useI18n } from '@/src/i18n/i18n-provider/index';
import type { I18nValue } from '@/src/i18n/i18n-provider/index';
import type { RichTags, RichValues } from '@/src/i18n/rich-text';

export interface RichMessageProps {
	/** Key of the message, e.g. `'orders.empty'`; `'namespace:key'` reaches another namespace. */
	messageKey: string | readonly string[];
	/** Interpolation values and i18next options (`count`, `context`, ...); the values are always text. */
	values?: RichValues | undefined;
	/** Tags of the application, e.g. `{ link: (children) => <Link href='/orders'>{children}</Link> }`. */
	tags?: RichTags | undefined;
	/** Namespace(s) of `messageKey`. Defaults to the default namespace of the `I18nProvider`. */
	namespace?: string | readonly string[] | undefined;
}

/** Renders the message of `messageKey` with its tags, inside an `I18nProvider`. */
export const RichMessage = ({
	messageKey,
	values,
	tags,
	namespace,
}: RichMessageProps): ReactElement => {
	const { rich }: I18nValue = useI18n(namespace);
	return <>{rich(messageKey, values, tags)}</>;
};
