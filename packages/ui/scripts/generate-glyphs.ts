// Writes the data of the glyphs the components draw, taken from Tabler (MIT) icon by icon, so that the library embeds
// only the icons it uses and does not depend on `@iconify-json/tabler` at runtime. A test fails when the committed
// copy is out of date.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { icons as tablerIcons } from '@iconify-json/tabler';
import { format, resolveConfig } from 'prettier';
import type { Options } from 'prettier';

import { glyphSources, renderGlyphModule } from '@/scripts/glyph-artifacts';

const modulePath: string = fileURLToPath(
	new URL('../src/shared/glyphs/glyph-data.ts', import.meta.url),
);

const prettierConfiguration: Options | null = await resolveConfig(modulePath);
const source: string = renderGlyphModule(tablerIcons, glyphSources);
writeFileSync(modulePath, await format(source, { ...prettierConfiguration, filepath: modulePath }));

console.log(
	`Generated src/shared/glyphs/glyph-data.ts from ${String(Object.keys(glyphSources).length)} Tabler icons.`,
);
