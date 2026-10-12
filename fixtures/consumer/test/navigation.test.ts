// Renders the compiled layout and navigation components on the server, as a consumer's SSR framework would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Container, Grid, GridItem, Stack } from '@midnight-indigo/ui/layout';
import {
	Breadcrumbs,
	Link,
	NavigationProvider,
	Pagination,
	Sidebar,
	SidebarMenuButton,
	TabNavigation,
	Tabs,
} from '@midnight-indigo/ui/navigation';
import type { LinkComponentProps } from '@midnight-indigo/ui/navigation';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

// Without a style cache, Emotion writes each `<style>` right before its element: markup is checked without them.
const withoutStyles = (html: string): string => html.replaceAll(/<style[^>]*>.*?<\/style>/gs, '');

// Stands in for the link component of a router, such as `next/link`.
const RouterLink = (props: LinkComponentProps): ReactElement => {
	return createElement('a', { ...props, 'data-router-link': '' });
};

test('the compiled layout primitives render on the server with responsive styles', (): void => {
	const html: string = renderToString(
		createElement(
			Container,
			{ as: 'main', size: 'medium' },
			createElement(
				Stack,
				{ direction: { compact: 'column', medium: 'row' }, gap: '6' },
				createElement(
					Grid,
					{ as: 'ul', columns: { compact: 1, expanded: 3 } },
					createElement(GridItem, { as: 'li' }, 'Atlas'),
				),
			),
		),
	);

	assert.match(withoutStyles(html), /^<main/);
	assert.match(withoutStyles(html), /<ul[^>]*><li[^>]*>Atlas<\/li><\/ul>/);
	assert.match(html, /max-width:64rem/);
	assert.match(html, /@media \(min-width: ?37\.5em\)\{[^}]*\{[^}]*flex-direction:row;/);

	assert.match(
		html,
		/@media \(min-width: ?52\.5em\)\{[^}]*\{[^}]*grid-template-columns:repeat\(3, minmax\(0, 1fr\)\);/,
	);
});

test('the compiled navigation renders links, tabs and the sidebar on the server', (): void => {
	const page: ReactElement = createElement(
		NavigationProvider,
		{ linkComponent: RouterLink },
		createElement(SidebarMenuButton, { open: false, onOpenChange: (): void => undefined }),
		createElement(Sidebar, {
			label: 'Main navigation',
			items: [{ id: 'home', label: 'Home', icon: createElement('svg'), href: '/', current: true }],
			mobileOpen: false,
			onMobileOpenChange: (): void => undefined,
		}),
		createElement(Breadcrumbs, {
			items: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'atlas', label: 'Atlas' },
			],
		}),
		createElement(TabNavigation, {
			label: 'Project sections',
			items: [{ id: 'overview', label: 'Overview', href: '/atlas', current: true }],
		}),
		createElement(Tabs, {
			label: 'Report sections',
			items: [{ id: 'summary', label: 'Summary', content: 'Summary panel' }],
		}),
		createElement(Pagination, {
			page: 1,
			pageCount: 3,
			getPageHref: (page: number): string => `/orders?page=${String(page)}`,
		}),
		createElement(Link, { href: '/help', children: 'Help' }),
	);

	const html: string = withoutStyles(renderToString(page));

	assert.match(html, /aria-haspopup="dialog" aria-expanded="false"/);
	assert.match(html, /<nav[^>]*aria-label="Main navigation"/);
	assert.match(html, /<a href="\/" aria-current="page"[^>]*data-router-link=""/);
	assert.match(html, /<nav aria-label="Breadcrumb"><ol/);
	assert.match(html, /role="tablist" aria-label="Report sections"/);
	assert.match(html, /role="tab"[^>]*aria-selected="true"/);
	assert.match(html, /<a href="\/orders\?page=2" aria-label="Page 2"[^>]*data-router-link=""/);
	assert.match(html, /<a href="\/help"[^>]*data-router-link=""/);
});
