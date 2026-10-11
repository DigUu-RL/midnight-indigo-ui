// Checks the published theme engine as an external consumer runs it: compiled JavaScript resolved by name.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as root from '@midnight-indigo/ui';
import {
	createThemeStylesheet,
	createUiTheme,
	defaultUiTheme,
	toMuiTheme,
	UiThemeConfigError,
} from '@midnight-indigo/ui/theme';
import type { UiTheme, UiThemeConfig } from '@midnight-indigo/ui/theme';
import { tokens } from '@midnight-indigo/ui/tokens';
import type { HexColor } from '@midnight-indigo/ui/tokens';

const customMain: HexColor = '#3D8BFF';
const silent = { onWarning: (): void => undefined };

const themeDirectory: string = dirname(
	fileURLToPath(import.meta.resolve('@midnight-indigo/ui/theme')),
);

test('a configured official.main reaches the tokens, the stylesheet and Material UI', (): void => {
	const theme: UiTheme = createUiTheme({ palette: { official: { main: customMain } } }, silent);

	assert.equal(theme.tokens.intent.official.main, customMain);
	assert.match(
		createThemeStylesheet(theme),
		new RegExp(`--mi-intent-official-main: ${customMain};`),
	);
	assert.equal(toMuiTheme(theme).palette.primary.main, customMain);
});

test('an incomplete configuration falls back to the official values', (): void => {
	const theme: UiTheme = createUiTheme({ palette: { info: { border: '#ABCDEF' } } }, silent);

	assert.equal(theme.tokens.intent.info.main, tokens.intent.info.main);
	assert.deepEqual(theme.tokens.intent.official, tokens.intent.official);
	assert.deepEqual(defaultUiTheme.tokens, tokens);
});

test('an invalid JSON configuration throws an error naming the offending path', (): void => {
	const unvalidated: UiThemeConfig = JSON.parse(
		'{ "palette": { "official": { "main": "rosa" } } }',
	) as UiThemeConfig;

	assert.throws(
		(): UiTheme => createUiTheme(unvalidated),
		(error: unknown): boolean => {
			return (
				error instanceof UiThemeConfigError && error.issues[0]?.path === 'palette.official.main'
			);
		},
	);
});

test('the root entry exposes the same theme API', (): void => {
	assert.equal(root.createUiTheme, createUiTheme);
	assert.equal(typeof root.UiProvider, 'function');
});

test('the compiled provider keeps its "use client" directive for React Server Components', (): void => {
	const provider: string = readFileSync(join(themeDirectory, 'ui-provider.js'), 'utf8');
	assert.match(provider, /^"use client";/);
});
