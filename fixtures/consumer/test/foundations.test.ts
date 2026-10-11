// Checks typography, icons and motion as an external consumer gets them: compiled JavaScript and the stylesheet.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Icon } from '@midnight-indigo/ui';
import { defaultUiTheme, toMuiTheme } from '@midnight-indigo/ui/theme';
import { tokens, typographyRoles } from '@midnight-indigo/ui/tokens';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const stylesheetPath: string = fileURLToPath(import.meta.resolve('@midnight-indigo/ui/styles.css'));

test('the public stylesheet declares every typographic role and the icon sizes', (): void => {
	const stylesheet: string = readFileSync(stylesheetPath, 'utf8');

	assert.equal(typographyRoles.length, Object.keys(tokens.typography).length);
	assert.match(stylesheet, /--mi-typography-body-font-size: 1rem;/);
	assert.match(stylesheet, /--mi-typography-code-font-family: ui-monospace/);
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

test('the compiled Material UI adapter honors reduced motion', (): void => {
	assert.equal(toMuiTheme(defaultUiTheme).transitions.duration.standard, 320);

	assert.equal(
		toMuiTheme(defaultUiTheme, { reducedMotion: true }).transitions.duration.standard,
		0,
	);
});
