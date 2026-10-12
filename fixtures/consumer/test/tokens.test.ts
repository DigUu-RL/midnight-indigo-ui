// Checks the published tokens as an external consumer sees them: compiled JavaScript and the public stylesheet.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
	auditContrast,
	breakpointMediaQuery,
	breakpoints,
	semanticIntents,
	tokens,
} from '@midnight-indigo/ui/tokens';
import type { ContrastResult } from '@midnight-indigo/ui/tokens';

const officialPinkSource: string = '#FF6AC1';
const stylesheetPath: string = fileURLToPath(import.meta.resolve('@midnight-indigo/ui/styles.css'));

test('the compiled tokens keep the exact official pink', (): void => {
	assert.equal(tokens.intent.official.main, officialPinkSource);
});

test('the compiled tokens expose the six semantic intents', (): void => {
	assert.deepEqual(Object.keys(tokens.intent), [...semanticIntents]);
});

test('the compiled tokens pass the contrast audit', (): void => {
	const failures: string[] = auditContrast(tokens)
		.filter((result: ContrastResult): boolean => !result.passes)
		.map((result: ContrastResult): string => result.message);

	assert.deepEqual(failures, []);
});

test('the compiled breakpoints and their media queries', (): void => {
	assert.deepEqual(breakpoints, {
		compact: 0,
		medium: 600,
		expanded: 840,
		large: 1200,
		extraLarge: 1600,
	});

	assert.equal(breakpointMediaQuery('expanded'), '(min-width: 52.5em)');
});

test('the public stylesheet declares the official pink and a dark color scheme', (): void => {
	const stylesheet: string = readFileSync(stylesheetPath, 'utf8');

	assert.match(stylesheet, /--mi-intent-official-main: #FF6AC1;/);
	assert.match(stylesheet, /color-scheme: dark;/);
});
