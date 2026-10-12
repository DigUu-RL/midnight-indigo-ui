import type { CSSObject } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { responsiveStyles } from '#src/shared/responsive.ts';

const toWidth = (width: string): CSSObject => ({ width });

describe('responsiveStyles', (): void => {
	it('applies a single value at every width, without media queries', (): void => {
		expect(responsiveStyles('10rem', toWidth)).toEqual({ width: '10rem' });
	});

	it('applies compact without a media query and the other breakpoints from their width up', (): void => {
		expect(
			responsiveStyles({ compact: '100%', expanded: '50%', extraLarge: '25%' }, toWidth),
		).toEqual({
			width: '100%',
			'@media (min-width: 52.5em)': { width: '50%' },
			'@media (min-width: 100em)': { width: '25%' },
		});
	});

	it('orders the media queries from the narrowest, so the widest that matches wins', (): void => {
		const styles: CSSObject = responsiveStyles({ large: 'c', medium: 'b', compact: 'a' }, toWidth);

		expect(Object.keys(styles)).toEqual([
			'width',
			'@media (min-width: 37.5em)',
			'@media (min-width: 75em)',
		]);
	});

	it('leaves the styles out when there is no value', (): void => {
		expect(responsiveStyles(undefined, toWidth)).toEqual({});
		expect(responsiveStyles({}, toWidth)).toEqual({});
	});
});
