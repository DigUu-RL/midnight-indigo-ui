// Checks typography, icons and motion as an external consumer gets them: compiled JavaScript and the stylesheet.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Icon } from '@midnight-indigo/ui';
import { IconifyIcon, registerIconCollection } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';
import { defaultUiTheme, toMuiTheme } from '@midnight-indigo/ui/theme';
import { tokens, typographyRoles } from '@midnight-indigo/ui/tokens';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const stylesheetPath: string = fileURLToPath(import.meta.resolve('@midnight-indigo/ui/styles.css'));

test('the public stylesheet declares every typographic role and the icon sizes', (): void => {
	const stylesheet: string = readFileSync(stylesheetPath, 'utf8');

	assert.equal(typographyRoles.length, Object.keys(tokens.typography).length);
	assert.match(stylesheet, /--mi-typography-body-font-size: 0\.9375rem;/);
	assert.match(stylesheet, /--mi-typography-overline-text-transform: uppercase;/);
	assert.match(stylesheet, /--mi-typography-code-font-family: 'Geist Mono Variable', 'Geist Mono'/);
	assert.match(stylesheet, /--mi-icon-size-medium: 1\.25rem;/);
});

test('the compiled Icon renders on the server with its accessibility attributes', (): void => {
	const named: string = renderToStaticMarkup(
		createElement(Icon, {
			label: 'Completed',
			children: createElement('path', { d: 'M0 0h24v24H0z' }),
		}),
	);

	const decorative: string = renderToStaticMarkup(
		createElement(Icon, {
			decorative: true,
			children: createElement('path', { d: 'M0 0h24v24H0z' }),
		}),
	);

	assert.match(named, /role="img" aria-label="Completed"/);
	assert.match(decorative, /aria-hidden="true" focusable="false"/);
});

test('the compiled IconifyIcon renders data and registered names on the server', (): void => {
	const rocket: IconifyIconData = {
		width: 24,
		height: 24,
		body: '<path d="M4 13a8 8 0 0 1 7 7"/>',
	};

	registerIconCollection({ prefix: 'demo', icons: { rocket } });

	const markup: string = renderToStaticMarkup(
		createElement(
			'p',
			null,
			createElement(IconifyIcon, { icon: rocket, label: 'Launched' }),
			createElement(IconifyIcon, { icon: 'demo:rocket', decorative: true }),
		),
	);

	assert.match(markup, /role="img" aria-label="Launched"/);
	assert.match(markup, /aria-hidden="true"/);
	assert.equal(markup.match(/<path d="M4 13a8 8 0 0 1 7 7"><\/path>/g)?.length, 2);

	const renderMissing = (): string => {
		return renderToStaticMarkup(
			createElement(IconifyIcon, { icon: 'demo:planet', decorative: true }),
		);
	};

	assert.throws(renderMissing, /has no icon "planet"/);
});

test('the compiled Material UI adapter honors reduced motion', (): void => {
	assert.equal(toMuiTheme(defaultUiTheme).transitions.duration.standard, 320);

	assert.equal(
		toMuiTheme(defaultUiTheme, { reducedMotion: true }).transitions.duration.standard,
		0,
	);
});
