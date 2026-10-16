import { icons as tablerIcons } from '@iconify-json/tabler';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { generationCommand, glyphSources, resolveGlyphs } from '#scripts/glyph-artifacts.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { glyphData } from '#src/shared/glyphs/glyph-data.ts';

describe('glyphs', (): void => {
	it(`match the installed Tabler icons (regenerate with ${generationCommand})`, (): void => {
		expect(glyphData).toEqual(resolveGlyphs(tablerIcons, glyphSources));
	});

	it('render as decorative inline SVG without any icon package', (): void => {
		const markup: string = renderToStaticMarkup(<Glyph name='check' />);

		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain('viewBox="0 0 24 24"');
		expect(markup).toContain('d="m5 12l5 5L20 7"');
	});
});
