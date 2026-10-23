// Layout of the pages of the date and time pickers (Server Component): the pickers must be inside a
// `DatePickersProvider`, which follows the locale of the page. The other pages of the explorer do not load it.
import type { ReactElement, ReactNode } from 'react';

import { ExplorerDatePickersProvider } from '@/src/explorer/date-pickers-locale';
import type { LocaleSegment } from '@/src/i18n/locales';
import { localeOf } from '@/src/i18n/server';
import type { LocaleParams } from '@/src/i18n/server';

interface DatePickersLayoutProps extends LocaleParams {
	children: ReactNode;
}

const DatePickersLayout = async ({
	children,
	params,
}: DatePickersLayoutProps): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf({ params });
	return <ExplorerDatePickersProvider locale={locale}>{children}</ExplorerDatePickersProvider>;
};

export default DatePickersLayout;
