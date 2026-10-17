// Repository-wide rules of the token system: generated files in sync, tokens instead of hex, dark-only.
import { readdirSync, readFileSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
	generationCommand,
	renderStylesheet,
	renderTokenDocument,
} from '#scripts/token-artifacts.ts';

const packageRoot: string = fileURLToPath(new URL('..', import.meta.url));
const sourceDirectory: string = join(packageRoot, 'src');

const readPackageFile = (path: string): string => {
	return readFileSync(join(packageRoot, path), 'utf8').replaceAll('\r\n', '\n');
};

const listFilesRecursively = (directory: string): string[] => {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry: Dirent): string[] => {
		const entryPath: string = join(directory, entry.name);
		return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
	});
};

const sourceFiles: string[] = listFilesRecursively(sourceDirectory).map((file: string): string => {
	return relative(sourceDirectory, file).split(sep).join('/');
});

const readSource = (file: string): string => readFileSync(join(sourceDirectory, file), 'utf8');

// Tests are skipped by the rules below: they spell out colors and forbidden patterns as fixtures.
const productionFiles: string[] = sourceFiles.filter(
	(file: string): boolean => !/\.test\.tsx?$/.test(file),
);

// `src/tokens` owns color values; `styles.css` is generated from it.
const isTokenSource = (file: string): boolean => {
	return file.startsWith('tokens/') || file === 'styles.css';
};

describe('generated token artifacts', (): void => {
	it.each([
		['src/styles.css', renderStylesheet],
		['docs/en-us/tokens.md', renderTokenDocument],
	])(
		`%s is up to date (run \`${generationCommand}\`)`,
		(path: string, render: () => string): void => {
			expect(readPackageFile(path)).toBe(render());
		},
	);

	it('publish the exact official pink as a CSS variable', (): void => {
		expect(readPackageFile('src/styles.css')).toContain('--mi-intent-official-main: #FF6AC1;');
	});
});

describe('semantic tokens instead of scattered values', (): void => {
	const hexColorPattern: RegExp = /#[0-9a-f]{3,8}\b/gi;

	it.each(productionFiles.filter((file: string): boolean => !isTokenSource(file)))(
		'%s has no hexadecimal color',
		(file: string): void => {
			expect(
				readSource(file).match(hexColorPattern) ?? [],
				'Reference a token from `src/tokens` instead',
			).toEqual([]);
		},
	);
});

describe('typography tokens instead of literal fonts and sizes', (): void => {
	// A literal string or number right after a font property, in CSS or in a style object.
	const literalFontPattern: RegExp = /font-?(?:family|size|weight)\s*:\s*['"`\d]/gi;

	it.each(productionFiles.filter((file: string): boolean => !isTokenSource(file)))(
		'%s takes font values from tokens',
		(file: string): void => {
			expect(
				readSource(file).match(literalFontPattern) ?? [],
				'Reference `tokens.typography` or `themeVariables.typography` instead',
			).toEqual([]);
		},
	);
});

describe('dark-only', (): void => {
	const lightModePattern: RegExp =
		/prefers-color-scheme|color-scheme:\s*light|lightTheme|lightPalette|colorMode|toggleTheme/i;

	it.each(productionFiles)('%s has no light palette or theme toggle', (file: string): void => {
		expect(readSource(file)).not.toMatch(lightModePattern);
	});
});
