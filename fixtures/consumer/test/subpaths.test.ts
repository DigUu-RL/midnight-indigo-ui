// Simulates an external consumer: every public subpath is resolved by package name from the compiled output.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

interface PackageManifest {
	exports: Record<string, unknown>;
}

const requireFromHere: NodeJS.Require = createRequire(import.meta.url);
const manifestSpecifier: string = '@midnight-indigo/ui/package.json';
const manifest: PackageManifest = requireFromHere(manifestSpecifier) as PackageManifest;

const nonCodeExports: readonly string[] = ['./styles.css', './package.json'];

const codeSubpaths: string[] = Object.keys(manifest.exports).filter(
	(subpath: string): boolean => !nonCodeExports.includes(subpath),
);

const toSpecifier = (subpath: string): string => {
	return subpath === '.' ? '@midnight-indigo/ui' : `@midnight-indigo/ui/${subpath.slice(2)}`;
};

const compiledOutputPattern: RegExp = /[\\/]dist[\\/]/;

test('the package declares public subpaths', (): void => {
	assert.ok(codeSubpaths.length > 1);
});

for (const subpath of codeSubpaths) {
	const specifier: string = toSpecifier(subpath);

	test(`${specifier} resolves to the compiled output and can be imported`, async (): Promise<void> => {
		const resolvedPath: string = fileURLToPath(import.meta.resolve(specifier));
		const importedModule: unknown = await import(specifier);

		assert.match(resolvedPath, compiledOutputPattern);
		assert.equal(typeof importedModule, 'object');
	});
}

test('@midnight-indigo/ui/styles.css exists in the compiled output', (): void => {
	const resolvedPath: string = fileURLToPath(import.meta.resolve('@midnight-indigo/ui/styles.css'));

	assert.match(resolvedPath, /[\\/]dist[\\/]styles\.css$/);
	assert.ok(existsSync(resolvedPath));
});

const internalSpecifiers: readonly string[] = [
	'@midnight-indigo/ui/src/index.ts',
	'@midnight-indigo/ui/dist/index.js',
];

for (const internalSpecifier of internalSpecifiers) {
	test(`internal path ${internalSpecifier} is not importable`, async (): Promise<void> => {
		await assert.rejects(import(internalSpecifier), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
	});
}
