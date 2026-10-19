// The source of an example, read from its file when the page is built (the pages of the explorer are static), so the
// code shown is the code that runs. Shiki colors it on the server: the browser receives only the tokens.
import { highlightCode } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cache } from 'react';

export const examplesDirectory: string = join(process.cwd(), 'src', 'explorer', 'examples');

/** `file` is relative to `src/explorer/examples`, as `exampleFileOf` gives it. */
export const readExampleCode = cache(async (file: string): Promise<HighlightedCode> => {
	return highlightCode(await readFile(join(examplesDirectory, file), 'utf8'), 'tsx');
});
