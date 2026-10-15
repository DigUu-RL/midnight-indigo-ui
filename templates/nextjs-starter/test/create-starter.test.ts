// The generator of a standalone starter: the copy has no file of the repository, no workspace or catalog version and a
// TypeScript configuration of its own. `pnpm check:starter` installs, builds and serves such a copy.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import { createStarter, readCatalog } from '#scripts/create-starter.ts';
import { starterRoot } from '#test/support/starter-server.ts';

interface PackageManifest {
	name: string;
	version: string;
	imports?: Record<string, string>;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

interface TypeScriptConfiguration {
	extends?: string;
	compilerOptions?: Record<string, unknown>;
	include?: string[];
}

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'));

const libraryVersion: string = (
	readJson(join(starterRoot, '..', '..', 'packages', 'ui', 'package.json')) as PackageManifest
).version;

let workspace: string;
let project: string;
let packed: string;

before((): void => {
	workspace = mkdtempSync(join(tmpdir(), 'midnight-indigo-starter-'));
	project = join(workspace, 'Aurora Admin');
	packed = join(workspace, 'packed');
	createStarter({ target: project });
	createStarter({ target: packed, pack: true });
});

after((): void => {
	rmSync(workspace, { recursive: true, force: true });
});

test('the copy has the application and its documentation, not the files of the repository', (): void => {
	const present: string[] = [
		'README.md',
		'.gitignore',
		'next.config.ts',
		'src/proxy.ts',
		'src/app/[locale]/layout.tsx',
		'src/app/global-not-found.tsx',
		'src/messages/pt-br.json',
		'src/theme.json',
	];

	const absent: string[] = [
		'test',
		'scripts',
		'node_modules',
		'.next',
		'next-env.d.ts',
		'tsconfig.tsbuildinfo',
	];

	assert.deepEqual(
		present.filter((path: string): boolean => !existsSync(join(project, path))),
		[],
	);

	assert.deepEqual(
		absent.filter((path: string): boolean => existsSync(join(project, path))),
		[],
	);
});

test('the manifest has versions an installation outside the monorepo resolves', (): void => {
	const manifest: PackageManifest = readJson(join(project, 'package.json')) as PackageManifest;
	const catalog: ReadonlyMap<string, string> = readCatalog();
	const text: string = readFileSync(join(project, 'package.json'), 'utf8');
	const dependencies: Record<string, string> = manifest.dependencies ?? {};

	assert.equal(manifest.name, 'aurora-admin');
	assert.doesNotMatch(text, /workspace:|catalog:/);
	assert.equal(dependencies['@midnight-indigo/ui'], `^${libraryVersion}`);
	assert.equal(dependencies.next, catalog.get('next'));
	assert.equal(manifest.devDependencies?.typescript, catalog.get('typescript'));
	assert.equal(manifest.scripts?.test, undefined);
	assert.deepEqual(manifest.imports, { '#src/*': './src/*' });
});

test('the TypeScript configuration stands on its own', (): void => {
	const configuration: TypeScriptConfiguration = readJson(
		join(project, 'tsconfig.json'),
	) as TypeScriptConfiguration;

	const compilerOptions: Record<string, unknown> = configuration.compilerOptions ?? {};

	assert.equal(configuration.extends, undefined);
	assert.equal(compilerOptions.strict, true);
	assert.equal(compilerOptions.moduleResolution, 'Bundler');

	assert.deepEqual(configuration.include, [
		'next-env.d.ts',
		'next.config.ts',
		'src',
		'.next/types/**/*.ts',
	]);
});

test('--pack copies a tarball of the local build into the project', (): void => {
	const manifest: PackageManifest = readJson(join(packed, 'package.json')) as PackageManifest;
	const tarball: string = `midnight-indigo-ui-${libraryVersion}.tgz`;

	assert.equal(manifest.dependencies?.['@midnight-indigo/ui'], `file:vendor/${tarball}`);
	assert.ok(existsSync(join(packed, 'vendor', tarball)));
});

test('a directory that is not empty is left alone', (): void => {
	const occupied: string = join(workspace, 'occupied');

	createStarter({ target: join(occupied, 'nested') });
	writeFileSync(join(occupied, 'notes.txt'), 'keep me');

	assert.throws((): void => {
		createStarter({ target: occupied });
	}, /is not empty/);

	assert.equal(readFileSync(join(occupied, 'notes.txt'), 'utf8'), 'keep me');
});
