// Bundle budgets: what an application downloads for each public entry of the package, and for each route of the
// starter, compressed as it is served (gzip and brotli). Fails when a size exceeds its budget in
// `bundle-budgets.json`, when the chart engine reaches an initial chunk, or when an entry has no budget.
//
// - Each entry of the package is bundled from its compiled output (`pnpm build` first) by Vite, as an application
//   would, with everything it exports kept. The peer dependencies (React, Material UI, ...) stay out: they are measured
//   with the starter. ECharts is bundled, since the package decides which of its modules are loaded. The initial JS is
//   the entry chunk and the chunks it imports; the on-demand JS is the chunks loaded by `import()`.
// - One icon imported as data next to others of the same module is bundled as an application would, tree-shaken:
//   only its data may reach the bundle.
// - Each route of the starter is served by `next start`; its initial JS is the scripts of its HTML (framework, React,
//   Material UI and the library included). The chart engine is a chunk of its own, on demand.
//
// `node scripts/check-bundle-size.ts --update` measures again and rewrites the baselines and the budgets (10% above
// the baseline); the pull request that does it explains the growth.
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import type { AddressInfo, Server } from 'node:net';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import { build } from 'vite';
import type { Plugin, Rollup } from 'vite';

interface Size {
	raw: number;
	gzip: number;
	brotli: number;
}

interface Measurement {
	name: string;
	initial: Size | null;
	onDemand: Size | null;
}

interface Limit {
	/** Gzip bytes measured when the budget was set. */
	baseline: number;
	/** Gzip bytes allowed. */
	budget: number;
}

interface BudgetEntry {
	initial?: Limit;
	onDemand?: Limit;
}

interface BudgetFile {
	description: string;
	entries: Record<string, BudgetEntry>;
}

interface PackageManifest {
	exports: Record<string, unknown>;
	peerDependencies: Record<string, string>;
}

type Part = 'initial' | 'onDemand';

const repositoryRoot: string = fileURLToPath(new URL('..', import.meta.url));
const packageRoot: string = join(repositoryRoot, 'packages', 'ui');
const starterRoot: string = join(repositoryRoot, 'templates', 'nextjs-starter');
const budgetFilePath: string = join(repositoryRoot, 'bundle-budgets.json');
const updating: boolean = process.argv.includes('--update');
const headroom: number = 1.1;
const budgetStep: number = 256;

// Every page of the application in one locale (the other loads the same scripts) and the component gallery.
const starterRoutes: readonly string[] = [
	'/en-us',
	'/en-us/orders',
	'/en-us/reports',
	'/en-us/customers/new',
	'/en-us/settings/appearance',
	'/en-us/icons',
	'/gallery',
];

const engineName: string = 'starter: chart engine';
const serverStartTimeoutInMilliseconds: number = 60_000;

// ECharts marks the element of each instance with this attribute; no other code has it.
const engineMarker: string = '_echarts_instance_';

const manifest: PackageManifest = JSON.parse(
	readFileSync(join(packageRoot, 'package.json'), 'utf8'),
) as PackageManifest;

const sizeOf = (contents: readonly (string | Uint8Array)[]): Size => {
	return contents.reduce(
		(total: Size, content: string | Uint8Array): Size => {
			const buffer: Buffer = Buffer.from(content);

			return {
				raw: total.raw + buffer.length,
				gzip: total.gzip + gzipSync(buffer, { level: 9 }).length,
				brotli: total.brotli + brotliCompressSync(buffer).length,
			};
		},
		{ raw: 0, gzip: 0, brotli: 0 },
	);
};

const kilobytes = (bytes: number): string => `${(bytes / 1024).toFixed(1)} kB`;

const specifierOf = (subpath: string): string => {
	return subpath === '.' ? '@midnight-indigo/ui' : `@midnight-indigo/ui/${subpath.slice(2)}`;
};

const entryFileOf = (subpath: string): string => {
	const target: unknown = manifest.exports[subpath];

	const file: unknown =
		typeof target === 'object' && target !== null ? Reflect.get(target, 'default') : target;

	if (typeof file !== 'string') throw new Error(`No compiled file for the subpath ${subpath}.`);
	return join(packageRoot, file);
};

const codeSubpaths: string[] = Object.keys(manifest.exports).filter((subpath: string): boolean => {
	return subpath !== './styles.css' && subpath !== './package.json';
});

// The peers an application installs itself, except the engine, which the package loads in a chunk of its own.
const externalPeers: string[] = Object.keys(manifest.peerDependencies).filter(
	(name: string): boolean => name !== 'echarts',
);

const isExternal = (id: string): boolean => {
	return externalPeers.some((name: string): boolean => id === name || id.startsWith(`${name}/`));
};

const ignoreDirectives = (
	warning: Rollup.RollupLog,
	warn: (log: Rollup.RollupLog) => void,
): void => {
	// `'use client'` marks modules for React Server Components; it means nothing in a client bundle.
	if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
};

const bundleEntry = async (subpath: string): Promise<Rollup.OutputChunk[]> => {
	const output: Awaited<ReturnType<typeof build>> = await build({
		configFile: false,
		logLevel: 'silent',
		root: packageRoot,
		build: {
			write: false,
			minify: true,
			rolldownOptions: {
				input: entryFileOf(subpath),
				// Everything the entry exports is kept, as if the application used all of it.
				preserveEntrySignatures: 'strict',
				external: isExternal,
				onwarn: ignoreDirectives,
			},
		},
	});

	const results: Rollup.RolldownOutput[] = (
		Array.isArray(output) ? output : [output]
	) as Rollup.RolldownOutput[];

	return results.flatMap((result: Rollup.RolldownOutput): Rollup.OutputChunk[] => {
		return result.output.filter(
			(item: Rollup.OutputChunk | Rollup.OutputAsset): item is Rollup.OutputChunk => {
				return item.type === 'chunk';
			},
		);
	});
};

const staticClosure = (
	entry: Rollup.OutputChunk,
	chunks: readonly Rollup.OutputChunk[],
): Set<string> => {
	const reached: Set<string> = new Set<string>();

	const visit = (fileName: string): void => {
		if (reached.has(fileName)) return;
		reached.add(fileName);

		const chunk: Rollup.OutputChunk | undefined = chunks.find(
			(candidate: Rollup.OutputChunk): boolean => {
				return candidate.fileName === fileName;
			},
		);

		chunk?.imports.forEach(visit);
	};

	visit(entry.fileName);
	return reached;
};

const measureEntry = async (subpath: string, failures: string[]): Promise<Measurement> => {
	const name: string = specifierOf(subpath);
	const chunks: Rollup.OutputChunk[] = await bundleEntry(subpath);

	const entry: Rollup.OutputChunk | undefined = chunks.find(
		(chunk: Rollup.OutputChunk): boolean => {
			return chunk.isEntry;
		},
	);

	if (entry === undefined) throw new Error(`The bundle of ${name} has no entry chunk.`);
	const initialFiles: Set<string> = staticClosure(entry, chunks);

	const initial: Rollup.OutputChunk[] = chunks.filter((chunk: Rollup.OutputChunk): boolean => {
		return initialFiles.has(chunk.fileName);
	});

	const onDemand: Rollup.OutputChunk[] = chunks.filter((chunk: Rollup.OutputChunk): boolean => {
		return !initialFiles.has(chunk.fileName);
	});

	if (initial.some((chunk: Rollup.OutputChunk): boolean => chunk.code.includes(engineMarker))) {
		failures.push(`${name}: the chart engine is in the initial JS; it must be loaded on demand.`);
	}

	return {
		name,
		initial: sizeOf(initial.map((chunk: Rollup.OutputChunk): string => chunk.code)),
		onDemand:
			onDemand.length === 0
				? null
				: sizeOf(onDemand.map((chunk: Rollup.OutputChunk): string => chunk.code)),
	};
};

// One icon imported as data from a module that exports three: only the data of that icon may reach the bundle.
const singleIconName: string = '@midnight-indigo/ui/icons: one imported icon';
const singleIconScope: string = 'single-icon:';

const sampleIconPaths: Readonly<Record<string, string>> = {
	rocket: 'M101 101h1v1',
	planet: 'M202 202h2v2',
	comet: 'M303 303h3v3',
};

const sampleIconModule: string = Object.entries(sampleIconPaths)
	.map(([name, path]: [string, string]): string => {
		return `export const ${name} = { width: 24, height: 24, body: '<path d="${path}"/>' };`;
	})
	.join('\n');

const singleIconEntry = (): string => {
	return [
		"import { createElement } from 'react';",
		`import { IconifyIcon } from ${JSON.stringify(entryFileOf('./icons'))};`,
		`import { rocket } from '${singleIconScope}icons';`,
		'export const RocketIcon = () => createElement(IconifyIcon, { icon: rocket, decorative: true });',
	].join('\n');
};

const singleIconPlugin: Plugin = {
	name: 'single-icon',
	resolveId: (id: string): string | null => (id.startsWith(singleIconScope) ? `\0${id}` : null),
	load: (id: string): string | null => {
		if (id === `\0${singleIconScope}entry`) return singleIconEntry();
		return id === `\0${singleIconScope}icons` ? sampleIconModule : null;
	},
};

const measureSingleIcon = async (failures: string[]): Promise<Measurement> => {
	const output: Awaited<ReturnType<typeof build>> = await build({
		configFile: false,
		logLevel: 'silent',
		root: packageRoot,
		plugins: [singleIconPlugin],
		build: {
			write: false,
			minify: true,
			rolldownOptions: {
				input: `${singleIconScope}entry`,
				// Keeps the export of the entry, and only what it uses: an application importing one icon.
				preserveEntrySignatures: 'exports-only',
				external: isExternal,
				onwarn: ignoreDirectives,
			},
		},
	});

	const chunks: Rollup.OutputChunk[] = (
		(Array.isArray(output) ? output : [output]) as Rollup.RolldownOutput[]
	).flatMap((result: Rollup.RolldownOutput): Rollup.OutputChunk[] => {
		return result.output.filter(
			(item: Rollup.OutputChunk | Rollup.OutputAsset): item is Rollup.OutputChunk => {
				return item.type === 'chunk';
			},
		);
	});

	const code: string = chunks.map((chunk: Rollup.OutputChunk): string => chunk.code).join('\n');
	const { rocket = '', ...others }: Record<string, string> = sampleIconPaths;

	if (!code.includes(rocket)) failures.push(`${singleIconName}: the imported icon is missing.`);

	Object.entries(others)
		.filter(([, path]: [string, string]): boolean => code.includes(path))
		.forEach(([name]: [string, string]): void => {
			failures.push(`${singleIconName}: the icon "${name}", not imported, reached the bundle.`);
		});

	return {
		name: singleIconName,
		initial: sizeOf(chunks.map((chunk: Rollup.OutputChunk): string => chunk.code)),
		onDemand: null,
	};
};

const findFreePort = async (): Promise<number> => {
	const server: Server = createServer();

	await new Promise<void>((resolve: () => void): void => {
		server.listen(0, resolve);
	});

	const { port }: AddressInfo = server.address() as AddressInfo;

	await new Promise<void>((resolve: () => void): void => {
		server.close((): void => {
			resolve();
		});
	});

	return port;
};

const waitForServer = async (url: string, deadline: number): Promise<void> => {
	const isUp: boolean = await fetch(url).then(
		(response: Response): boolean => response.ok,
		(): boolean => false,
	);

	if (isUp) return;
	if (Date.now() > deadline) throw new Error(`The starter did not answer at ${url} in time.`);

	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, 250);
	});

	await waitForServer(url, deadline);
};

const listFiles = (directory: string): string[] => {
	return readdirSync(directory, { withFileTypes: true, recursive: true })
		.filter((entry: { isFile: () => boolean }): boolean => entry.isFile())
		.map((entry: { parentPath: string; name: string }): string => {
			return join(entry.parentPath, entry.name);
		});
};

const scriptFilesOf = (html: string): string[] => {
	return [...html.matchAll(/<script[^>]*\ssrc="\/_next\/(static\/[^"?]+\.js)[^"]*"/g)].map(
		(match: RegExpExecArray): string => join(starterRoot, '.next', ...(match[1] ?? '').split('/')),
	);
};

const measureStarter = async (failures: string[]): Promise<Measurement[]> => {
	if (!existsSync(join(starterRoot, '.next', 'BUILD_ID'))) {
		throw new Error('Build the starter first: pnpm build.');
	}

	const requireFromStarter: NodeJS.Require = createRequire(join(starterRoot, 'package.json'));
	const nextExecutable: string = requireFromStarter.resolve('next/dist/bin/next');
	const port: number = await findFreePort();
	const origin: string = `http://localhost:${String(port)}`;

	const server: ChildProcess = spawn(
		process.execPath,
		[nextExecutable, 'start', '--port', String(port)],
		{
			cwd: starterRoot,
			env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
			stdio: 'ignore',
		},
	);

	try {
		await waitForServer(`${origin}/en-us`, Date.now() + serverStartTimeoutInMilliseconds);
		const initialFiles: Set<string> = new Set<string>();

		const routes: Measurement[] = await Promise.all(
			starterRoutes.map(async (route: string): Promise<Measurement> => {
				const html: string = await (await fetch(`${origin}${route}`)).text();
				const files: string[] = [...new Set(scriptFilesOf(html))];
				if (files.length === 0) failures.push(`starter ${route}: the page loads no script.`);

				files.forEach((file: string): void => {
					initialFiles.add(file);
				});

				return {
					name: `starter: ${route}`,
					initial: sizeOf(files.map((file: string): Buffer => readFileSync(file))),
					onDemand: null,
				};
			}),
		);

		const engineFiles: string[] = listFiles(join(starterRoot, '.next', 'static', 'chunks')).filter(
			(file: string): boolean => {
				return file.endsWith('.js') && readFileSync(file, 'utf8').includes(engineMarker);
			},
		);

		const engineInInitial: string[] = engineFiles.filter((file: string): boolean => {
			return initialFiles.has(file);
		});

		if (engineInInitial.length > 0) {
			failures.push(
				`The chart engine is in the initial JS of the starter (${engineInInitial
					.map((file: string): string => relative(starterRoot, file).split(sep).join('/'))
					.join(', ')}); it must be loaded on demand.`,
			);
		}

		if (engineFiles.length === 0) failures.push('The starter build has no chart engine chunk.');

		return [
			...routes,
			{
				name: engineName,
				initial: null,
				onDemand: sizeOf(engineFiles.map((file: string): Buffer => readFileSync(file))),
			},
		];
	} finally {
		server.kill();
	}
};

const readBudgets = (): BudgetFile => {
	return existsSync(budgetFilePath)
		? (JSON.parse(readFileSync(budgetFilePath, 'utf8')) as BudgetFile)
		: { description: '', entries: {} };
};

const limitFor = (gzip: number): Limit => {
	return { baseline: gzip, budget: Math.ceil((gzip * headroom) / budgetStep) * budgetStep };
};

const writeBudgets = (measurements: readonly Measurement[]): void => {
	const entries: Record<string, BudgetEntry> = Object.fromEntries(
		measurements.map((measurement: Measurement): [string, BudgetEntry] => {
			return [
				measurement.name,
				{
					...(measurement.initial === null ? {} : { initial: limitFor(measurement.initial.gzip) }),
					...(measurement.onDemand === null
						? {}
						: { onDemand: limitFor(measurement.onDemand.gzip) }),
				},
			];
		}),
	);

	const file: BudgetFile = {
		description:
			'Gzip bytes of the initial and on-demand JS of each public entry and starter route. Checked by `pnpm check:bundle`; rewritten by `node scripts/check-bundle-size.ts --update`, in a pull request that explains the growth.',
		entries,
	};

	writeFileSync(budgetFilePath, `${JSON.stringify(file, null, '\t')}\n`);
};

const checkPart = (
	measurement: Measurement,
	part: Part,
	entry: BudgetEntry | undefined,
	failures: string[],
): string => {
	const size: Size | null = measurement[part];
	const limit: Limit | undefined = entry?.[part];

	if (size === null) {
		return limit === undefined ? '' : `missing (budget ${kilobytes(limit.budget)})`;
	}

	if (limit === undefined) {
		failures.push(
			`${measurement.name}: no ${part} budget. Run node scripts/check-bundle-size.ts --update.`,
		);

		return 'no budget';
	}

	if (size.gzip > limit.budget) {
		failures.push(
			`${measurement.name}: ${part} JS is ${kilobytes(size.gzip)} gzip, over its budget of ${kilobytes(limit.budget)} (baseline ${kilobytes(limit.baseline)}).`,
		);

		return `over ${kilobytes(limit.budget)}`;
	}

	const change: number = ((size.gzip - limit.baseline) / Math.max(limit.baseline, 1)) * 100;
	return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% of baseline, budget ${kilobytes(limit.budget)}`;
};

const formatSize = (size: Size | null): string => {
	return size === null ? '—' : `${kilobytes(size.gzip)} / ${kilobytes(size.brotli)}`;
};

const report = (
	measurements: readonly Measurement[],
	budgets: BudgetFile,
	failures: string[],
): string => {
	const rows: string[] = measurements.map((measurement: Measurement): string => {
		const entry: BudgetEntry | undefined = budgets.entries[measurement.name];
		const initialStatus: string = checkPart(measurement, 'initial', entry, failures);
		const onDemandStatus: string = checkPart(measurement, 'onDemand', entry, failures);

		return `| ${measurement.name} | ${formatSize(measurement.initial)} | ${initialStatus} | ${formatSize(measurement.onDemand)} | ${onDemandStatus} |`;
	});

	const measuredNames: Set<string> = new Set<string>(
		measurements.map((measurement: Measurement): string => measurement.name),
	);

	Object.keys(budgets.entries)
		.filter((name: string): boolean => !measuredNames.has(name))
		.forEach((name: string): void => {
			failures.push(`${name}: has a budget but was not measured; remove it with --update.`);
		});

	return [
		'## Bundle sizes',
		'',
		'Gzip / brotli. Package entries exclude the peer dependencies; starter routes include everything they load.',
		'',
		'| Entry | Initial JS | Initial budget | On-demand JS | On-demand budget |',
		'| --- | --- | --- | --- | --- |',
		...rows,
		'',
	].join('\n');
};

const failures: string[] = [];
const measurements: Measurement[] = [];

for (const subpath of codeSubpaths) measurements.push(await measureEntry(subpath, failures));
measurements.push(await measureSingleIcon(failures));
measurements.push(...(await measureStarter(failures)));

if (updating) writeBudgets(measurements);
const summary: string = report(measurements, readBudgets(), failures);
console.log(summary);

const stepSummaryPath: string | undefined = process.env.GITHUB_STEP_SUMMARY;
if (stepSummaryPath !== undefined) appendFileSync(stepSummaryPath, `${summary}\n`);

if (failures.length > 0) {
	console.error(failures.map((failure: string): string => `✗ ${failure}`).join('\n'));
	process.exitCode = 1;
}
