// Icons drawn by the components themselves. They are decorative: the control around them carries the name.
// Drawn for this library as simple strokes, so no icon set (decision D07) is needed to render a component.
import type { ReactElement } from 'react';

import { Icon } from '#src/icons/icon.tsx';
import type { IconSize } from '#src/icons/icon.tsx';
import type { SemanticIntent } from '#src/tokens/index.ts';

export type GlyphName =
	| 'alert'
	| 'check'
	| 'checkCircle'
	| 'chevronDown'
	| 'chevronLeft'
	| 'chevronRight'
	| 'close'
	| 'externalLink'
	| 'eye'
	| 'eyeOff'
	| 'info'
	| 'menu'
	| 'minus'
	| 'plus'
	| 'search'
	| 'star'
	| 'upload'
	| 'warning';

const eye: string =
	'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z';

const circle: string = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z';

const strokes: Record<GlyphName, string> = {
	alert: `${circle}M12 7.5v5.5M12 16.5v.01`,
	check: 'M5 12.5l4.5 4.5L19 7.5',
	checkCircle: `${circle}M8 12.5l2.75 2.75L16.5 9.5`,
	chevronDown: 'M6 9.5l6 6 6-6',
	chevronLeft: 'M14.5 6l-6 6 6 6',
	chevronRight: 'M9.5 6l6 6-6 6',
	close: 'M7 7l10 10M17 7 7 17',
	externalLink: 'M14 4h6v6M20 4l-9 9M18 14v5H5V6h5',
	eye,
	eyeOff: `${eye}M4 4l16 16`,
	info: `${circle}M12 11v5.5M12 7.5v.01`,
	menu: 'M4 7h16M4 12h16M4 17h16',
	minus: 'M5 12h14',
	plus: 'M12 5v14M5 12h14',
	search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20 20',
	star: 'M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85z',
	upload: 'M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v4h14v-4',
	warning: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.5v.01',
};

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
	return (
		<Icon
			decorative
			size={size}
			fill='none'
			stroke='currentColor'
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<path d={strokes[name]} />
		</Icon>
	);
};
