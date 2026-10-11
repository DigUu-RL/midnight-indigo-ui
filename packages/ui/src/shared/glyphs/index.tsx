// Icons drawn by the components themselves. They are decorative: the control around them carries the name.
// Drawn for this library as simple strokes, so no icon set (decision D07) is needed to render a component.
import type { ReactElement } from 'react';

import { Icon } from '../../icons/icon.tsx';
import type { IconSize } from '../../icons/icon.tsx';

export type GlyphName = 'check' | 'chevronLeft' | 'chevronRight' | 'close';

const strokes: Record<GlyphName, string> = {
	check: 'M5 12.5l4.5 4.5L19 7.5',
	chevronLeft: 'M14.5 6l-6 6 6 6',
	chevronRight: 'M9.5 6l6 6-6 6',
	close: 'M7 7l10 10M17 7 7 17',
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
