// The messages of the application, by locale. Imported only by Server Components: the browser receives the messages
// of the locale being rendered, as props of `AppI18nProvider`, never the others.
import type { Messages } from '@midnight-indigo/ui/i18n';

import type { LocaleSegment } from '#src/i18n/locales.ts';
import englishMessages from '#src/messages/en-us.json' with { type: 'json' };
import brazilianPortugueseMessages from '#src/messages/pt-br.json' with { type: 'json' };

const messagesByLocale: Readonly<Record<LocaleSegment, Messages>> = {
	'en-us': englishMessages,
	'pt-br': brazilianPortugueseMessages,
};

export const messagesOf = (locale: LocaleSegment): Messages => messagesByLocale[locale];
