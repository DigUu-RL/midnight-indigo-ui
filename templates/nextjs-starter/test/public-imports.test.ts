// The starter uses the library as any other application: through the public subpaths of `@midnight-indigo/ui`, never a
// file of the repository. Every other import is a dependency of the starter or a file of its own `src`.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { test } from 'node:test';

import { starterRoot } from '@/test/support/starter-server';

interface PackageManifest {
	dependencies?: Record<string, string>;
	exports?: Record<string, unknown>;
}

interface SourceImport {
	file: string;
	specifier: string;
}

const libraryName: string = '@midnight-indigo/ui';
const sourceRoot: string = join(starterRoot, 'src');

// `import 'x'`, `import ... from 'x'` and `export ... from 'x'`, over several lines too.
const importPattern: RegExp =
	/(?:^|\n)\s*(?:import\s+(?:[\w*{}\s,]+?\s+from\s+)?|export\s+[\w*{}\s,]+?\s+from\s+)['"]([^'"]+)['"]/g;

const manifest: PackageManifest = JSON.parse(
	readFileSync(join(starterRoot, 'package.json'), 'utf8'),
) as PackageManifest;

const libraryManifest: PackageManifest = JSON.parse(
	readFileSync(
		createRequire(join(starterRoot, 'package.json')).resolve(`${libraryName}/package.json`),
		'utf8',
	),
) as PackageManifest;

const listSourceFiles = (directory: string): string[] => {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry: Dirent): string[] => {
		const path: string = join(directory, entry.name);

		return entry.isDirectory() ? listSourceFiles(path) : /\.tsx?$/.test(entry.name) ? [path] : [];
	});
};

const sourceImports: readonly SourceImport[] = listSourceFiles(sourceRoot).flatMap(
	(file: string): SourceImport[] => {
		return [...readFileSync(file, 'utf8').matchAll(importPattern)].map(
			(match: RegExpExecArray): SourceImport => {
				return { file: relative(starterRoot, file), specifier: match[1] ?? '' };
			},
		);
	},
);

// Own modules are imported without the extension of code files (`@/src/i18n/locales`).
const ownModuleExists = (specifier: string): boolean => {
	const path: string = join(sourceRoot, specifier.slice('@/src/'.length));

	return ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].some((suffix: string): boolean => {
		return statSync(`${path}${suffix}`, { throwIfNoEntry: false })?.isFile() ?? false;
	});
};

const packageNameOf = (specifier: string): string => {
	const segments: string[] = specifier.split('/');
	return (specifier.startsWith('@') ? segments.slice(0, 2) : segments.slice(0, 1)).join('/');
};

test('the sources import something', (): void => {
	assert.ok(sourceImports.length > 50, 'The import pattern found almost nothing.');
});

test('the library is imported only through its public subpaths', (): void => {
	const publicSubpaths: Set<string> = new Set<string>(Object.keys(libraryManifest.exports ?? {}));

	const internal: string[] = sourceImports
		.filter(({ specifier }: SourceImport): boolean => packageNameOf(specifier) === libraryName)
		.filter(({ specifier }: SourceImport): boolean => {
			return !publicSubpaths.has(`.${specifier.slice(libraryName.length)}`);
		})
		.map(({ file, specifier }: SourceImport): string => `${file}: ${specifier}`);

	assert.deepEqual(internal, []);
});

test('no import reaches outside the starter: no relative path and no file of the repository', (): void => {
	const outside: string[] = sourceImports
		.filter(({ specifier }: SourceImport): boolean => {
			return (
				specifier.startsWith('.') ||
				specifier.startsWith('/') ||
				/packages\/|templates\//.test(specifier)
			);
		})
		.map(({ file, specifier }: SourceImport): string => `${file}: ${specifier}`);

	assert.deepEqual(outside, []);
});

test('own modules exist in src, and packages are dependencies of the starter', (): void => {
	const dependencies: Set<string> = new Set<string>(Object.keys(manifest.dependencies ?? {}));

	// Node built-ins (`node:fs`, read on the server by the icon catalog) need no dependency.
	const unresolved: string[] = sourceImports
		.filter(({ specifier }: SourceImport): boolean => !specifier.startsWith('node:'))
		.filter(({ specifier }: SourceImport): boolean => {
			return specifier.startsWith('@/src/')
				? !ownModuleExists(specifier)
				: !dependencies.has(packageNameOf(specifier));
		})
		.map(({ file, specifier }: SourceImport): string => `${file}: ${specifier}`);

	assert.deepEqual(unresolved, []);
});
