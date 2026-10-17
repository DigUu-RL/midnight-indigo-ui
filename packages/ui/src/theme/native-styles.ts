// What the browser draws by itself (scrollbars, selection, autofill, native controls, focus, text elements) in the
// colors of the theme. Every value is a `var(--mi-*)` reference, so the styles follow any palette given to `UiProvider`.
import type { CSSObject } from '@mui/material/styles';

import { stickyTopbarAttribute, topbarHeight } from '#src/shared/layout-metrics.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const {
	spacing,
	radius,
	surface,
	text,
	border,
	focus,
	accent,
	intent,
	fontFamily,
}: typeof themeVariables = themeVariables;

/** Media query of the high contrast modes (Windows contrast themes), where the system colors replace the theme. */
export const forcedColorsMediaQuery: string = '(forced-colors: active)';

// Smooth scrolling is motion: only users who expressed no preference get it.
const noMotionPreferenceMediaQuery: string = '(prefers-reduced-motion: no-preference)';

// Chromium 121+ and Firefox read `scrollbar-color`, and Chromium then ignores the `::-webkit-scrollbar` pseudo-elements,
// which remain for WebKit. The thumb is `border.strong`, which meets 3:1 on every surface; the track shows the surface
// below it. In the high contrast modes `scrollbar-color` returns to `auto` and the system draws the scrollbar again.
const createScrollbarStyles = (track: string): CSSObject => {
	return {
		scrollbarWidth: 'thin',
		scrollbarColor: `${border.strong} ${track}`,
		'&::-webkit-scrollbar': { width: '0.625rem', height: '0.625rem' },
		'&::-webkit-scrollbar-track': { backgroundColor: track },
		'&::-webkit-scrollbar-thumb': {
			border: '2px solid transparent',
			borderRadius: radius.pill,
			backgroundColor: border.strong,
			backgroundClip: 'padding-box',
		},
		'&::-webkit-scrollbar-thumb:hover': { backgroundColor: text.muted },
		'&::-webkit-scrollbar-corner': { backgroundColor: track },
		[`@media ${forcedColorsMediaQuery}`]: { scrollbarColor: 'auto' },
	};
};

/**
 * Scrollbars in the theme colors for a container that scrolls inside the page (a menu, a table, a drawer, a list):
 * spread it into the styles of that container. The track is transparent, so it works on any surface.
 */
export const scrollbarStyles: CSSObject = createScrollbarStyles('transparent');

/**
 * Keeps the colors of a field when the browser autofills it. Browsers paint an autofilled field with `!important`
 * declarations of their own (a light blue or yellow background, a dark text in Safari), which no style can override.
 * An inset shadow is painted above the background and `-webkit-text-fill-color` above the text color, so together they
 * restore the colors of the field. Spread it under `:autofill` and `:-webkit-autofill` (two rules: a browser that does
 * not know one selector drops the whole rule) with the background and the text color of a custom field.
 */
export const autofillStyles = (background: string, textColor: string): CSSObject => {
	return {
		boxShadow: `inset 0 0 0 100vmax ${background}`,
		WebkitTextFillColor: textColor,
		// Older Firefox tints the field with a filter instead.
		filter: 'none',
	};
};

// A native field outside the components keeps the system colors of a field in the dark color scheme.
const nativeFieldAutofillStyles: CSSObject = autofillStyles('Field', 'FieldText');

/**
 * Global styles of `UiProvider` with `baseline`. Element selectors are wrapped in `:where()`, whose specificity is
 * zero, so any class of a component or of the application wins over them; nothing resets margins or typography of
 * the content. The high contrast modes keep the system colors: nothing here sets `forced-color-adjust`.
 */
export const nativeBaselineStyles: CSSObject = {
	html: {
		colorScheme: 'dark',
		accentColor: intent.brand.main,
		caretColor: focus.ring,
		WebkitTapHighlightColor: 'transparent',
		WebkitTextSizeAdjust: '100%',
		textSizeAdjust: '100%',
		...createScrollbarStyles(surface.canvas),
	},
	// Anchored targets and focused elements scroll into view below the sticky top bar, on the pages that have one.
	[`:where(html:has([${stickyTopbarAttribute}]))`]: { scrollPaddingBlockStart: topbarHeight },
	[`@media ${noMotionPreferenceMediaQuery}`]: { html: { scrollBehavior: 'smooth' } },
	'::selection': { backgroundColor: accent.selection, color: accent.onSelection },
	':where(:focus-visible)': {
		outline: `${focus.width} solid ${focus.ring}`,
		outlineOffset: focus.offset,
	},
	':where(input, textarea)::placeholder': { color: text.muted, opacity: 1 },
	':where(input, textarea, select):-webkit-autofill': nativeFieldAutofillStyles,
	':where(input, textarea, select):autofill': nativeFieldAutofillStyles,
	':where(a)': { color: accent.link, textUnderlineOffset: '0.15em' },
	':where(a:hover)': { color: accent.linkHover },
	':where(hr)': {
		height: 0,
		border: 0,
		borderBlockStart: `1px solid ${border.default}`,
		color: 'inherit',
	},
	':where(code, kbd, pre, samp)': { fontFamily: fontFamily.mono },
	':where(kbd)': {
		paddingBlock: '0.1em',
		paddingInline: '0.4em',
		border: `1px solid ${border.default}`,
		borderBlockEndWidth: '2px',
		borderRadius: radius.small,
		backgroundColor: surface.raised,
		color: text.primary,
	},
	':where(mark)': {
		backgroundColor: intent.warning.container,
		color: intent.warning.onContainer,
	},
	':where(abbr[title])': {
		textDecoration: 'underline dotted',
		textUnderlineOffset: '0.15em',
		cursor: 'help',
	},
	':where(blockquote)': {
		paddingInlineStart: spacing[4],
		borderInlineStart: `${spacing[1]} solid ${border.default}`,
		color: text.secondary,
	},
	[`@media ${forcedColorsMediaQuery}`]: {
		'::selection': { backgroundColor: 'Highlight', color: 'HighlightText' },
		':where(:focus-visible)': { outlineColor: 'Highlight' },
		':where(mark)': { backgroundColor: 'Mark', color: 'MarkText' },
	},
};
