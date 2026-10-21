// Tests the tarball that would be published (`pnpm pack`), not the workspace folder: `files`, `exports` and the
// compiled output must agree, or a consumer gets a module the registry never received. The tarball is unpacked under
// `.packed/node_modules`, where Node resolves its peers from the fixture's own dependencies, as in a real install.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import type { SpawnSyncReturns } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { createRequire } from 'node:module';
import { join, posix, relative, sep } from 'node:path';
import { before, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

interface ConditionalExport {
	types: string;
	default: string;
}

interface PackageManifest {
	exports: Record<string, string | ConditionalExport>;
}

const packageDirectory: string = fileURLToPath(new URL('../../../packages/ui', import.meta.url));
const packedRoot: string = fileURLToPath(new URL('../.packed', import.meta.url));
const installedPackage: string = join(packedRoot, 'node_modules', '@midnight-indigo', 'ui');

// Files a package always publishes besides those listed in `files`.
const alwaysPublished: RegExp = /^(package\.json|README(\.md)?|LICENSE(\.md)?)$/i;

const run = (command: string, parameters: string[], directory: string): string => {
	const result: SpawnSyncReturns<string> = spawnSync(command, parameters, {
		cwd: directory,
		encoding: 'utf8',
	});

	assert.equal(result.status, 0, `${command} ${parameters.join(' ')} failed:\n${result.stderr}`);
	return result.stdout;
};

const listFiles = (directory: string): string[] => {
	return readdirSync(directory, { withFileTypes: true, recursive: true })
		.filter((entry: Dirent): boolean => entry.isFile())
		.map((entry: Dirent): string => relative(directory, join(entry.parentPath, entry.name)))
		.map((file: string): string => file.split(sep).join('/'));
};

const toSpecifier = (subpath: string): string => {
	return subpath === '.' ? '@midnight-indigo/ui' : `@midnight-indigo/ui/${subpath.slice(2)}`;
};

let manifest: PackageManifest;
let publishedFiles: string[];

before((): void => {
	// pnpm sets `npm_execpath` for the scripts it runs (a JavaScript entry, or a native executable since pnpm 11);
	// packing with it applies the same rules as `pnpm publish`.
	const packageManager: string | undefined = process.env.npm_execpath;
	assert.ok(packageManager, 'Run through pnpm (pnpm test), which packs the package.');
	const packParameters: string[] = ['pack', '--pack-destination', packedRoot];
	const runsOnNode: boolean = /\.[cm]?js$/.test(packageManager);

	rmSync(packedRoot, { recursive: true, force: true });
	mkdirSync(installedPackage, { recursive: true });

	const tarball: string =
		run(
			runsOnNode ? process.execPath : packageManager,
			runsOnNode ? [packageManager, ...packParameters] : packParameters,
			packageDirectory,
		)
			.trim()
			.split('\n')
			.at(-1)
			?.trim() ?? '';

	assert.ok(existsSync(tarball), `pnpm pack wrote no tarball (${tarball}).`);

	// Straight into place, without the `package/` folder of the tarball: renaming that folder after extracting it failed
	// on Windows (`EPERM`) while another process still held one of the fresh files.
	run('tar', ['-xzf', tarball, '-C', installedPackage, '--strip-components=1'], packedRoot);

	manifest = createRequire(join(installedPackage, 'package.json'))(
		join(installedPackage, 'package.json'),
	) as PackageManifest;

	publishedFiles = listFiles(installedPackage);
});

test('the tarball holds only the compiled output and the package metadata', (): void => {
	const unexpected: string[] = publishedFiles.filter((file: string): boolean => {
		return !file.startsWith('dist/') && !alwaysPublished.test(file);
	});

	assert.ok(publishedFiles.includes('dist/index.js'));
	assert.deepEqual(unexpected, []);
});

test('every target of exports is in the tarball', (): void => {
	const targets: string[] = Object.values(manifest.exports).flatMap(
		(target: string | ConditionalExport): string[] => {
			return typeof target === 'string' ? [target] : [target.types, target.default];
		},
	);

	const missing: string[] = targets
		.map((target: string): string => target.slice(2))
		.filter((target: string): boolean => !publishedFiles.includes(target));

	assert.ok(targets.length > 2);
	assert.deepEqual(missing, []);
});

// A declaration importing a file left out of the tarball turns the types of a consumer into `any` without an error.
test('every declaration of the tarball imports only declarations that are in it', (): void => {
	const relativeImport: RegExp = /(?:from\s+|import\()["'](\.{1,2}\/[^"']+)["']/g;

	const dangling: string[] = publishedFiles
		.filter((file: string): boolean => file.endsWith('.d.ts'))
		.flatMap((file: string): string[] => {
			const source: string = readFileSync(join(installedPackage, file), 'utf8');

			return [...source.matchAll(relativeImport)]
				.map((match: RegExpExecArray): string => {
					return posix.join(posix.dirname(file), match[1].replace(/\.js$/, '.d.ts'));
				})
				.filter((target: string): boolean => !publishedFiles.includes(target))
				.map((target: string): string => `${file} → ${target}`);
		});

	assert.ok(publishedFiles.some((file: string): boolean => file.endsWith('.d.ts')));
	assert.deepEqual(dangling, []);
});

const nonCodeExports: readonly string[] = ['./styles.css', './package.json'];

test('every public subpath of the tarball imports, with its peers resolved as in an install', async (): Promise<void> => {
	const requireFromInstall: NodeJS.Require = createRequire(
		join(packedRoot, 'node_modules', 'consumer.js'),
	);

	const subpaths: string[] = Object.keys(manifest.exports).filter((subpath: string): boolean => {
		return !nonCodeExports.includes(subpath);
	});

	for (const subpath of subpaths) {
		const resolved: string = requireFromInstall.resolve(toSpecifier(subpath));

		assert.ok(
			resolved.startsWith(installedPackage),
			`${subpath} resolved outside the tarball: ${resolved}.`,
		);

		// Some subpaths are still empty placeholders (charts, i18n, dashboard): importing them must work all the same.
		const importedModule: unknown = await import(pathToFileURL(resolved).href);
		assert.equal(typeof importedModule, 'object');
	}
});

test('the public stylesheet is in the tarball', (): void => {
	const requireFromInstall: NodeJS.Require = createRequire(
		join(packedRoot, 'node_modules', 'consumer.js'),
	);

	const stylesheet: string = requireFromInstall.resolve('@midnight-indigo/ui/styles.css');

	assert.ok(stylesheet.startsWith(installedPackage));
	assert.ok(existsSync(stylesheet));
});
