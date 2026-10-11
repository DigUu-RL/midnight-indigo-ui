// Renders the compiled feedback components and overlays on the server, as a consumer's SSR framework would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Button } from '@midnight-indigo/ui/buttons';
import {
	Alert,
	Dialog,
	Drawer,
	Menu,
	Popover,
	ToastProvider,
	Tooltip,
} from '@midnight-indigo/ui/feedback';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

test('the compiled alerts and overlay triggers render on the server', (): void => {
	const page: ReactElement = createElement(
		ToastProvider,
		null,
		createElement(
			Alert,
			{ intent: 'error', announce: 'assertive', title: 'Upload failed' },
			'Too large.',
		),
		createElement(Menu, {
			trigger: createElement(Button, null, 'Actions'),
			items: [{ id: 'edit', label: 'Edit' }],
		}),
		createElement(Popover, {
			title: 'Filters',
			trigger: createElement(Button, null, 'Filters'),
			children: 'Content',
		}),
		createElement(Tooltip, {
			content: 'Ctrl+S',
			children: createElement(Button, null, 'Save'),
		}),
	);

	const html: string = renderToString(page);

	assert.match(html, /role="alert"/);
	assert.match(html, /var\(--mi-intent-error-container\)/);
	assert.match(html, /aria-haspopup="menu" aria-expanded="false"/);
	assert.match(html, /aria-haspopup="dialog" aria-expanded="false"/);
	assert.match(html, /title="Ctrl\+S"/);
});

test('portaled overlays render nothing on the server, even when open', (): void => {
	const html: string = renderToString(
		createElement(
			'main',
			null,
			createElement(Dialog, { open: true, title: 'Edit profile' }),
			createElement(Drawer, { open: true, title: 'Order' }),
		),
	);

	assert.equal(html, '<main></main>');
});
