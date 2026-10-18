import type { CSSObject } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import {
	autofillStyles,
	forcedColorsMediaQuery,
	hiddenScrollbarStyles,
	scrollbarStyles,
} from '#src/theme/native-styles.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { border, text, surface }: typeof themeVariables = themeVariables;

const ruleOf = (styles: CSSObject, selector: string): CSSObject => {
	return styles[selector] as CSSObject;
};

describe('scrollbarStyles', (): void => {
	it('draws a thin scrollbar in Chromium and Firefox with the discreet thumb of the theme', (): void => {
		expect(scrollbarStyles).toMatchObject({
			scrollbarWidth: 'thin',
			scrollbarColor: `${border.default} transparent`,
		});
	});

	it('styles every WebKit scrollbar part: track, thumb, hovered thumb and corner', (): void => {
		expect(Object.keys(scrollbarStyles)).toEqual(
			expect.arrayContaining([
				'&::-webkit-scrollbar',
				'&::-webkit-scrollbar-track',
				'&::-webkit-scrollbar-thumb',
				'&::-webkit-scrollbar-thumb:hover',
				'&::-webkit-scrollbar-corner',
			]),
		);

		expect(ruleOf(scrollbarStyles, '&::-webkit-scrollbar')).toEqual({
			width: '0.5rem',
			height: '0.5rem',
		});

		expect(ruleOf(scrollbarStyles, '&::-webkit-scrollbar-thumb')).toMatchObject({
			backgroundColor: border.default,
		});

		expect(ruleOf(scrollbarStyles, '&::-webkit-scrollbar-thumb:hover')).toEqual({
			backgroundColor: border.control,
		});
	});

	it('gives the scrollbar back to the system in the high contrast modes', (): void => {
		expect(ruleOf(scrollbarStyles, `@media ${forcedColorsMediaQuery}`)).toEqual({
			scrollbarColor: 'auto',
		});
	});
});

describe('hiddenScrollbarStyles', (): void => {
	it('hides the scrollbar in every engine and gives it back in the high contrast modes', (): void => {
		expect(hiddenScrollbarStyles).toEqual({
			scrollbarWidth: 'none',
			'&::-webkit-scrollbar': { display: 'none' },
			[`@media ${forcedColorsMediaQuery}`]: { scrollbarWidth: 'auto' },
		});
	});
});

describe('autofillStyles', (): void => {
	it('paints the given background above the one of the browser, and the given text color', (): void => {
		expect(autofillStyles(surface.field, text.primary)).toEqual({
			boxShadow: `inset 0 0 0 100vmax ${surface.field}`,
			WebkitTextFillColor: text.primary,
			filter: 'none',
		});
	});
});
