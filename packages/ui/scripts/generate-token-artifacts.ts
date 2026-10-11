// Writes the files generated from the tokens. A test fails when the committed copies are out of date.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { renderStylesheet, renderTokenDocument } from '#scripts/token-artifacts.ts';

const stylesheetPath: string = fileURLToPath(new URL('../src/styles.css', import.meta.url));
const documentPath: string = fileURLToPath(new URL('../docs/tokens.md', import.meta.url));

writeFileSync(stylesheetPath, renderStylesheet());
writeFileSync(documentPath, renderTokenDocument());
console.log('Generated src/styles.css and docs/tokens.md from the tokens.');
