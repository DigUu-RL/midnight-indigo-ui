'use client';
// Locale of the date and time pickers: date-fns for parsing and formatting, MUI X texts for the controls.
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PickersInputLocaleText } from '@mui/x-date-pickers/locales';
import type { Locale } from 'date-fns';
import type { ReactElement, ReactNode } from 'react';

/** Texts of the pickers; also accepts the locale objects of MUI X, whose fields may be `undefined`. */
export type DatePickersLocaleText = {
	[Key in keyof PickersInputLocaleText]?: PickersInputLocaleText[Key] | undefined;
};

export interface DatePickersProviderProps {
	/**
	 * date-fns locale: order of the sections, month and day names, first day of the week, 12 or 24-hour clock.
	 * Defaults to `en-US`. Import only the locales you use, e.g. `import { ptBR } from 'date-fns/locale/pt-BR'`.
	 */
	locale?: Locale | undefined;
	/**
	 * Texts of the pickers (buttons, dialogs, section placeholders), e.g. the `localeText` of `ptBR` from
	 * `@mui/x-date-pickers/locales`; any of them can be overridden.
	 */
	localeText?: DatePickersLocaleText | undefined;
	/** The application, or the part of it with pickers. */
	children: ReactNode;
}

/**
 * Put it once around the pickers (e.g. next to `UiProvider`). The locale is given by the application and never
 * inferred, so the server and the browser render the same text; it says nothing about the time zone.
 */
export const DatePickersProvider = ({
	locale,
	localeText,
	children,
}: DatePickersProviderProps): ReactElement => {
	return (
		<LocalizationProvider
			dateAdapter={AdapterDateFns}
			{...(locale === undefined ? {} : { adapterLocale: locale })}
			// An `undefined` text falls back to the default, as MUI X does at runtime.
			{...(localeText === undefined ? {} : { localeText: localeText as PickersInputLocaleText })}
		>
			{children}
		</LocalizationProvider>
	);
};
