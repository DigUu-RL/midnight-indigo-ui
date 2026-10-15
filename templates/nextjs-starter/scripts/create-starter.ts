// Generates a standalone copy of the starter, ready to install and run outside of this repository:
//
//   pnpm create:starter <directory> [--pack]
//
// The copy leaves out the tests, the build output and this script; `catalog:` versions become the ranges of
// `pnpm-workspace.yaml`, the TypeScript configuration stops extending the one of the monorepo, and
// `@midnight-indigo/ui` points to the npm registry or, with `--pack`, to a tarball of the local build copied into the
// project (`vendor/`), for trying the starter before a release.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type DependencyMap = Record<string, string>;

interface PackageManifest {
	name: string;
	version: string;
	description?: string;
	imports?: Record<string, string>;
	scripts?: Record<string, string>;
	dependencies?: DependencyMap;
	devDependencies?: DependencyMap;
	[field: string]: unknown;
}

interface TypeScriptConfiguration {
	extends?: string;
	compilerOptions?: Record<string, unknown>;
	include?: string[];
	[field: string]: unknown;
}

export interface CreateStarterOptions {
	/** Directory of the new project; it must not exist yet, or be empty. */
	target: string;
	/** Packs the local build of `@midnight-indigo/ui` into the project instead of using the registry. */
	pack?: boolean;
}

const starterRoot: string = fileURLToPath(new URL('..', import.meta.url));
const repositoryRoot: string = resolve(starterRoot, '..', '..');
const libraryRoot: string = join(repositoryRoot, 'packages', 'ui');
const libraryName: string = '@midnight-indigo/ui';

/** Entries of the starter root that only make sense inside the monorepo: tests, build output, generated files and this script. */
const excludedEntries: ReadonlySet<string> = new Set<string>([
	'node_modules',
	'.next',
	'test',
	'scripts',
	'next-env.d.ts',
	'tsconfig.tsbuildinfo',
]);

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'));

const writeJson = (file: string, value: unknown): void => {
	writeFileSync(file, `${JSON.stringify(value, null, '\t')}\n`);
};

/** The `catalog:` block of `pnpm-workspace.yaml`: one `name: range` per line, indented by two spaces. */
export const readCatalog = (): ReadonlyMap<string, string> => {
	const lines: string[] = readFileSync(join(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8').split(
		/\r?\n/,
	);

	const start: number = lines.indexOf('catalog:');

	const entries: [string, string][] = lines
		.slice(start + 1)
		.filter((line: string): boolean => /^ {2}\S/.test(line))
		.map((line: string): [string, string] => {
			const [, name = '', range = ''] = /^ {2}'?([^':]+)'?:\s*(\S+)/.exec(line) ?? [];
			return [name, range];
		});

	return new Map<string, string>(entries);
};

const packLibrary = (vendorDirectory: string): string => {
	const { version }: PackageManifest = readJson(
		join(libraryRoot, 'package.json'),
	) as PackageManifest;

	const tarball: string = `midnight-indigo-ui-${version}.tgz`;

	if (!existsSync(join(libraryRoot, 'dist', 'index.js'))) {
		throw new Error('Build the library first: pnpm build.');
	}

	mkdirSync(vendorDirectory, { recursive: true });

	// Through the shell, since pnpm is a `.cmd` file on Windows.
	execSync(`pnpm pack --pack-destination "${vendorDirectory}"`, {
		cwd: libraryRoot,
		stdio: 'ignore',
	});

	return `file:vendor/${tarball}`;
};

const resolveDependencies = (
	dependencies: DependencyMap | undefined,
	catalog: ReadonlyMap<string, string>,
	libraryRange: string,
): DependencyMap => {
	return Object.fromEntries(
		Object.entries(dependencies ?? {}).map(([name, range]: [string, string]): [string, string] => {
			if (name === libraryName) return [name, libraryRange];
			if (range !== 'catalog:') return [name, range];

			const version: string | undefined = catalog.get(name);

			if (version === undefined) {
				throw new Error(`${name} is not in the catalog of pnpm-workspace.yaml.`);
			}

			return [name, version];
		}),
	);
};

const packageNameOf = (target: string): string => {
	const name: string = basename(target)
		.toLowerCase()
		.replaceAll(/[^a-z\d-]+/g, '-')
		.replaceAll(/^-+|-+$/g, '');

	return name === '' ? 'midnight-indigo-app' : name;
};

const writeManifest = (target: string, libraryRange: string): void => {
	const manifest: PackageManifest = readJson(join(starterRoot, 'package.json')) as PackageManifest;
	const catalog: ReadonlyMap<string, string> = readCatalog();

	const scripts: Record<string, string> = Object.fromEntries(
		Object.entries(manifest.scripts ?? {}).filter(
			([name]: [string, string]): boolean => name !== 'test',
		),
	);

	// `#test/*` and `#scripts/*` point to folders the copy leaves out.
	const imports: Record<string, string> = Object.fromEntries(
		Object.entries(manifest.imports ?? {}).filter(([, path]: [string, string]): boolean => {
			return !excludedEntries.has(path.split('/')[1] ?? '');
		}),
	);

	// The empty `name` and `version` only keep the two fields at the top of the file.
	writeJson(
		join(target, 'package.json'),
		Object.assign({ name: '', version: '' }, manifest, {
			name: packageNameOf(target),
			version: '0.1.0',
			description: 'Next.js application made with Midnight Indigo: UI.',
			imports,
			scripts,
			dependencies: resolveDependencies(manifest.dependencies, catalog, libraryRange),
			devDependencies: resolveDependencies(manifest.devDependencies, catalog, libraryRange),
		}),
	);
};

/** The configuration of the starter merged over the base of the monorepo, so the copy stands on its own. */
const writeTypeScriptConfiguration = (target: string): void => {
	const base: TypeScriptConfiguration = readJson(
		join(repositoryRoot, 'tsconfig.base.json'),
	) as TypeScriptConfiguration;

	const own: TypeScriptConfiguration = readJson(
		join(starterRoot, 'tsconfig.json'),
	) as TypeScriptConfiguration;

	// `extends: undefined` leaves the field out of the JSON.
	writeJson(join(target, 'tsconfig.json'), {
		...own,
		extends: undefined,
		compilerOptions: { ...base.compilerOptions, ...own.compilerOptions },
		include: (own.include ?? []).filter((pattern: string): boolean => {
			return pattern !== 'test' && pattern !== 'scripts';
		}),
	});
};

export const createStarter = ({ target, pack = false }: CreateStarterOptions): void => {
	const destination: string = resolve(target);

	if (existsSync(destination) && readdirSync(destination).length > 0) {
		throw new Error(`${destination} is not empty.`);
	}

	cpSync(starterRoot, destination, {
		recursive: true,
		filter: (source: string): boolean => !excludedEntries.has(relative(starterRoot, source)),
	});

	const { version }: PackageManifest = readJson(
		join(libraryRoot, 'package.json'),
	) as PackageManifest;

	const libraryRange: string = pack ? packLibrary(join(destination, 'vendor')) : `^${version}`;

	writeManifest(destination, libraryRange);
	writeTypeScriptConfiguration(destination);
};

const isEntryPoint: boolean =
	process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
	const parameters: string[] = process.argv.slice(2);

	const target: string | undefined = parameters.find((parameter: string): boolean => {
		return !parameter.startsWith('--');
	});

	if (target === undefined) {
		console.error('Usage: pnpm create:starter <directory> [--pack]');
		process.exit(1);
	}

	createStarter({ target, pack: parameters.includes('--pack') });

	console.log(
		`Starter created in ${resolve(target)}. Next: cd into it, install the dependencies and run the dev server.`,
	);
}
