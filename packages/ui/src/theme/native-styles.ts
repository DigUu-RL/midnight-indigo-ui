// Styles for what the browser draws by itself (scrollbars, autofill) in the colors of the theme, shared by the
// components and the global baseline (`native-baseline.ts`). Every value is a `var(--mi-*)` reference, so the styles
// follow any palette given to `UiProvider`.
import type { CSSObject } from '@mui/material/styles';

import { themeVariables } from '#src/theme/theme-variables.ts';

const { radius, border }: typeof themeVariables = themeVariables;

/** Media query of the high contrast modes (Windows contrast themes), where the system colors replace the theme. */
export const forcedColorsMediaQuery: string = '(forced-colors: active)';

// Chromium 121+ and Firefox read `scrollbar-color`, and Chromium then ignores the `::-webkit-scrollbar` pseudo-elements,
// which remain for WebKit. The thumb is `border.default`, thin and discreet: an accepted exception of the contrast audit
// (`contrastExceptions`), since scrolling never depends on it; hovered, it lights up to `border.control`. The track shows
// the surface below it. In the high contrast modes `scrollbar-color` returns to `auto` and the system draws it again.
export const createScrollbarStyles = (track: string): CSSObject => {
	return {
		scrollbarWidth: 'thin',
		scrollbarColor: `${border.default} ${track}`,
		'&::-webkit-scrollbar': { width: '0.5rem', height: '0.5rem' },
		'&::-webkit-scrollbar-track': { backgroundColor: track },
		'&::-webkit-scrollbar-thumb': {
			border: '2px solid transparent',
			borderRadius: radius.pill,
			backgroundColor: border.default,
			backgroundClip: 'padding-box',
		},
		'&::-webkit-scrollbar-thumb:hover': { backgroundColor: border.control },
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
 * No visible scrollbar, for a row that scrolls sideways and shows by itself that it continues, such as a row of tabs:
 * it still scrolls by touch, trackpad, wheel and keyboard focus. The high contrast modes give the system scrollbar back.
 */
export const hiddenScrollbarStyles: CSSObject = {
	scrollbarWidth: 'none',
	'&::-webkit-scrollbar': { display: 'none' },
	[`@media ${forcedColorsMediaQuery}`]: { scrollbarWidth: 'auto' },
};

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
