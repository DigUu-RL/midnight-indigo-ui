import { CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { CodeFile, HighlightedCode } from '@midnight-indigo/ui/code';
import type { ReactElement } from 'react';

const crewSource: string = [
	"export const crew: readonly string[] = ['Spike Spiegel', 'Jet Black', 'Faye Valentine'];",
	'',
	'export const isAboard = (name: string): boolean => crew.includes(name);',
].join('\n');

const testSource: string = [
	"import assert from 'node:assert/strict';",
	"import { test } from 'node:test';",
	'',
	"import { isAboard } from './crew.ts';",
	'',
	"test('Ed is not aboard yet', (): void => {",
	"\tassert.equal(isAboard('Edward Wong'), false);",
	'});',
].join('\n');

// A Server Component: both files are colored on the server; the tab shown is the one copied.
export const CrewModule = async (): Promise<ReactElement> => {
	const [crew, test]: [HighlightedCode, HighlightedCode] = await Promise.all([
		highlightCode(crewSource, 'typescript'),
		highlightCode(testSource, 'typescript'),
	]);

	const files: CodeFile[] = [
		{ name: 'crew.ts', code: crew },
		{ name: 'crew.test.ts', code: test, highlightedLines: [7] },
	];

	return <CodeBlock files={files} style={{ width: '100%' }} />;
};
