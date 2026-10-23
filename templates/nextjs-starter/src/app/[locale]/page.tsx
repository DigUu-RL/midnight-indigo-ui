// Sales overview, the home page (Server Component). The `state` search parameter picks how the mock API answers, so
// the loading, empty and error states can be opened, linked and tested directly: `/en-us?state=error`.
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { demoScenarios } from '@/src/dashboard/mock-api';
import type { DemoScenario } from '@/src/dashboard/mock-api';
import { SalesOverview } from '@/src/dashboard/sales-overview';
import type { LocaleSegment } from '@/src/i18n/locales';
import { getTranslator, localeOf } from '@/src/i18n/server';
import type { LocaleParams } from '@/src/i18n/server';

type SearchParams = Record<string, string | string[] | undefined>;

interface OverviewPageProps extends LocaleParams {
	searchParams: Promise<SearchParams>;
}

const isScenario = (value: unknown): value is DemoScenario => {
	return demoScenarios.includes(value as DemoScenario);
};

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));

	// The title template of the layout only applies to the pages below it.
	return { title: `${translate('overview.header.title')} · ${translate('app.name')}` };
};

const OverviewPage = async ({ params, searchParams }: OverviewPageProps): Promise<ReactElement> => {
	const [{ state }, locale]: [SearchParams, LocaleSegment] = await Promise.all([
		searchParams,
		localeOf({ params }),
	]);

	return <SalesOverview locale={locale} scenario={isScenario(state) ? state : 'live'} />;
};

export default OverviewPage;
