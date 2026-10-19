// Highlights code with the compiled `highlightCode` (Shiki installed as the optional peer) and renders the code
// components on the server, as a consumer's Server Component would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CopyButton } from '@midnight-indigo/ui/buttons';
import { Code, CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { CodeToken, HighlightedCode } from '@midnight-indigo/ui/code';
import { TableOfContents } from '@midnight-indigo/ui/navigation';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const withoutStyles = (html: string): string => html.replaceAll(/<style[^>]*>.*?<\/style>/gs, '');

test('the compiled highlightCode loads Shiki and colors with the tokens of the theme', async (): Promise<void> => {
	const code: HighlightedCode = await highlightCode(
		"import { Chip } from '@midnight-indigo/ui/data-display';",
		'tsx',
	);

	const colors: (string | undefined)[] = code.lines.flat().map((token: CodeToken) => token.color);

	assert.equal(code.lines.length, 1);
	assert.ok(colors.includes('var(--mi-support-violet-text)'));
	assert.ok(colors.includes('var(--mi-support-green-text)'));
});

test('the compiled code components render on the server', async (): Promise<void> => {
	const highlighted: HighlightedCode = await highlightCode('const pilot = "Spike";', 'typescript');

	const html: string = withoutStyles(
		renderToString(
			createElement(
				'main',
				null,
				createElement(CodeBlock, {
					code: highlighted,
					fileName: 'pilot.ts',
					showLineNumbers: true,
				}),
				createElement(CodeBlock, {
					files: [
						{ name: 'page.tsx', code: highlighted },
						{ name: 'theme.css', code: '.hangar {}' },
					],
				}),
				createElement('p', null, 'Run ', createElement(Code, null, 'pnpm build')),
				createElement(CopyButton, { value: 'pnpm build', label: 'Copy command' }),
				createElement(TableOfContents, { items: [{ id: 'usage', label: 'Usage' }] }),
			),
		),
	);

	assert.match(html, /<pre role="group" aria-label="pilot.ts" dir="ltr" tabindex="0"/);
	assert.match(html, /style="color:var\(--mi-support-violet-text\)"/);
	assert.match(html, /role="tablist" aria-label="Files"/);
	assert.match(html, /<pre role="tabpanel"[^>]*aria-labelledby=/);
	assert.match(html, /<code[^>]*>pnpm build<\/code>/);
	assert.match(html, /aria-label="Copy command"/);
	assert.match(html, /role="status"/);
	assert.match(html, /<nav aria-labelledby="[^"]+"[^>]*><p id="[^"]+"[^>]*>On this page<\/p><ol/);
	assert.match(html, /<a href="#usage" aria-current="location"/);
});
