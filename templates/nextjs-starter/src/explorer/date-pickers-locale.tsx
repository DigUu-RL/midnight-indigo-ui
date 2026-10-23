'use client';
// The locale of the date and time pickers of the explorer, from the locale of the page: the order of the parts of their
// fields and the names of the months and of the days; their texts come with the other messages of the library. A
// client module, since the locales of date-fns hold functions, which a Server Component cannot pass on.
import { DatePickersProvider } from '@midnight-indigo/ui/forms/date-pickers';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactElement, ReactNode } from 'react';

import type { LocaleSegment } from '#src/i18n/locales.ts';

const pickersLocales: Readonly<Record<LocaleSegment, Locale>> = { 'en-us': enUS, 'pt-br': ptBR };

interface ExplorerDatePickersProviderProps {
	locale: LocaleSegment;
	children: ReactNode;
}

export const ExplorerDatePickersProvider = ({
	locale,
	children,
}: ExplorerDatePickersProviderProps): ReactElement => {
	return <DatePickersProvider locale={pickersLocales[locale]}>{children}</DatePickersProvider>;
};
