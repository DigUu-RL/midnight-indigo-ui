'use client';
// Locale of the date and time pickers: the order of the parts of their fields, the names of the months and of the days,
// the first day of the week and the 12 or 24-hour clock, all from a date-fns locale.
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { createContext, use } from 'react';
import type { Context, ReactElement, ReactNode } from 'react';

export interface DatePickersProviderProps {
	/**
	 * date-fns locale: order of the parts of the fields, month and day names, first day of the week, 12 or 24-hour
	 * clock. Defaults to `en-US`. Import only the locales you use, e.g. `import { ptBR } from 'date-fns/locale/pt-BR'`.
	 */
	locale?: Locale | undefined;
	/** The application, or the part of it with pickers. */
	children: ReactNode;
}

const DatePickersLocaleContext: Context<Locale> = createContext<Locale>(enUS);

/** The date-fns locale of the nearest `DatePickersProvider`, else `en-US`. */
export const usePickersLocale = (): Locale => use(DatePickersLocaleContext);

/**
 * Put it once around the pickers (e.g. next to `UiProvider`). The locale is given by the application and never
 * inferred, so the server and the browser render the same text; it says nothing about the time zone. The texts of the
 * pickers (buttons, presets, placeholders) are component labels, translated by `I18nProvider` like the others.
 */
export const DatePickersProvider = ({
	locale = enUS,
	children,
}: DatePickersProviderProps): ReactElement => {
	return <DatePickersLocaleContext value={locale}>{children}</DatePickersLocaleContext>;
};
