import { afterEach, describe, expect, it, vi } from 'vitest';

import { highlightCode } from '#src/code/highlight-code/index.ts';
import { codeLanguages, plainCode } from '#src/code/highlighted-code.ts';
import type { CodeLanguage, CodeToken, HighlightedCode } from '#src/code/highlighted-code.ts';
import { syntaxColors } from '#src/code/syntax-theme.ts';

afterEach((): void => {
	vi.doUnmock('#src/code/highlighter/index.ts');
	vi.resetModules();
});

const tokensOf = (code: HighlightedCode): CodeToken[] => code.lines.flat();

const tokenWith = (code: HighlightedCode, content: string): CodeToken | undefined => {
	return tokensOf(code).find((token: CodeToken): boolean => token.content.trim() === content);
};

const samples: Readonly<Record<CodeLanguage, string>> = {
	tsx: "const Greeting = (): ReactElement => <Chip label='Samus Aran' />;",
	typescript: "export const pilot: string = 'Spike Spiegel';",
	jsx: '<Avatar name="Leia Organa" />',
	javascript: 'const total = 42;',
	json: '{ "name": "Samus Aran", "active": true }',
	css: '.hangar { color: var(--mi-text-primary); }',
	html: '<p class="note">Bebop</p>',
	shell: 'pnpm add shiki # optional peer',
	markdown: '# Hangar\n\nSome **bold** text.',
	text: 'Plain words.',
};

describe('highlightCode', (): void => {
	it('colors TypeScript with references to the tokens of the theme', async (): Promise<void> => {
		const code: HighlightedCode = await highlightCode(
			"// Bounty\nimport { Chip } from '@midnight-indigo/ui/data-display';\n",
			'tsx',
		);

		expect(code.code).toBe("// Bounty\nimport { Chip } from '@midnight-indigo/ui/data-display';");
		expect(code.language).toBe('tsx');
		expect(code.lines).toHaveLength(2);

		expect(tokenWith(code, '// Bounty')).toEqual({
			content: '// Bounty',
			color: syntaxColors.comment,
			italic: true,
		});

		expect(tokenWith(code, 'import')?.color).toBe(syntaxColors.keyword);
		expect(tokenWith(code, "'@midnight-indigo/ui/data-display'")?.color).toBe(syntaxColors.string);
	});

	it('leaves plain text without a color and joins runs of one style', async (): Promise<void> => {
		const code: HighlightedCode = await highlightCode('const total = count + 1;', 'typescript');
		const contents: string[] = tokensOf(code).map((token: CodeToken): string => token.content);

		expect(contents.join('')).toBe('const total = count + 1;');
		expect(tokensOf(code).length).toBeLessThan(10);

		expect(
			tokensOf(code).some((token: CodeToken): boolean => token.color === syntaxColors.plain),
		).toBe(false);
	});

	it('normalizes line breaks and keeps empty lines', async (): Promise<void> => {
		const code: HighlightedCode = await highlightCode('first\r\n\r\nthird\r\n', 'typescript');

		expect(code.code).toBe('first\n\nthird');
		expect(code.lines).toHaveLength(3);
		expect(code.lines[1]).toEqual([]);
	});

	it.each(codeLanguages)(
		'highlights %s and keeps every character',
		async (language: CodeLanguage) => {
			const code: HighlightedCode = await highlightCode(samples[language], language);

			const colors = new Set<string | undefined>(
				tokensOf(code).map((token: CodeToken) => token.color),
			);

			expect(
				code.lines.map((line) => line.map((token: CodeToken) => token.content).join('')).join('\n'),
			).toBe(samples[language]);

			colors.forEach((color: string | undefined): void => {
				expect([undefined, ...Object.values(syntaxColors)]).toContain(color);
			});

			expect(colors.size > 1).toBe(language !== 'text');
		},
	);

	it('returns text unstyled, as plainCode does', async (): Promise<void> => {
		expect(await highlightCode('a\nb', 'text')).toEqual(plainCode('a\nb'));
	});

	it('explains how to install Shiki when it is missing', async (): Promise<void> => {
		vi.doMock('#src/code/highlighter/index.ts', (): never => {
			throw new Error('Cannot find package shiki');
		});

		const module: { highlightCode: typeof highlightCode } =
			await import('#src/code/highlight-code/index.ts');

		await expect(module.highlightCode('const a = 1;', 'typescript')).rejects.toThrow(
			/optional peer dependency shiki/,
		);

		expect(await module.highlightCode('plain', 'text')).toEqual(plainCode('plain'));
	});
});
