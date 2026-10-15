// Reports (Server Component): the heading is rendered on the server; the charts draw after hydration, since the engine
// needs the browser, while their titles, summaries and buttons are already in the server markup.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { getTranslator, localeOf } from '#src/i18n/server.ts';
import type { LocaleParams } from '#src/i18n/server.ts';
import { SalesReports } from '#src/reports/sales-reports.tsx';

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('reports.header.title') };
};

const ReportsPage = async (props: LocaleParams): Promise<ReactElement> => {
	const translate: TFunction = await getTranslator(await localeOf(props));

	return (
		<>
			<PageHeader
				title={translate('reports.header.title')}
				description={translate('reports.header.description')}
			/>

			<SalesReports />
		</>
	);
};

export default ReportsPage;
