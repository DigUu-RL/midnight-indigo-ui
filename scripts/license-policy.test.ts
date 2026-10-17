import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isAllowedExpression, isAllowedLicense } from '#scripts/license-policy.ts';

test('permissive licenses and SPDX expressions are allowed for any package', (): void => {
	assert.equal(isAllowedLicense('MIT', 'react'), true);
	assert.equal(isAllowedLicense('(MIT OR GPL-3.0)', 'some-package'), true);
	assert.equal(isAllowedExpression('MIT AND BSD-3-Clause'), true);
	assert.equal(isAllowedExpression('MIT AND GPL-3.0'), false);
});

test('a named exception covers only its package', (): void => {
	assert.equal(isAllowedLicense('OFL-1.1', '@fontsource-variable/geist'), true);
	assert.equal(isAllowedLicense('OFL-1.1', '@fontsource-variable/geist-mono'), true);
	assert.equal(isAllowedLicense('OFL-1.1', 'another-font'), false);
});

test('icon sets may use public domain, font and attribution licenses', (): void => {
	const allowed: [string, string][] = [
		['MIT', '@iconify-json/tabler'],
		['Apache-2.0', '@iconify-json/mdi'],
		['CC0-1.0', '@iconify-json/simple-icons'],
		['Unlicense', '@iconify-json/system-uicons'],
		['OFL-1.1', '@iconify-json/fa'],
		['CC-BY-4.0', '@iconify-json/solar'],
	];

	allowed.forEach(([license, packageName]: [string, string]): void => {
		assert.equal(isAllowedLicense(license, packageName), true, `${packageName} (${license})`);
	});
});

test('icon sets under share-alike, non-commercial or unlisted licenses fail the audit', (): void => {
	const rejected: [string, string][] = [
		['GPL-2.0-only', '@iconify-json/gridicons'],
		['GPL-3.0-or-later', '@iconify-json/icomoon-free'],
		['CC-BY-SA-4.0', '@iconify-json/openmoji'],
		['CC-BY-NC-4.0', '@iconify-json/ps'],
		['MPL-2.0', '@iconify-json/circum'],
		['CC-BY-3.0', '@iconify-json/game-icons'],
		['UNKNOWN', '@iconify-json/unknown'],
	];

	rejected.forEach(([license, packageName]: [string, string]): void => {
		assert.equal(isAllowedLicense(license, packageName), false, `${packageName} (${license})`);
	});
});

test('the icon set licenses do not extend to other packages', (): void => {
	assert.equal(isAllowedLicense('CC0-1.0', 'some-package'), false);
	assert.equal(isAllowedLicense('CC-BY-4.0', 'some-package'), false);
});
