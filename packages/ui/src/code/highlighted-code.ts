// Code split into lines of styled tokens: plain data, so it is computed on the server and rendered anywhere.

/** Languages `highlightCode` knows; `text` is shown without colors. */
export const codeLanguages = [
	'tsx',
	'typescript',
	'jsx',
	'javascript',
	'json',
	'css',
	'html',
	'shell',
	'markdown',
	'text',
] as const;

export type CodeLanguage = (typeof codeLanguages)[number];

/** A run of characters with one style. Without `color`, it takes the text color of the code block. */
export interface CodeToken {
	content: string;
	/** A CSS color, a `var(--mi-*)` reference to a token of the theme. */
	color?: string;
	italic?: boolean;
	bold?: boolean;
}

export type CodeLine = readonly CodeToken[];

export interface HighlightedCode {
	/** The source, as `CodeBlock` copies it to the clipboard. */
	code: string;
	language: CodeLanguage;
	lines: readonly CodeLine[];
}

/** Line breaks become `\n`, and the final line break of a file does not make an empty last line. */
export const normalizeCode = (code: string): string => {
	return code.replaceAll(/\r\n?/g, '\n').replace(/\n$/, '');
};

/** The code as lines of one unstyled token each. */
export const plainCode = (code: string, language: CodeLanguage = 'text'): HighlightedCode => {
	const normalized: string = normalizeCode(code);

	return {
		code: normalized,
		language,
		lines: normalized.split('\n').map((line: string): CodeLine => {
			return line === '' ? [] : [{ content: line }];
		}),
	};
};
