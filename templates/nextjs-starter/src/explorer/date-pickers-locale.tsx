'use client';
// The locale of the date and time pickers of the explorer, from the locale of the page: the order of the sections, the
// names of the months and days and the texts of MUI X. A client module, since the locales of date-fns hold functions,
// which a Server Component cannot pass on.
import { DatePickersProvider } from '@midnight-indigo/ui/forms/date-pickers';
import type { DatePickersLocaleText } from '@midnight-indigo/ui/forms/date-pickers';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactElement, ReactNode } from 'react';

import type { LocaleSegment } from '#src/i18n/locales.ts';

interface PickersLocale {
	locale: Locale;
	/** Absent for English, the language of MUI X. */
	localeText?: DatePickersLocaleText;
}

const pickersLocales: Readonly<Record<LocaleSegment, PickersLocale>> = {
	'en-us': { locale: enUS },
	'pt-br': {
		locale: ptBR,
		localeText: pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText,
	},
};

interface ExplorerDatePickersProviderProps {
	locale: LocaleSegment;
	children: ReactNode;
}

export const ExplorerDatePickersProvider = ({
	locale,
	children,
}: ExplorerDatePickersProviderProps): ReactElement => {
	return <DatePickersProvider {...pickersLocales[locale]}>{children}</DatePickersProvider>;
};
