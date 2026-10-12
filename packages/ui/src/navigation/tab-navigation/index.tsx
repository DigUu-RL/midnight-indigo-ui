'use client';
// Links between the sections of an area, each its own page, shown as tabs (e.g. Overview, Members, Settings).
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { tabIconStyles, tabRowStyles, tabStyles } from '#src/navigation/tab-appearance/index.ts';
import { useLinkAs } from '#src/navigation/navigation-provider/index.tsx';
import type { LinkComponent } from '#src/navigation/navigation-provider/index.tsx';

export interface TabNavigationItem {
	/** Unique within the navigation; used as the React key. */
	id: string;
	/** Visible label and accessible name of the link. */
	label: ReactNode;
	href: string;
	/** Marks the link to the page being shown (`aria-current="page"`). */
	current?: boolean | undefined;
	/** Decorative icon before the label. */
	icon?: ReactNode;
}

export interface TabNavigationProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
	/** Name of the navigation landmark, e.g. `'Project sections'`. */
	label: string;
	items: readonly TabNavigationItem[];
}

const Row = styled('ul')({ ...tabRowStyles, '& > li': { display: 'flex', flexShrink: 0 } });

const TabLink = styled('a')(tabStyles);

const TabIcon = styled('span')(tabIconStyles);

/**
 * Looks like `Tabs`, behaves like links: a `nav` landmark with a list of links, each a tab stop, the current one
 * marked `aria-current="page"`. Use it when every tab has its own URL; use `Tabs` for panels of the same page.
 */
export const TabNavigation = ({
	label,
	items,
	...attributes
}: TabNavigationProps): ReactElement => {
	const linkAs: { as?: LinkComponent } = useLinkAs();

	return (
		<nav aria-label={label} {...attributes}>
			<Row>
				{items.map((item: TabNavigationItem): ReactElement => {
					return (
						<li key={item.id}>
							<TabLink
								{...linkAs}
								href={item.href}
								aria-current={item.current === true ? 'page' : undefined}
							>
								{item.icon === undefined ? null : <TabIcon aria-hidden='true'>{item.icon}</TabIcon>}
								{item.label}
							</TabLink>
						</li>
					);
				})}
			</Row>
		</nav>
	);
};
