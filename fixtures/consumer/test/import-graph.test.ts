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
	'@midnight-indigo/ui/icons',
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
	['@midnight-indigo/ui/i18n', /^(i18next|react-i18next)$/],
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

// The dashboard composes the components: it reaches them, React and Material UI, never the chart engine (a chart is
// passed to it as a child).
test('@midnight-indigo/ui/dashboard depends only on React and Material UI and does not load charts', (): void => {
	const { files, packages }: ImportGraph = importGraphOf('@midnight-indigo/ui/dashboard');

	assert.ok(files.includes('dashboard/dashboard-layout/index.js'));
	assert.ok(files.includes('navigation/sidebar/index.js'));

	assert.deepEqual(
		files.filter((file: string): boolean => file.startsWith('charts/')),
		[],
	);

	assert.deepEqual(
		packages.filter((name: string): boolean => !allowedPackages.test(name)),
		[],
	);
});

// The charts entry reaches React and Material UI only; the engine is behind a dynamic `import()`, which the graph does
// not follow, so bundlers split it into a chunk loaded when the first chart mounts.
const dynamicImportPattern: RegExp = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

test('@midnight-indigo/ui/charts loads the chart engine only on demand', (): void => {
	const { files, packages }: ImportGraph = importGraphOf('@midnight-indigo/ui/charts');

	const dynamicImports: string[] = files.flatMap((file: string): string[] => {
		return [
			...readFileSync(resolve(distributionDirectory, file), 'utf8').matchAll(dynamicImportPattern),
		].map((match: RegExpExecArray): string => {
			return resolve(dirname(resolve(distributionDirectory, file)), match[1]);
		});
	});

	assert.deepEqual(
		packages.filter((name: string): boolean => !allowedPackages.test(name)),
		[],
	);

	assert.deepEqual(
		dynamicImports.map((file: string): string => {
			return relative(distributionDirectory, file).split(sep).join('/');
		}),
		['charts/chart-engine/index.js'],
	);

	assert.ok(!files.includes('charts/chart-engine/index.js'));
});

test('the chart engine module depends only on ECharts subpaths', (): void => {
	const enginePackages: string[] = listSpecifiers(
		resolve(distributionDirectory, 'charts/chart-engine/index.js'),
	).filter((specifier: string): boolean => !specifier.startsWith('.'));

	assert.deepEqual(enginePackages.toSorted(), [
		'echarts/charts',
		'echarts/components',
		'echarts/core',
		'echarts/renderers',
	]);
});

// Code components render tokens computed beforehand; Shiki is behind the dynamic `import()` of `highlightCode`, so a
// page that only shows code never loads it.
test('@midnight-indigo/ui/code loads Shiki only on demand', (): void => {
	const { files, packages }: ImportGraph = importGraphOf('@midnight-indigo/ui/code');

	const dynamicImports: string[] = files.flatMap((file: string): string[] => {
		return [
			...readFileSync(resolve(distributionDirectory, file), 'utf8').matchAll(dynamicImportPattern),
		].map((match: RegExpExecArray): string => {
			return relative(
				distributionDirectory,
				resolve(dirname(resolve(distributionDirectory, file)), match[1]),
			)
				.split(sep)
				.join('/');
		});
	});

	assert.deepEqual(
		packages.filter((name: string): boolean => !allowedPackages.test(name)),
		[],
	);

	assert.deepEqual(dynamicImports, ['code/highlighter/index.js']);
	assert.ok(!files.includes('code/highlighter/index.js'));

	assert.deepEqual(
		files.filter((file: string): boolean => {
			return heavyDomains.some((domain: string): boolean => file.startsWith(domain));
		}),
		[],
	);
});

test('the highlighter module depends only on Shiki subpaths', (): void => {
	const highlighterPackages: string[] = listSpecifiers(
		resolve(distributionDirectory, 'code/highlighter/index.js'),
	).filter((specifier: string): boolean => !specifier.startsWith('.'));

	assert.deepEqual(highlighterPackages.toSorted(), ['shiki/core', 'shiki/engine/javascript']);
});

test('compiled files keep no subpath import of the source tree', (): void => {
	const leaked: string[] = lightEntries
		.concat(optionalEntries.map(([specifier]: [string, RegExp]): string => specifier))
		.concat(['@midnight-indigo/ui/dashboard', '@midnight-indigo/ui/code'])
		.flatMap((specifier: string): string[] => importGraphOf(specifier).packages)
		.filter((name: string): boolean => name.startsWith('#'));

	assert.deepEqual(leaked, []);
});

test('@midnight-indigo/ui/tokens does not depend on React', (): void => {
	assert.deepEqual(importGraphOf('@midnight-indigo/ui/tokens').packages, []);
});

// The root re-exports `Icon` only: the Iconify renderer and the collection registry stay in `@midnight-indigo/ui/icons`.
const iconsEntryFiles: readonly string[] = [
	'icons/index.js',
	'icons/iconify-icon/index.js',
	'icons/icon-registry/index.js',
];

test('@midnight-indigo/ui does not load @midnight-indigo/ui/icons', (): void => {
	const rootFiles: string[] = importGraphOf('@midnight-indigo/ui').files;
	const iconsFiles: string[] = importGraphOf('@midnight-indigo/ui/icons').files;

	assert.deepEqual(
		rootFiles.filter((file: string): boolean => iconsEntryFiles.includes(file)),
		[],
	);

	assert.deepEqual(
		iconsEntryFiles.filter((file: string): boolean => !iconsFiles.includes(file)),
		[],
	);
});
