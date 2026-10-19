# Code

[Português](../pt-br/code.md)

`@midnight-indigo/ui/code` shows source code: `CodeBlock` for snippets and files, `Code` for a name or a command inside
a sentence, and `highlightCode`, which colors the code with [Shiki](https://shiki.style) on the server. The browser
receives the colored tokens as plain data: no highlighter, no grammar and no theme reach the client bundle.

```tsx
// app/install/page.tsx: a Server Component
import { CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import type { ReactElement } from 'react';

const InstallPage = async (): Promise<ReactElement> => {
	const snippet: HighlightedCode = await highlightCode(
		"import { Chip } from '@midnight-indigo/ui/data-display';\n\n<Chip label='Samus Aran' />",
		'tsx',
	);

	return <CodeBlock code={snippet} fileName='hangar.tsx' showLineNumbers highlightedLines={[3]} />;
};

export default InstallPage;
```

## Installation

Shiki (MIT) is an optional peer dependency, needed only by `highlightCode`:

```sh
pnpm add shiki
```

`CodeBlock` and `Code` never load it: a `CodeBlock` given a string shows the code without colors. `highlightCode` loads
Shiki with a dynamic `import()` on its first call and keeps it for the next ones; without Shiki it rejects with an
error that says to install it. The `text` language never loads it.

## highlightCode

`highlightCode(code, language)` returns a `HighlightedCode`: the code (line breaks normalized to `\n`, without the final
line break of a file), its language and its lines, each a list of tokens (`content`, and `color`, `italic` and `bold`
when they apply). Runs of one style are joined, which keeps the data small.

- Call it on the server: in a Server Component, a route handler or a build script. The result is serializable, so it
  can be passed to a Client Component or cached (for example in a JSON file at build time).
- The colors are references to the theme (`var(--mi-support-violet-text)`), never hex values, so highlighted code
  follows the palette given to `UiProvider`, also when it was highlighted before the palette changed.
- It uses the JavaScript regular expression engine of Shiki (no WebAssembly) and loads only the grammars of
  `codeLanguages`: `tsx`, `typescript`, `jsx`, `javascript`, `json`, `css`, `html`, `shell`, `markdown` and `text`.
- `plainCode(code, language?)` gives the same shape without colors, without loading Shiki.

## CodeBlock

| Prop               | Type                                                       | Default | Description                                                   |
| ------------------ | ---------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| `code`             | `HighlightedCode \| string`                                | —       | One snippet; a string is shown without colors                 |
| `fileName`         | `string`                                                   | —       | Shown above the code and used as its accessible name          |
| `highlightedLines` | `readonly number[]`                                        | `[]`    | Lines to highlight, from 1                                    |
| `files`            | `readonly CodeFile[]` (`name`, `code`, `highlightedLines`) | —       | Several files, one tab each; replaces `code` and `fileName`   |
| `file`             | `string`                                                   | —       | Name of the file shown, to control it                         |
| `defaultFile`      | `string`                                                   | first   | File shown at first when uncontrolled                         |
| `onFileChange`     | `(name: string) => void`                                   | —       | Called when another file is chosen                            |
| `showLineNumbers`  | `boolean`                                                  | `false` | Numbers the lines                                             |
| `copyable`         | `boolean`                                                  | `true`  | Shows the copy button, which copies the file shown            |
| `labels`           | `Partial<CodeBlockLabels>`                                 | English | `code`, `files` and `copy`; see [Translations](#translations) |

The header shows the file name (or the language, when there is none), or one tab per file, and the copy button. The
code scrolls sideways instead of wrapping, and a highlighted line is tinted (`state.selected`) to the end of the
longest line, with a 2 px bar in `intent.brand.border` at its start, a shape besides the color.

```tsx
<CodeBlock
	files={[
		{ name: 'page.tsx', code: pageCode },
		{ name: 'theme.css', code: themeCode, highlightedLines: [2, 3] },
	]}
/>
```

## Code

`Code` is a `<code>` element for short code inside running text, in Geist Mono at the size of the text around it, so
it fits a heading as well as a caption. Long values break anywhere instead of overflowing.

```tsx
<p>
	Run <Code>pnpm build</Code> before the tests.
</p>
```

## Colors

Each role of the syntax takes a token of the theme. Every pair is part of the contrast audit (`auditContrast`, see
[palette.md](./palette.md#contrast-audit)), at 4.5:1 on the code block (`surface.field`) and on a highlighted line
(`state.selected`).

| Role                                            | Token                    |
| ----------------------------------------------- | ------------------------ |
| Plain code, variables                           | `text.primary`           |
| Comments, line numbers                          | `text.muted`             |
| Punctuation, operators                          | `text.secondary`         |
| Keywords (`import`, `const`, `return`)          | `support.violet.text`    |
| Strings                                         | `support.green.text`     |
| Numbers, `true`, `null`, CSS values             | `support.amber.text`     |
| Functions, object and JSON keys, CSS properties | `support.blue.text`      |
| Types and classes                               | `support.turquoise.text` |
| Tags and components                             | `support.pink.text`      |
| Attributes, CSS selectors                       | `support.orange.text`    |
| Regular expressions, invalid code               | `support.red.text`       |

## Accessibility

- A block is a `group` named by its file name, else by `labels.code` ("Code"). Code is always laid out left to right
  (`dir="ltr"`), also in right-to-left pages.
- The code is a tab stop, so the keyboard can scroll a long line; its focus ring is drawn inside the block.
- With `files`, the header is a `tablist` named by `labels.files` (WAI-ARIA tabs pattern: one tab stop, arrow keys,
  Home and End), and the code is the `tabpanel` of the selected tab.
- Line numbers are drawn by CSS: they are neither selected nor copied with the code.
- The copy button is a [`CopyButton`](./components.md#copybutton): its name stays the same, and the result is announced
  by a live region.

## Translations

| Component    | Texts                                                    |
| ------------ | -------------------------------------------------------- |
| `CodeBlock`  | `code` (name of a block without a file), `files`, `copy` |
| `CopyButton` | `copy`, `copied`, `failed`                               |

`I18nProvider` of `@midnight-indigo/ui/i18n` gives them in English and Brazilian Portuguese (`codeBlock` and
`copyButton` in the `midnight-indigo` namespace); the defaults are `defaultCodeBlockLabels` and
`defaultCopyButtonLabels`.

## Bundle

The entry reaches React and Material UI subpaths only. `highlightCode` imports the Shiki adapter
(`dist/code/highlighter/index.js`, which imports `shiki/core` and `shiki/engine/javascript`) with a dynamic `import()`,
so a page that renders code never loads it; the consumer fixture follows the compiled import graph to prove it, and
`pnpm check:bundle` measures the entry and its on-demand part.

## Tests

`highlightCode` is tested in every language (each character kept, only colors of the syntax), with line breaks
normalized and a helpful error when Shiki is missing. The syntax colors are checked against the contrast audit.
`CodeBlock` is tested for its names, tokens, line numbers (CSS only), highlighted lines, file tabs with the keyboard,
the copy of the file shown and translated labels, with axe-core; the consumer fixture highlights with the compiled
output and renders the components on the server.
