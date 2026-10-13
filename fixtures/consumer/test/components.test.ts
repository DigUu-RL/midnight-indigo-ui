// Renders the compiled components on the server, as a consumer's Server Component or SSR framework would.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as root from '@midnight-indigo/ui';
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	Carousel,
	Chip,
} from '@midnight-indigo/ui/data-display';
import { ProgressBar } from '@midnight-indigo/ui/feedback';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

const componentNames: readonly string[] = [
	'Alert',
	'Avatar',
	'Badge',
	'Breadcrumbs',
	'Button',
	'Card',
	'CardContent',
	'CardHeader',
	'Carousel',
	'Chip',
	'ConfirmDialog',
	'Container',
	'ContextMenu',
	'DataTable',
	'Dialog',
	'Divider',
	'Drawer',
	'EmptyState',
	'ErrorState',
	'Grid',
	'GridItem',
	'IconButton',
	'Link',
	'List',
	'ListItem',
	'Menu',
	'NavigationProvider',
	'Pagination',
	'Popover',
	'Portal',
	'ProgressBar',
	'Sidebar',
	'SidebarMenuButton',
	'Skeleton',
	'SkeletonList',
	'SkeletonText',
	'Stack',
	'StatCard',
	'Table',
	'TableBody',
	'TableCell',
	'TableFooter',
	'TableHead',
	'TableHeaderCell',
	'TableRow',
	'TabNavigation',
	'Tabs',
	'ToastProvider',
	'Tooltip',
	'useBreakpoint',
	'useToast',
];

test('the root entry re-exports every component', (): void => {
	const missing: string[] = componentNames.filter((name: string): boolean => !(name in root));
	assert.deepEqual(missing, []);
});

test('the compiled component modules keep their client directive', (): void => {
	const buttonModule: string = readFileSync(
		fileURLToPath(new URL('button/index.js', import.meta.resolve('@midnight-indigo/ui/buttons'))),
		'utf8',
	);

	assert.match(buttonModule, /^["']use client["'];/);
});

test('the compiled components render on the server with their semantics and token styles', (): void => {
	const page: ReactElement = createElement(
		'main',
		null,
		createElement(Button, { intent: 'official', variant: 'solid', children: 'Save' }),
		createElement(IconButton, { label: 'Close', children: createElement('span', null, '×') }),
		createElement(
			Card,
			{ as: 'section' },
			createElement(CardHeader, { title: 'Revenue' }),
			createElement(CardContent, null, 'R$ 12.400'),
		),
		createElement(Chip, { label: 'Open', selected: true, onClick: (): void => undefined }),
		createElement(Badge, {
			content: 3,
			label: '3 unread',
			children: createElement('span', null, 'Inbox'),
		}),
		createElement(ProgressBar, { label: 'Upload', value: 40 }),
		createElement(Carousel, {
			label: 'Highlights',
			children: [
				createElement('p', { key: 'one' }, 'One'),
				createElement('p', { key: 'two' }, 'Two'),
			],
		}),
	);

	const html: string = renderToString(page);

	assert.match(html, /<button type="button"[^>]*>(?:<!-- -->)?Save<\/button>/);
	assert.match(html, /<button type="button" aria-label="Close"/);
	assert.match(html, /<section aria-labelledby="([^"]+)"[^>]*>.*<h3 id="\1"/);
	assert.match(html, /aria-pressed="true"/);
	assert.match(html, /role="progressbar" aria-label="Upload" aria-valuenow="40"/);
	assert.match(html, /aria-roledescription="carousel" aria-label="Highlights"/);
	assert.match(html, /background-color:var\(--mi-intent-official-main\)/);
});
