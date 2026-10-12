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

// Every entry except the heavy ones themselves; components must never reach the chart engine nor the dashboard.
const lightEntries: readonly string[] = [
	'@midnight-indigo/ui',
	'@midnight-indigo/ui/theme',
	'@midnight-indigo/ui/buttons',
	'@midnight-indigo/ui/data-display',
	'@midnight-indigo/ui/feedback',
	'@midnight-indigo/ui/forms',
	'@midnight-indigo/ui/layout',
	'@midnight-indigo/ui/navigation',
];

for (const specifier of lightEntries) {
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

// The optional integrations reach their own peers, and only them, besides React and Material UI.
const optionalEntries: readonly [string, RegExp][] = [
	['@midnight-indigo/ui/forms/date-pickers', /^(@mui\/x-date-pickers\/[\w/]+|date-fns)$/],
	['@midnight-indigo/ui/forms/react-hook-form', /^react-hook-form$/],
];

for (const [specifier, optionalPeers] of optionalEntries) {
	test(`${specifier} depends only on its optional peers besides React and Material UI`, (): void => {
		const { files, packages }: ImportGraph = importGraphOf(specifier);

		const unexpected: string[] = packages.filter((name: string): boolean => {
			return !allowedPackages.test(name) && !optionalPeers.test(name);
		});

		assert.ok(packages.some((name: string): boolean => optionalPeers.test(name)));
		assert.deepEqual(unexpected, []);

		assert.deepEqual(
			files.filter((file: string): boolean => {
				return heavyDomains.some((domain: string): boolean => file.startsWith(domain));
			}),
			[],
		);
	});
}

test('compiled files keep no subpath import of the source tree', (): void => {
	const leaked: string[] = lightEntries
		.concat(optionalEntries.map(([specifier]: [string, RegExp]): string => specifier))
		.flatMap((specifier: string): string[] => importGraphOf(specifier).packages)
		.filter((name: string): boolean => name.startsWith('#'));

	assert.deepEqual(leaked, []);
});

test('@midnight-indigo/ui/tokens does not depend on React', (): void => {
	assert.deepEqual(importGraphOf('@midnight-indigo/ui/tokens').packages, []);
});
