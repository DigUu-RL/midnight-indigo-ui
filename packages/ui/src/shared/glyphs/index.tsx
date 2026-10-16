// Icons drawn by the components themselves. They are decorative: the control around them carries the name.
// Tabler icons (MIT, decision D07), embedded one by one in `glyph-data.ts` so no icon package is needed at runtime.
import type { ReactElement } from 'react';

import { Icon } from '#src/icons/icon/index.tsx';
import type { IconSize } from '#src/icons/icon/index.tsx';
import { renderIconData } from '#src/icons/icon-data/index.ts';
import type { RenderedIcon } from '#src/icons/icon-data/index.ts';
import { glyphData } from '#src/shared/glyphs/glyph-data.ts';
import type { GlyphName } from '#src/shared/glyphs/glyph-data.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';

export type { GlyphName } from '#src/shared/glyphs/glyph-data.ts';

/**
 * Glyph of each intent, so that the meaning of a message never rests on its color alone: a circled exclamation for
 * errors, a triangle for warnings, a circled check for success, a star for the brand and a circled `i` otherwise.
 */
export const intentGlyphs: Readonly<Record<SemanticIntent, GlyphName>> = {
	official: 'star',
	default: 'info',
	success: 'checkCircle',
	warning: 'warning',
	error: 'alert',
	info: 'info',
};

interface GlyphProps {
	name: GlyphName;
	size?: IconSize;
}

export const Glyph = ({ name, size = 'inherit' }: GlyphProps): ReactElement => {
	const rendered: RenderedIcon = renderIconData(glyphData[name]);

	return (
		<Icon decorative size={size} viewBox={rendered.viewBox}>
			<g dangerouslySetInnerHTML={{ __html: rendered.body }} />
		</Icon>
	);
};
