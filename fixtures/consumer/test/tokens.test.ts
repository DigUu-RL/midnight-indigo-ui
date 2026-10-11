// Checks the published tokens as an external consumer sees them: compiled JavaScript and the public stylesheet.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { auditContrast, semanticIntents, tokens } from '@midnight-indigo/ui/tokens';
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

test('the public stylesheet declares the official pink and a dark color scheme', (): void => {
	const stylesheet: string = readFileSync(stylesheetPath, 'utf8');

	assert.match(stylesheet, /--mi-intent-official-main: #FF6AC1;/);
	assert.match(stylesheet, /color-scheme: dark;/);
});
