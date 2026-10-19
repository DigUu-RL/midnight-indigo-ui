// Public subpath `@midnight-indigo/ui/code`. Highlighting needs the optional peer `shiki`, which `highlightCode` loads on
// demand: rendering code with `CodeBlock` and `Code` never loads it.
export { Code } from '#src/code/code/index.tsx';
export type { CodeProps } from '#src/code/code/index.tsx';
export { CodeBlock, defaultCodeBlockLabels } from '#src/code/code-block/index.tsx';
export type { CodeBlockLabels, CodeBlockProps, CodeFile } from '#src/code/code-block/index.tsx';
export { highlightCode } from '#src/code/highlight-code/index.ts';
export { codeLanguages, plainCode } from '#src/code/highlighted-code.ts';
export type {
	CodeLanguage,
	CodeLine,
	CodeToken,
	HighlightedCode,
} from '#src/code/highlighted-code.ts';
