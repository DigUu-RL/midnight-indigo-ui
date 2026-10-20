import { CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import type { ReactElement } from 'react';

const source: string = [
	'interface Hyperdrive {',
	'\tclass: number;',
	'\tmotivatorOnline: boolean;',
	'}',
	'',
	'export const canJump = (hyperdrive: Hyperdrive): boolean => {',
	'\treturn hyperdrive.motivatorOnline && hyperdrive.class <= 2;',
	'};',
].join('\n');

// A Server Component: Shiki colors the code on the server, and the browser receives only the tokens.
export const HyperdriveCheck = async (): Promise<ReactElement> => {
	const code: HighlightedCode = await highlightCode(source, 'typescript');

	return (
		<CodeBlock
			code={code}
			fileName='hyperdrive.ts'
			showLineNumbers
			highlightedLines={[7]}
			style={{ width: '100%' }}
		/>
	);
};
