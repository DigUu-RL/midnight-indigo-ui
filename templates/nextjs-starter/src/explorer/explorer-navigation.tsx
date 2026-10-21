'use client';
// The navigation of the explorer: every component grouped by subpath, and a search that filters them by name or
// subpath, ignoring case and accents. Without JavaScript the whole list is shown and works.
import { normalizeSearchText } from '@midnight-indigo/ui/data-display';
import { SearchField } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { Link } from '@midnight-indigo/ui/navigation';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';
import type { ReactElement } from 'react';

import type { LocaleSegment } from '#src/i18n/locales.ts';
import { publicPathOf } from '#src/explorer/routes.ts';

export interface NavigationComponent {
	name: string;
	slug: string;
}

export interface NavigationGroup {
	subpath: string;
	/** Translated name of the subpath. */
	label: string;
	components: readonly NavigationComponent[];
}

interface ExplorerNavigationProps {
	locale: LocaleSegment;
	groups: readonly NavigationGroup[];
}

const matches = (
	query: string,
	group: NavigationGroup,
	component: NavigationComponent,
): boolean => {
	return [component.name, group.subpath, group.label].some((text: string): boolean => {
		return normalizeSearchText(text).includes(query);
	});
};

export const ExplorerNavigation = ({ locale, groups }: ExplorerNavigationProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const pathname: string = publicPathOf(usePathname());
	const groupIdPrefix: string = useId();
	const [query, setQuery] = useState<string>('');
	const normalizedQuery: string = normalizeSearchText(query.trim());
	const home: string = `/${locale}/components`;

	const shown: NavigationGroup[] = groups
		.map((group: NavigationGroup): NavigationGroup => {
			return {
				...group,
				components: group.components.filter((component: NavigationComponent): boolean => {
					return matches(normalizedQuery, group, component);
				}),
			};
		})
		.filter((group: NavigationGroup): boolean => group.components.length > 0);

	const count: number = shown.reduce((total: number, group: NavigationGroup): number => {
		return total + group.components.length;
	}, 0);

	return (
		<nav className='explorer-navigation' aria-label={t('explorer.navigation.label')}>
			<SearchField
				label={t('explorer.navigation.search')}
				size='small'
				value={query}
				onValueChange={setQuery}
				autoComplete='off'
				spellCheck={false}
			/>

			<p className='explorer-navigation-status' role='status'>
				{normalizedQuery === ''
					? null
					: count === 0
						? t('explorer.navigation.noResults', { query: query.trim() })
						: t('explorer.navigation.results', { count })}
			</p>

			<Link href={home} variant='standalone' current={pathname === home}>
				{t('explorer.navigation.overview')}
			</Link>

			{shown.map((group: NavigationGroup): ReactElement => {
				const titleId: string = `${groupIdPrefix}-${group.subpath}`;

				// Titles rather than headings: the navigation comes before the `h1` of the page.
				return (
					<div key={group.subpath} className='explorer-navigation-group'>
						<p id={titleId} className='explorer-navigation-title'>
							{group.label}
						</p>

						<ul aria-labelledby={titleId}>
							{group.components.map((component: NavigationComponent): ReactElement => {
								const href: string = `${home}/${component.slug}`;

								return (
									<li key={component.slug}>
										<Link href={href} variant='standalone' current={pathname === href}>
											{component.name}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
		</nav>
	);
};
