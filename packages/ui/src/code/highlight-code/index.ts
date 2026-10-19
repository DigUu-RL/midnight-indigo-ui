// Syntax highlighting for `CodeBlock`, meant for the server: a Server Component, a build script or a loader computes the
// tokens, and the browser receives plain data, without Shiki nor any grammar.
import { normalizeCode, plainCode } from '#src/code/highlighted-code.ts';
import type { CodeLanguage, CodeLine, HighlightedCode } from '#src/code/highlighted-code.ts';

type Tokenizer = (code: string, language: Exclude<CodeLanguage, 'text'>) => Promise<CodeLine[]>;

const loadTokenizer = async (): Promise<Tokenizer> => {
	try {
		const highlighter: { tokenize: Tokenizer } = await import('#src/code/highlighter/index.ts');
		return highlighter.tokenize;
	} catch (error: unknown) {
		throw new Error(
			'highlightCode needs the optional peer dependency shiki: install it next to @midnight-indigo/ui.',
			{ cause: error },
		);
	}
};

/**
 * Highlights `code` with Shiki, loaded on the first call and kept for the next ones. The colors are references to the
 * tokens of the theme (`var(--mi-*)`), so the result follows any palette and can be cached, e.g. at build time.
 * `text` returns the code without colors and never loads Shiki.
 */
export const highlightCode = async (
	code: string,
	language: CodeLanguage,
): Promise<HighlightedCode> => {
	if (language === 'text') return plainCode(code);
	const tokenize: Tokenizer = await loadTokenizer();
	const normalized: string = normalizeCode(code);
	return { code: normalized, language, lines: await tokenize(normalized, language) };
};
