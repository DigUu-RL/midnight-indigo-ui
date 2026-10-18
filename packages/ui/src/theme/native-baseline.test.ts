import type { CSSObject } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { topbarHeight } from '#src/shared/layout-metrics.ts';
import { createUiTheme } from '#src/theme/create-ui-theme.ts';
import type { UiTheme } from '#src/theme/create-ui-theme.ts';
import {
	createNativeBaselineStyles,
	glyphImage,
	nativeBaselineStyles,
	nativeControlSelector,
} from '#src/theme/native-baseline.ts';
import { autofillStyles, forcedColorsMediaQuery } from '#src/theme/native-styles.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { tokens } from '#src/tokens/index.ts';

const {
	border,
	focus,
	accent,
	text,
	surface,
	intent,
	radius,
	typography,
	fontFamily,
}: typeof themeVariables = themeVariables;

const ruleOf = (styles: CSSObject, selector: string): CSSObject => {
	return styles[selector] as CSSObject;
};

describe('nativeBaselineStyles', (): void => {
	const html: CSSObject = ruleOf(nativeBaselineStyles, 'html');

	it('renders native controls in the dark color scheme, with the theme accent and caret', (): void => {
		expect(html).toMatchObject({
			colorScheme: 'dark',
			accentColor: intent.brand.main,
			caretColor: focus.ring,
		});
	});

	it('colors the page scrollbar on the canvas', (): void => {
		expect(html).toMatchObject({
			scrollbarWidth: 'thin',
			scrollbarColor: `${border.default} ${surface.canvas}`,
		});
	});

	it('keeps anchored targets below the top bar and scrolls smoothly only without a motion preference', (): void => {
		expect(html.scrollPaddingBlockStart).toBeUndefined();
		expect(html.scrollBehavior).toBeUndefined();

		expect(nativeBaselineStyles[':where(html:has([data-mi-sticky-topbar]))']).toEqual({
			scrollPaddingBlockStart: topbarHeight,
		});

		expect(nativeBaselineStyles['@media (prefers-reduced-motion: no-preference)']).toMatchObject({
			html: { scrollBehavior: 'smooth' },
		});
	});

	it('moves the indeterminate progress bar and turns the disclosure chevron only without a motion preference', (): void => {
		const motion: CSSObject = ruleOf(
			nativeBaselineStyles,
			'@media (prefers-reduced-motion: no-preference)',
		);

		expect(Object.keys(motion)).toEqual([
			'html',
			':where(progress:indeterminate)',
			':where(summary)::before',
		]);

		expect(
			ruleOf(nativeBaselineStyles, ':where(progress:indeterminate)').animation,
		).toBeUndefined();

		expect(ruleOf(nativeBaselineStyles, ':where(summary)::before').transition).toBeUndefined();
	});

	it('removes the tap highlight and the automatic text inflation of mobile browsers', (): void => {
		expect(html).toMatchObject({
			WebkitTapHighlightColor: 'transparent',
			WebkitTextSizeAdjust: '100%',
			textSizeAdjust: '100%',
		});
	});

	it('resets the appearance, font, color, background and border of every native control', (): void => {
		expect(nativeControlSelector).toBe(':where(button, input, select, textarea)');

		expect(ruleOf(nativeBaselineStyles, nativeControlSelector)).toEqual({
			appearance: 'none',
			font: 'inherit',
			letterSpacing: 'inherit',
			color: 'inherit',
			background: 'transparent',
			border: 0,
		});
	});

	it('draws checkboxes and radios with the brand fill and the check glyph of the theme', (): void => {
		expect(
			ruleOf(nativeBaselineStyles, ':where(input[type="checkbox"], input[type="radio"])'),
		).toMatchObject({
			border: `1.5px solid ${border.control}`,
			backgroundColor: surface.field,
		});

		expect(
			ruleOf(
				nativeBaselineStyles,
				':where(input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate, input[type="radio"]:checked)',
			),
		).toEqual({ borderColor: intent.brand.main, backgroundColor: intent.brand.main });

		expect(ruleOf(nativeBaselineStyles, ':where(input[type="checkbox"]:checked)')).toEqual({
			backgroundImage: glyphImage('check', tokens.intent.brand.contrastText),
		});

		expect(ruleOf(nativeBaselineStyles, ':where(input[type="checkbox"]:indeterminate)')).toEqual({
			backgroundImage: glyphImage('minus', tokens.intent.brand.contrastText),
		});

		expect(ruleOf(nativeBaselineStyles, ':where(input[type="radio"])').borderRadius).toBe(
			radius.pill,
		);
	});

	it('draws the track and the thumb of a range in every engine', (): void => {
		[
			':where(input[type="range"])::-webkit-slider-runnable-track',
			':where(input[type="range"])::-moz-range-track',
			':where(input[type="range"])::-webkit-slider-thumb',
			':where(input[type="range"])::-moz-range-thumb',
			':where(input[type="range"])::-moz-range-progress',
		].forEach((selector: string): void => {
			expect(nativeBaselineStyles[selector], selector).toBeDefined();
		});

		expect(
			ruleOf(nativeBaselineStyles, ':where(input[type="range"])::-webkit-slider-thumb'),
		).toMatchObject({ appearance: 'none', backgroundColor: intent.brand.main });
	});

	it('draws the chevron of a single select in the muted text color, on the side where the line ends', (): void => {
		const select: string = ':where(select:not([multiple], [size]:not([size="1"])))';

		expect(ruleOf(nativeBaselineStyles, select)).toMatchObject({
			backgroundImage: glyphImage('chevronDown', tokens.text.muted),
			backgroundPosition: 'right center',
		});

		expect(
			ruleOf(
				nativeBaselineStyles,
				':where(select:not([multiple], [size]:not([size="1"])):dir(rtl))',
			),
		).toEqual({ backgroundPosition: 'left center' });
	});

	it('replaces the calendar and clock icons of date and time fields, keeping the indicator that opens the picker', (): void => {
		expect(
			ruleOf(nativeBaselineStyles, ':where(input)::-webkit-calendar-picker-indicator').background,
		).toBe(`${glyphImage('calendar', tokens.text.muted)} center / contain no-repeat`);

		expect(
			ruleOf(nativeBaselineStyles, ':where(input[type="time"])::-webkit-calendar-picker-indicator'),
		).toEqual({ backgroundImage: glyphImage('clock', tokens.text.muted) });
	});

	it('hides the spin buttons of number fields', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(input)::-webkit-inner-spin-button')).toEqual({
			display: 'none',
		});

		expect(ruleOf(nativeBaselineStyles, ':where(input)::-webkit-outer-spin-button')).toEqual({
			display: 'none',
		});

		expect(ruleOf(nativeBaselineStyles, ':where(input[type="number"])')).toEqual({
			MozAppearance: 'textfield',
		});
	});

	it('styles color pickers, file buttons, progress bars and meters with the theme', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(input)::file-selector-button')).toMatchObject({
			border: `1px solid ${border.control}`,
			backgroundColor: surface.raised,
			color: text.primary,
		});

		expect(ruleOf(nativeBaselineStyles, ':where(progress)::-moz-progress-bar')).toMatchObject({
			backgroundColor: intent.brand.main,
		});

		expect(
			ruleOf(nativeBaselineStyles, ':where(meter:-moz-meter-optimum)::-moz-meter-bar'),
		).toEqual({
			background: intent.success.main,
		});

		expect(
			ruleOf(nativeBaselineStyles, ':where(meter)::-webkit-meter-even-less-good-value').background,
		).toBe(intent.error.main);

		expect(nativeBaselineStyles[':where(input[type="color"])::-moz-color-swatch']).toBeDefined();
	});

	// A browser drops a whole selector list when it does not know one vendor pseudo-element of it.
	it('gives each vendor pseudo-element a rule of its own', (): void => {
		const selectors: string[] = Object.keys(nativeBaselineStyles).filter(
			(selector: string): boolean => /::?-(webkit|moz)-/.test(selector),
		);

		expect(selectors.length).toBeGreaterThan(0);

		selectors.forEach((selector: string): void => {
			expect(selector.replace(/\([^()]*(\([^()]*\))*[^()]*\)/g, '')).not.toContain(',');
		});
	});

	it('styles tables with caps headers and rows separated by the subtle border', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(thead th)')).toEqual({
			fontSize: typography.overline.fontSize,
			fontWeight: typography.overline.fontWeight,
			letterSpacing: typography.overline.letterSpacing,
			textTransform: typography.overline.textTransform,
			color: text.muted,
		});

		expect(tokens.typography.overline).toMatchObject({
			fontSize: '0.6875rem',
			fontWeight: '600',
			textTransform: 'uppercase',
		});

		expect(tokens.border.subtle).toBe('#1E1940');

		expect(ruleOf(nativeBaselineStyles, ':where(tbody > tr + tr, tfoot > tr)')).toEqual({
			borderBlockStart: `1px solid ${border.subtle}`,
		});
	});

	it('styles lists, definition lists, preformatted text, fieldsets and legends', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(li)::marker')).toEqual({ color: text.muted });

		expect(ruleOf(nativeBaselineStyles, ':where(pre)')).toMatchObject({
			overflow: 'auto',
			backgroundColor: surface.field,
			scrollbarColor: `${border.default} transparent`,
		});

		[':where(dt)', ':where(dd)', ':where(fieldset)', ':where(legend)'].forEach(
			(selector: string): void => {
				expect(nativeBaselineStyles[selector], selector).toBeDefined();
			},
		);
	});

	it('draws the disclosure chevron of the theme in place of the marker, turned when open', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(summary)')).toMatchObject({ listStyle: 'none' });

		expect(ruleOf(nativeBaselineStyles, ':where(summary)::-webkit-details-marker')).toEqual({
			display: 'none',
		});

		expect(ruleOf(nativeBaselineStyles, ':where(summary)::before').background).toBe(
			`${glyphImage('chevronRight', tokens.text.muted)} center / contain no-repeat`,
		);

		expect(ruleOf(nativeBaselineStyles, ':where(details[open] > summary)::before')).toEqual({
			transform: 'rotate(90deg)',
		});
	});

	it('dims the page behind a modal dialog with resolved values, which every engine can read', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(dialog)::backdrop')).toEqual({
			backgroundColor: tokens.backdrop.scrim,
			backdropFilter: `blur(${tokens.backdrop.blur})`,
		});

		expect(ruleOf(nativeBaselineStyles, ':where(dialog)')).toMatchObject({
			backgroundColor: surface.dialog,
			color: text.primary,
		});
	});

	it('colors the selection with the brand selection pair', (): void => {
		expect(tokens.accent.selection).toBe(tokens.intent.brand.containerPressed);

		expect(ruleOf(nativeBaselineStyles, '::selection')).toEqual({
			backgroundColor: accent.selection,
			color: accent.onSelection,
		});
	});

	it('draws the pink focus ring of the theme on native elements', (): void => {
		expect(tokens.focus.ring).toBe(tokens.intent.official.main);

		expect(ruleOf(nativeBaselineStyles, ':where(:focus-visible)')).toEqual({
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: focus.offset,
		});
	});

	it('paints the field of the theme on a native field when it is autofilled', (): void => {
		const selectors: string[] = [
			':where(input, textarea, select):-webkit-autofill',
			':where(input, textarea, select):autofill',
		];

		selectors.forEach((selector: string): void => {
			expect(ruleOf(nativeBaselineStyles, selector)).toEqual(
				autofillStyles(surface.field, text.primary),
			);
		});
	});

	it('styles the placeholder and the native text elements', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(input, textarea)::placeholder')).toEqual({
			color: text.placeholder,
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

	it('sets code in Geist Mono with tabular digits and wraps headings and paragraphs pretty', (): void => {
		expect(ruleOf(nativeBaselineStyles, ':where(code, kbd, pre, samp)')).toEqual({
			fontFamily: fontFamily.mono,
			fontVariantNumeric: 'tabular-nums',
		});

		expect(ruleOf(nativeBaselineStyles, ':where(h1, h2, h3, h4, h5, h6, p)')).toEqual({
			textWrap: 'pretty',
		});
	});

	// A class of a component or of the application must always win, and the content keeps its margins and typography.
	it('has zero specificity on elements and resets no margin nor line height of the content', (): void => {
		const selectors: string[] = Object.keys(nativeBaselineStyles).filter(
			(selector: string): boolean => {
				return !selector.startsWith('@') && selector !== 'html' && selector !== '::selection';
			},
		);

		selectors.forEach((selector: string): void => {
			expect(selector).toMatch(/^:where\(/);
		});

		// Only the parts the browser draws inside a control (the file button) set a margin of their own.
		const elementRules: string = JSON.stringify(
			selectors
				.filter((selector: string): boolean => !selector.includes('::'))
				.map((selector: string): unknown => nativeBaselineStyles[selector]),
		);

		expect(elementRules).not.toMatch(/"margin/);
		expect(JSON.stringify(nativeBaselineStyles)).not.toMatch(/"lineHeight"|forcedColorAdjust/);
	});

	it('uses the system colors and the system controls in the high contrast modes', (): void => {
		const forcedColors: CSSObject = ruleOf(
			nativeBaselineStyles,
			`@media ${forcedColorsMediaQuery}`,
		);

		expect(forcedColors).toMatchObject({
			'::selection': { backgroundColor: 'Highlight', color: 'HighlightText' },
			':where(:focus-visible)': { outlineColor: 'Highlight' },
			':where(mark)': { backgroundColor: 'Mark', color: 'MarkText' },
			[nativeControlSelector]: { appearance: 'revert', background: 'revert', border: 'revert' },
			':where(progress, meter)': { all: 'revert' },
			':where(summary)': { display: 'revert', listStyle: 'revert' },
			':where(summary)::before': { display: 'none' },
		});

		// Every part drawn by the theme inside a control goes back to the browser.
		[
			':where(input[type="range"])::-webkit-slider-runnable-track',
			':where(input[type="range"])::-moz-range-track',
			':where(input[type="range"])::-webkit-slider-thumb',
			':where(input[type="range"])::-moz-range-thumb',
			':where(input[type="range"])::-moz-range-progress',
			':where(input[type="color"])::-webkit-color-swatch',
			':where(input[type="color"])::-moz-color-swatch',
			':where(input)::-webkit-calendar-picker-indicator',
			':where(input)::file-selector-button',
			':where(progress)::-webkit-progress-value',
			':where(progress)::-moz-progress-bar',
			':where(meter)::-webkit-meter-bar',
			':where(meter)::-webkit-meter-optimum-value',
			':where(meter)::-moz-meter-bar',
		].forEach((selector: string): void => {
			expect(forcedColors[selector], selector).toEqual({ all: 'revert' });
		});
	});
});

describe('createNativeBaselineStyles', (): void => {
	it('draws the glyph images in the colors of the given theme', (): void => {
		const theme: UiTheme = createUiTheme(
			{ palette: { brand: { main: '#3D8BFF' } } },
			{ onWarning: (): void => undefined },
		);

		// A light brand color takes a dark check, unlike the official one.
		expect(theme.tokens.intent.brand.contrastText).not.toBe(tokens.intent.brand.contrastText);

		const styles: CSSObject = createNativeBaselineStyles(theme);

		expect(ruleOf(styles, ':where(input[type="checkbox"]:checked)')).toEqual({
			backgroundImage: glyphImage('check', theme.tokens.intent.brand.contrastText),
		});

		expect(createNativeBaselineStyles()).toEqual(nativeBaselineStyles);
	});
});

describe('glyphImage', (): void => {
	it('encodes a glyph as an SVG data URL whose current color is the given color', (): void => {
		const image: string = glyphImage('check', '#F2EFFC');

		expect(image).toMatch(/^url\("data:image\/svg\+xml,%3Csvg/);

		expect(decodeURIComponent(image)).toContain(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="#F2EFFC">',
		);
	});
});
