// Adapter of Shiki: the only module that loads it. `highlightCode` imports it on demand, so Shiki and its grammars stay
// out of every bundle that only renders code. The JavaScript regular expression engine needs no WebAssembly, and only
// the grammars of `codeLanguages` are loaded.
import { createHighlighterCore } from 'shiki/core';
import type { HighlighterCore, ThemedToken } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import type { CodeLanguage, CodeLine, CodeToken } from '#src/code/highlighted-code.ts';
import { syntaxColors, syntaxRules } from '#src/code/syntax-theme.ts';

const themeName: string = 'midnight-indigo';

// Grammar of each language with colors; Shiki names the shell grammar `shellscript`.
const grammarNames: Readonly<Record<Exclude<CodeLanguage, 'text'>, string>> = {
	tsx: 'tsx',
	typescript: 'typescript',
	jsx: 'jsx',
	javascript: 'javascript',
	json: 'json',
	css: 'css',
	html: 'html',
	shell: 'shellscript',
	markdown: 'markdown',
};

// Most time Shiki spends on one line before it leaves the rest of the line without colors. Its default, 500 ms, is too
// little for the first line of a grammar, which compiles its regular expressions, on a busy machine (a build of every
// page at once, or the tests beside the lint); a pathological line still stops.
const tokenizeTimeLimit: number = 5000;

// Bit flags of `ThemedToken.fontStyle`.
const italicFlag: number = 1;
const boldFlag: number = 2;

let highlighterPromise: Promise<HighlighterCore> | undefined;

const loadHighlighter = (): Promise<HighlighterCore> => {
	highlighterPromise ??= createHighlighterCore({
		themes: [
			{
				name: themeName,
				type: 'dark',
				colors: { 'editor.foreground': syntaxColors.plain },
				settings: syntaxRules.map(({ scope, settings }) => {
					return scope === undefined ? { settings } : { scope: [...scope], settings };
				}),
			},
		],
		langs: [
			import('shiki/langs/tsx.mjs'),
			import('shiki/langs/typescript.mjs'),
			import('shiki/langs/jsx.mjs'),
			import('shiki/langs/javascript.mjs'),
			import('shiki/langs/json.mjs'),
			import('shiki/langs/css.mjs'),
			import('shiki/langs/html.mjs'),
			import('shiki/langs/shellscript.mjs'),
			import('shiki/langs/markdown.mjs'),
		],
		engine: createJavaScriptRegexEngine(),
	}).catch((error: unknown): never => {
		highlighterPromise = undefined;
		throw error;
	});

	return highlighterPromise;
};

const toCodeToken = ({ content, color, fontStyle }: ThemedToken): CodeToken => {
	const style: number = fontStyle ?? 0;

	return {
		content,
		...(color === undefined || color === syntaxColors.plain ? {} : { color }),
		...((style & italicFlag) === 0 ? {} : { italic: true }),
		...((style & boldFlag) === 0 ? {} : { bold: true }),
	};
};

const sameStyle = (first: CodeToken, second: CodeToken): boolean => {
	return (
		first.color === second.color && first.italic === second.italic && first.bold === second.bold
	);
};

// Runs of the same style, and spaces, join the token before them, which keeps the data small.
const mergeTokens = (tokens: readonly CodeToken[]): CodeLine => {
	return tokens.reduce<CodeToken[]>((merged: CodeToken[], token: CodeToken): CodeToken[] => {
		const previous: CodeToken | undefined = merged.at(-1);

		if (previous !== undefined && (sameStyle(previous, token) || token.content.trim() === '')) {
			merged[merged.length - 1] = { ...previous, content: previous.content + token.content };
			return merged;
		}

		merged.push(token);
		return merged;
	}, []);
};

/** Lines of styled tokens of `code`, already normalized, in a language with a grammar. */
export const tokenize = async (
	code: string,
	language: Exclude<CodeLanguage, 'text'>,
): Promise<CodeLine[]> => {
	const highlighter: HighlighterCore = await loadHighlighter();

	return highlighter
		.codeToTokensBase(code, { lang: grammarNames[language], theme: themeName, tokenizeTimeLimit })
		.map((line: ThemedToken[]): CodeLine => mergeTokens(line.map(toCodeToken)));
};
