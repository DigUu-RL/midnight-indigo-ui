import type { CSSObject } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { topbarHeight } from '#src/shared/layout-metrics.ts';
import {
	autofillStyles,
	forcedColorsMediaQuery,
	nativeBaselineStyles,
	scrollbarStyles,
} from '#src/theme/native-styles.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { border, focus, accent, text, surface, intent }: typeof themeVariables = themeVariables;

const ruleOf = (styles: CSSObject, selector: string): CSSObject => {
	return styles[selector] as CSSObject;
};

describe('scrollbarStyles', (): void => {
	it('colors the scrollbar of Chromium and Firefox with the theme', (): void => {
		expect(scrollbarStyles).toMatchObject({
			scrollbarWidth: 'thin',
			scrollbarColor: `${border.strong} transparent`,
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

		expect(ruleOf(scrollbarStyles, '&::-webkit-scrollbar-thumb')).toMatchObject({
			backgroundColor: border.strong,
		});

		expect(ruleOf(scrollbarStyles, '&::-webkit-scrollbar-thumb:hover')).toEqual({
			backgroundColor: text.muted,
		});
	});

	it('gives the scrollbar back to the system in the high contrast modes', (): void => {
		expect(ruleOf(scrollbarStyles, `@media ${forcedColorsMediaQuery}`)).toEqual({
			scrollbarColor: 'auto',
		});
	});
});

describe('autofillStyles', (): void => {
	it('paints the given background above the one of the browser, and the given text color', (): void => {
		expect(autofillStyles(surface.sunken, text.primary)).toEqual({
			boxShadow: `inset 0 0 0 100vmax ${surface.sunken}`,
			WebkitTextFillColor: text.primary,
			filter: 'none',
		});
	});
});

describe('nativeBaselineStyles', (): void => {
	const html: CSSObject = ruleOf(nativeBaselineStyles, 'html');

	it('renders native controls in the dark color scheme, with the theme accent and caret', (): void => {
		expect(html).toMatchObject({
			colorScheme: 'dark',
			accentColor: intent.official.main,
			caretColor: focus.ring,
		});
	});

	it('colors the page scrollbar on the canvas', (): void => {
		expect(html).toMatchObject({
			scrollbarWidth: 'thin',
			scrollbarColor: `${border.strong} ${surface.canvas}`,
		});
	});

	it('keeps anchored targets below the top bar and scrolls smoothly only without a motion preference', (): void => {
		expect(html.scrollPaddingBlockStart).toBeUndefined();
		expect(html.scrollBehavior).toBeUndefined();

		expect(nativeBaselineStyles[':where(html:has([data-mi-sticky-topbar]))']).toEqual({
			scrollPaddingBlockStart: topbarHeight,
		});

		expect(nativeBaselineStyles['@media (prefers-reduced-motion: no-preference)']).toEqual({
			html: { scrollBehavior: 'smooth' },
		});
	});

	it('removes the tap highlight and the automatic text inflation of mobile browsers', (): void => {
		expect(html).toMatchObject({
			WebkitTapHighlightColor: 'transparent',
			WebkitTextSizeAdjust: '100%',
			textSizeAdjust: '100%',
		});
	});

	it('colors the selection with the audited selection pair', (): void => {
		expect(ruleOf(nativeBaselineStyles, '::selection')).toEqual({
			backgroundColor: accent.selection,
			color: accent.onSelection,
		});
	});

	it('draws the focus ring of the theme on native elements', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(:focus-visible)')).toEqual({
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: focus.offset,
		});
	});

	it('keeps the system colors of a native field when it is autofilled', (): void => {
		const selectors: string[] = [
			':where(input, textarea, select):-webkit-autofill',
			':where(input, textarea, select):autofill',
		];

		selectors.forEach((selector: string): void => {
			expect(ruleOf(nativeBaselineStyles, selector)).toEqual(autofillStyles('Field', 'FieldText'));
		});
	});

	it('styles the placeholder and the native text elements', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(input, textarea)::placeholder')).toEqual({
			color: text.muted,
			opacity: 1,
		});

		expect(ruleOf(nativeBaselineStyles, ':where(a)').color).toBe(accent.link);
		expect(ruleOf(nativeBaselineStyles, ':where(a:hover)').color).toBe(accent.linkHover);

		[
			':where(hr)',
			':where(kbd)',
			':where(mark)',
			':where(abbr[title])',
			':where(blockquote)',
		].forEach((selector: string): void => {
			expect(nativeBaselineStyles[selector]).toBeDefined();
		});
	});

	// A class of a component or of the application must always win, and the content keeps its margins and typography.
	it('has zero specificity on elements and resets no margin nor font size of the content', (): void => {
		const selectors: string[] = Object.keys(nativeBaselineStyles).filter(
			(selector: string): boolean => {
				return !selector.startsWith('@') && selector !== 'html' && selector !== '::selection';
			},
		);

		selectors.forEach((selector: string): void => {
			expect(selector).toMatch(/^:where\(/);
		});

		const serialized: string = JSON.stringify(nativeBaselineStyles);
		expect(serialized).not.toMatch(/"margin|"lineHeight"|forcedColorAdjust/);
	});

	it('uses the system colors in the high contrast modes', (): void => {
		expect(nativeBaselineStyles[`@media ${forcedColorsMediaQuery}`]).toEqual({
			'::selection': { backgroundColor: 'Highlight', color: 'HighlightText' },
			':where(:focus-visible)': { outlineColor: 'Highlight' },
			':where(mark)': { backgroundColor: 'Mark', color: 'MarkText' },
		});
	});
});
