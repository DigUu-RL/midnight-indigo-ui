// Layout of the component explorer (Server Component): the navigation of every component beside the page shown.
import type { TFunction } from 'i18next';
import type { ReactElement, ReactNode } from 'react';

import { camelCaseOf, slugOf, subpathGroups } from '@/src/explorer/catalog';
import type { ExplorerComponent, SubpathGroup } from '@/src/explorer/catalog';
import { ExplorerNavigation } from '@/src/explorer/explorer-navigation';
import type { NavigationComponent, NavigationGroup } from '@/src/explorer/explorer-navigation';
import { routeSegmentOf } from '@/src/explorer/routes';
import type { LocaleSegment } from '@/src/i18n/locales';
import { getTranslator, localeOf } from '@/src/i18n/server';
import type { LocaleParams } from '@/src/i18n/server';

interface ExplorerLayoutProps extends LocaleParams {
	children: ReactNode;
}

const ExplorerLayout = async ({ children, params }: ExplorerLayoutProps): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf({ params });
	const translate: TFunction = await getTranslator(locale);

	const groups: NavigationGroup[] = subpathGroups().map((group: SubpathGroup): NavigationGroup => {
		return {
			subpath: group.subpath,
			label: translate(`explorer.subpaths.${camelCaseOf(routeSegmentOf(group.subpath))}`),
			components: group.components.map((component: ExplorerComponent): NavigationComponent => {
				return { name: component.name, slug: slugOf(component) };
			}),
		};
	});

	return (
		<div className='explorer'>
			<div className='explorer-layout'>
				<ExplorerNavigation locale={locale} groups={groups} />
				<div className='explorer-content'>{children}</div>
			</div>
		</div>
	);
};

export default ExplorerLayout;
