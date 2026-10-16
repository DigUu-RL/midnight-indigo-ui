// Icon browser (Server Component): searches the names of every installed Iconify set, filters by set and license, and
// shows an icon in each size and intent with the code to use it. Rendered per request, from the URL.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { Stack } from '@midnight-indigo/ui/layout';
import { Link } from '@midnight-indigo/ui/navigation';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import type { LocaleSegment } from '#src/i18n/locales.ts';
import { getTranslator, localeOf } from '#src/i18n/server.ts';
import type { LocaleParams } from '#src/i18n/server.ts';
import {
	IconDetails,
	IconResults,
	IconSearchForm,
	IconSetTable,
	isSearching,
	parseIconBrowserQuery,
} from '#src/icons/icon-browser.tsx';
import type { IconBrowserQuery, SearchParameters } from '#src/icons/icon-browser.tsx';
import { findIconData, findIconSet, loadMatches, searchIcons } from '#src/icons/icon-catalog.ts';
import type { IconSearchResult, LoadedIcon } from '#src/icons/icon-catalog.ts';
import { iconSets } from '#src/icons/icon-sets.ts';
import type { IconSetEntry } from '#src/icons/icon-sets.ts';

interface IconsPageProps extends LocaleParams {
	searchParams: Promise<SearchParameters>;
}

const pageSize: number = 120;

const iconTotal: number = iconSets.reduce((total: number, set: IconSetEntry): number => {
	return total + set.total;
}, 0);

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('icons.header.title') };
};

const SelectedIcon = async ({
	query,
	translate,
}: {
	query: IconBrowserQuery;
	translate: TFunction;
}): Promise<ReactElement | null> => {
	if (query.selected === undefined) return null;
	const [prefix = '', name = ''] = query.selected.split(':');
	const set: IconSetEntry | undefined = findIconSet(prefix);
	const data: IconifyIconData | undefined = await findIconData(query.selected);
	if (set === undefined || data === undefined) return null;
	return <IconDetails set={set} name={name} data={data} translate={translate} />;
};

const IconsPage = async ({ params, searchParams }: IconsPageProps): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf({ params });
	const translate: TFunction = await getTranslator(locale);
	const query: IconBrowserQuery = parseIconBrowserQuery(await searchParams);

	const result: IconSearchResult | null = isSearching(query)
		? await searchIcons({ ...query, pageSize })
		: null;

	const icons: LoadedIcon[] = result === null ? [] : await loadMatches(result.matches);

	return (
		<>
			<PageHeader
				title={translate('icons.header.title')}
				description={translate('icons.header.description', {
					sets: iconSets.length,
					icons: iconTotal,
				})}
				actions={
					<Link href={`/${locale}/icons/attribution`} variant='standalone'>
						{translate('icons.header.attribution')}
					</Link>
				}
			/>

			<Stack gap='8'>
				<IconSearchForm query={query} translate={translate} />
				<SelectedIcon query={query} translate={translate} />

				{result === null ? (
					<IconSetTable query={query} translate={translate} />
				) : (
					<IconResults query={query} result={result} icons={icons} translate={translate} />
				)}
			</Stack>
		</>
	);
};

export default IconsPage;
