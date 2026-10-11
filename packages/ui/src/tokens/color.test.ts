import { describe, expect, it } from 'vitest';

import {
	contrastRatio,
	ensureContrast,
	formatContrastRatio,
	isHexColor,
	mixColors,
	normalizeHexColor,
	parseHexColor,
	pickHighestContrast,
	relativeLuminance,
} from '#src/tokens/color.ts';

describe('hex colors', (): void => {
	it('accepts #RGB and #RRGGBB only', (): void => {
		expect(['#F6C', '#ff6ac1', '#FF6AC1'].every(isHexColor)).toBe(true);
		expect(['FF6AC1', '#FF6AC', '#FF6AC1AA', 'pink', '#GGGGGG'].some(isHexColor)).toBe(false);
	});

	it('parses, expands and normalizes to uppercase #RRGGBB', (): void => {
		expect(parseHexColor('#FF6AC1')).toEqual({ red: 255, green: 106, blue: 193 });
		expect(normalizeHexColor('#f6c')).toBe('#FF66CC');
		expect(normalizeHexColor('#ff6ac1')).toBe('#FF6AC1');
	});

	it('explains why a color is invalid', (): void => {
		expect((): unknown => parseHexColor('rgb(1, 2, 3)')).toThrow(
			/Invalid color "rgb\(1, 2, 3\)": expected a hexadecimal/,
		);
	});
});

describe('mixColors', (): void => {
	it('returns each endpoint at weight 1 and 0, and clamps the weight', (): void => {
		expect(mixColors('#FF6AC1', '#020108', 1)).toBe('#FF6AC1');
		expect(mixColors('#FF6AC1', '#020108', 0)).toBe('#020108');
		expect(mixColors('#FFFFFF', '#000000', 2)).toBe('#FFFFFF');
	});

	it('interpolates channels in sRGB', (): void => {
		expect(mixColors('#FFFFFF', '#000000', 0.5)).toBe('#808080');
	});
});

describe('WCAG contrast', (): void => {
	it('computes relative luminance and ratios at the extremes', (): void => {
		expect(relativeLuminance('#000000')).toBe(0);
		expect(relativeLuminance('#FFFFFF')).toBe(1);
		expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
		expect(contrastRatio('#FF6AC1', '#FF6AC1')).toBe(1);
	});

	it('is symmetric', (): void => {
		expect(contrastRatio('#FF6AC1', '#020108')).toBe(contrastRatio('#020108', '#FF6AC1'));
	});

	it('formats ratios truncated, never rounded up past a threshold', (): void => {
		expect(formatContrastRatio(4.4999)).toBe('4.49:1');
		expect(formatContrastRatio(21)).toBe('21.00:1');
	});
});

describe('ensureContrast', (): void => {
	it('keeps a color that already meets the minimum', (): void => {
		expect(ensureContrast('#FF6AC1', '#020108', 4.5, '#FFFFFF')).toBe('#FF6AC1');
	});

	it('moves toward the target until the minimum is met, deterministically', (): void => {
		const adjusted: string = ensureContrast('#3A2A5E', '#020108', 4.5, '#FFFFFF');

		expect(contrastRatio(adjusted, '#020108')).toBeGreaterThanOrEqual(4.5);
		expect(ensureContrast('#3A2A5E', '#020108', 4.5, '#FFFFFF')).toBe(adjusted);
	});

	it('falls back to the target when no step is enough', (): void => {
		expect(ensureContrast('#777777', '#777777', 21, '#FFFFFF')).toBe('#FFFFFF');
	});
});

describe('pickHighestContrast', (): void => {
	it('picks the candidate with the highest ratio', (): void => {
		expect(pickHighestContrast('#FF6AC1', ['#FFFFFF', '#020108'])).toBe('#020108');
		expect(pickHighestContrast('#020108', ['#020108', '#F2EFFC'])).toBe('#F2EFFC');
	});
});
