// Follows the relative imports of the compiled entries to prove what each one can load.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

interface ImportGraph {
	/** Compiled files of the package, relative to `dist/`. */
	files: string[];
	/** Bare specifiers of the dependencies the entry reaches. */
	packages: string[];
}

const distributionDirectory: string = dirname(
	fileURLToPath(import.meta.resolve('@midnight-indigo/ui')),
);

const importPattern: RegExp =
	/(?:^|;|\n)\s*(?:import|export)\s*(?:[^'"]*?\sfrom\s*)?["']([^"']+)["']/g;

const listSpecifiers = (file: string): string[] => {
	return [...readFileSync(file, 'utf8').matchAll(importPattern)].map(
		(match: RegExpExecArray): string => match[1],
	);
};

const collectGraph = (file: string, visited: Set<string>, packages: Set<string>): void => {
	if (visited.has(file)) return;
	visited.add(file);

	listSpecifiers(file).forEach((specifier: string): void => {
		if (!specifier.startsWith('.')) {
			packages.add(specifier);
			return;
		}

		collectGraph(resolve(dirname(file), specifier), visited, packages);
	});
};

const importGraphOf = (specifier: string): ImportGraph => {
	const visited: Set<string> = new Set<string>();
	const packages: Set<string> = new Set<string>();
	collectGraph(fileURLToPath(import.meta.resolve(specifier)), visited, packages);

	return {
		files: [...visited].map((file: string): string => {
			return relative(distributionDirectory, file).split(sep).join('/');
		}),
		packages: [...packages].toSorted(),
	};
};

const heavyDomains: readonly string[] = ['charts/', 'dashboard/'];
const allowedPackages: RegExp = /^(react|react\/jsx-runtime|@mui\/material\/[\w/]+)$/;

for (const specifier of ['@midnight-indigo/ui', '@midnight-indigo/ui/theme']) {
	test(`${specifier} does not load charts or dashboard`, (): void => {
		const { files }: ImportGraph = importGraphOf(specifier);

		const heavyFiles: string[] = files.filter((file: string): boolean => {
			return heavyDomains.some((domain: string): boolean => file.startsWith(domain));
		});

		assert.ok(files.length > 1, 'The import graph was not followed.');
		assert.deepEqual(heavyFiles, []);
	});

	test(`${specifier} only depends on React and Material UI subpaths`, (): void => {
		const unexpected: string[] = importGraphOf(specifier).packages.filter(
			(name: string): boolean => !allowedPackages.test(name),
		);

		assert.deepEqual(unexpected, []);
	});
}

test('@midnight-indigo/ui/tokens does not depend on React', (): void => {
	assert.deepEqual(importGraphOf('@midnight-indigo/ui/tokens').packages, []);
});
