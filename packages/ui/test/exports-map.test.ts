import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface ConditionalExport {
	types: string;
	default: string;
}

interface PackageManifest {
	exports: Record<string, string | ConditionalExport>;
}

const packageRoot: string = fileURLToPath(new URL('..', import.meta.url));
const sourceDirectory: string = fileURLToPath(new URL('../src', import.meta.url));

const manifest: PackageManifest = JSON.parse(
	readFileSync(`${packageRoot}/package.json`, 'utf8'),
) as PackageManifest;

// Intentional public list (docs/ARCHITECTURE.md §2). Changing it requires a recorded decision.
const publicSubpaths: readonly string[] = [
	'.',
	'./tokens',
	'./theme',
	'./buttons',
	'./forms',
	// Optional integrations, with optional peer dependencies kept out of `./forms`.
	'./forms/date-pickers',
	'./forms/react-hook-form',
	'./feedback',
	'./navigation',
	'./data-display',
	'./charts',
	'./i18n',
	'./dashboard',
];

const nonCodeExports: readonly string[] = ['./styles.css', './package.json'];

const codeExports: [string, string | ConditionalExport][] = Object.entries(manifest.exports).filter(
	([subpath]: [string, string | ConditionalExport]): boolean => !nonCodeExports.includes(subpath),
);

const toDomainPath = (subpath: string): string => (subpath === '.' ? '' : `${subpath.slice(2)}/`);

describe('package.json exports', (): void => {
	it('declares exactly the planned public subpaths', (): void => {
		const declaredSubpaths: string[] = codeExports.map(
			([subpath]: [string, string | ConditionalExport]): string => subpath,
		);

		expect(declaredSubpaths).toEqual(publicSubpaths);
	});

	it.each(codeExports)(
		'%s points to dist with matching types and default conditions',
		(subpath: string, target: string | ConditionalExport): void => {
			const outputBase: string = `./dist/${toDomainPath(subpath)}index`;
			expect(target).toEqual({ types: `${outputBase}.d.ts`, default: `${outputBase}.js` });
		},
	);

	it.each(codeExports)('%s has a matching source entry', (subpath: string): void => {
		expect(existsSync(`${sourceDirectory}/${toDomainPath(subpath)}index.ts`)).toBe(true);
	});

	it('has no source domain without a public export', (): void => {
		const sourceDomains: string[] = readdirSync(sourceDirectory, { withFileTypes: true })
			.filter((entry: Dirent): boolean => {
				return entry.isDirectory() && existsSync(`${sourceDirectory}/${entry.name}/index.ts`);
			})
			.map((entry: Dirent): string => `./${entry.name}`)
			.toSorted();

		const exportedDomains: string[] = publicSubpaths
			.filter((subpath: string): boolean => subpath !== '.' && !subpath.slice(2).includes('/'))
			.toSorted();

		expect(sourceDomains).toEqual(exportedDomains);
	});

	it('exposes the public stylesheet', (): void => {
		expect(manifest.exports['./styles.css']).toBe('./dist/styles.css');
		expect(existsSync(`${sourceDirectory}/styles.css`)).toBe(true);
	});
});
