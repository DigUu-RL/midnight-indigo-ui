import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { resolveWorkspaceAlias } from '@/src/register';

const packageRoot: string = fileURLToPath(new URL('..', import.meta.url));
const parentUrl: string = import.meta.url;

const fileUrl = (relativePath: string): string => {
	return pathToFileURL(join(packageRoot, relativePath)).href;
};

test('an alias resolves from the root of the package of the importing file, adding the extension', () => {
	assert.equal(resolveWorkspaceAlias('@/src/register', parentUrl), fileUrl('src/register.ts'));
	assert.equal(resolveWorkspaceAlias('@/src/register.ts', parentUrl), fileUrl('src/register.ts'));
	assert.equal(resolveWorkspaceAlias('@/package.json', parentUrl), fileUrl('package.json'));
});

test('anything other than an alias of an existing file is left to Node', () => {
	assert.equal(resolveWorkspaceAlias('@/src/missing', parentUrl), undefined);
	assert.equal(resolveWorkspaceAlias('@midnight-indigo/ui', parentUrl), undefined);
	assert.equal(resolveWorkspaceAlias('node:path', parentUrl), undefined);
	assert.equal(resolveWorkspaceAlias('@/src/register', undefined), undefined);
});

test('Node imports through the alias once the hook is registered', async () => {
	const registerModule: { resolveWorkspaceAlias: unknown } = await import('@/src/register');

	assert.equal(registerModule.resolveWorkspaceAlias, resolveWorkspaceAlias);
});
