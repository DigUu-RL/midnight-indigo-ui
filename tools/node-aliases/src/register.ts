// Node resolves neither the `@/` alias nor imports without an extension. Bundlers and TypeScript read the alias from
// `paths` in each tsconfig; this hook gives Node the same rule: `@/<path>` is `<path>` from the root of the package of
// the importing file, tried as written, then with `.ts`, `.tsx`, `/index.ts` and `/index.tsx`.
// It is loaded into every Node process started by pnpm (`nodeOptions` in pnpm-workspace.yaml), so this file cannot use
// the alias itself.
import { existsSync, statSync } from 'node:fs';
import { registerHooks } from 'node:module';
import type { ResolveFnOutput, ResolveHookContext } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aliasPrefix: string = '@/';
const candidateSuffixes: readonly string[] = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

const packageRoots: Map<string, string> = new Map<string, string>();

/** The closest directory, from `directory` up, holding a package.json. */
const findPackageRoot = (directory: string): string => {
	const cachedRoot: string | undefined = packageRoots.get(directory);

	if (cachedRoot !== undefined) return cachedRoot;

	const parentDirectory: string = dirname(directory);

	const packageRoot: string =
		existsSync(join(directory, 'package.json')) || parentDirectory === directory
			? directory
			: findPackageRoot(parentDirectory);

	packageRoots.set(directory, packageRoot);

	return packageRoot;
};

const isFile = (path: string): boolean => {
	return statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;
};

/** The file URL an `@/` specifier points to, or `undefined` when it is not an alias or matches no file. */
export const resolveWorkspaceAlias = (
	specifier: string,
	parentUrl: string | undefined,
): string | undefined => {
	const isAlias: boolean =
		specifier.startsWith(aliasPrefix) && parentUrl?.startsWith('file:') === true;

	if (!isAlias || parentUrl === undefined) return undefined;

	const packageRoot: string = findPackageRoot(dirname(fileURLToPath(parentUrl)));
	const basePath: string = join(packageRoot, specifier.slice(aliasPrefix.length));

	const filePath: string | undefined = candidateSuffixes
		.map((suffix: string): string => `${basePath}${suffix}`)
		.find(isFile);

	return filePath === undefined ? undefined : pathToFileURL(filePath).href;
};

registerHooks({
	resolve: (
		specifier: string,
		context: ResolveHookContext,
		nextResolve: (specifier: string, context?: Partial<ResolveHookContext>) => ResolveFnOutput,
	): ResolveFnOutput => {
		const url: string | undefined = resolveWorkspaceAlias(specifier, context.parentURL);

		// Answered here: the resolution of `require` (jiti, which loads eslint.config.ts) takes no URL as specifier.
		return url === undefined ? nextResolve(specifier, context) : { url, shortCircuit: true };
	},
});
