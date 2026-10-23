// Public subpath `@midnight-indigo/ui/code`. Highlighting needs the optional peer `shiki`, which `highlightCode` loads on
// demand: rendering code with `CodeBlock` and `Code` never loads it.
export { Code } from '@/src/code/code/index';
export type { CodeProps } from '@/src/code/code/index';
export { CodeBlock, defaultCodeBlockLabels } from '@/src/code/code-block/index';
export type { CodeBlockLabels, CodeBlockProps, CodeFile } from '@/src/code/code-block/index';
export { highlightCode } from '@/src/code/highlight-code/index';
export { codeLanguages, plainCode } from '@/src/code/highlighted-code';
export type {
	CodeLanguage,
	CodeLine,
	CodeToken,
	HighlightedCode,
} from '@/src/code/highlighted-code';
