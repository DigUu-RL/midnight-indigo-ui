// The global baseline of `UiProvider`: what the browser draws by itself (scrollbars, selection, autofill, native
// controls, focus, text and structural elements) in the colors of the theme. Colors are `var(--mi-*)` references, so
// the styles follow any palette given to `UiProvider`; only the glyphs drawn as images and the backdrop of a dialog,
// where a custom property cannot reach, are resolved from the theme given to `createNativeBaselineStyles`. A module of
// its own, so that the components, which share `native-styles.ts`, never load the theme factory with it.
import type { CSSObject } from '@mui/material/styles';

import type { IconifyIconData } from '@/src/icons/icon-data/index';
import { glyphData } from '@/src/shared/glyphs/glyph-data';
import type { GlyphName } from '@/src/shared/glyphs/glyph-data';
import { stickyTopbarAttribute, topbarHeight } from '@/src/shared/layout-metrics';
import { defaultUiTheme } from '@/src/theme/create-ui-theme';
import type { UiTheme } from '@/src/theme/create-ui-theme';
import {
	autofillStyles,
	createScrollbarStyles,
	forcedColorsMediaQuery,
	scrollbarStyles,
} from '@/src/theme/native-styles';
import { themeVariables } from '@/src/theme/theme-variables';
import type { DesignTokens } from '@/src/tokens/index';

const {
	spacing,
	radius,
	surface,
	text,
	border,
	focus,
	accent,
	state,
	intent,
	controlHeight,
	elevation,
	motion,
	fontFamily,
	fontWeight,
	typography,
	iconSize,
}: typeof themeVariables = themeVariables;

// Smooth scrolling is motion: only users who expressed no preference get it.
const noMotionPreferenceMediaQuery: string = '(prefers-reduced-motion: no-preference)';

// A native field outside the components has no background of its own, so the autofill paints the field of the theme.
const nativeFieldAutofillStyles: CSSObject = autofillStyles(surface.field, text.primary);

/**
 * Native controls reset to the theme: no appearance, font, color, background or border of the browser. Checkboxes,
 * radios, ranges and color pickers are then drawn by the theme.
 */
export const nativeControlSelector: string = ':where(button, input, select, textarea)';

/**
 * A glyph of the components as a CSS image, in a resolved color: an image cannot read a custom property, so the color
 * comes from the theme. Used where the browser offers no pseudo-element to draw into (the chevron of a `select`, the
 * check of a checkbox) and on the pseudo-elements of the browser that only take an image.
 */
export const glyphImage = (name: GlyphName, color: string): string => {
	// The glyphs are whole Tabler icons, without offset nor transformation, so their box is their viewBox.
	const glyph: IconifyIconData = glyphData[name];
	const viewBox: string = `0 0 ${String(glyph.width ?? 24)} ${String(glyph.height ?? 24)}`;
	const markup: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" color="${color}">${glyph.body}</svg>`;

	return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;
};

// A vendor pseudo-element unknown to an engine invalidates the whole selector list, so each one has a rule of its own.
const rangeTrackSelectors: string[] = [
	':where(input[type="range"])::-webkit-slider-runnable-track',
	':where(input[type="range"])::-moz-range-track',
];

const rangeThumbSelectors: string[] = [
	':where(input[type="range"])::-webkit-slider-thumb',
	':where(input[type="range"])::-moz-range-thumb',
];

const disabledRangeThumbSelectors: string[] = [
	':where(input[type="range"]:disabled)::-webkit-slider-thumb',
	':where(input[type="range"]:disabled)::-moz-range-thumb',
];

const colorSwatchSelectors: string[] = [
	':where(input[type="color"])::-webkit-color-swatch',
	':where(input[type="color"])::-moz-color-swatch',
];

const progressValueSelectors: string[] = [
	':where(progress)::-webkit-progress-value',
	':where(progress)::-moz-progress-bar',
];

const indeterminateProgressValueSelectors: string[] = [
	':where(progress:indeterminate)::-webkit-progress-value',
	':where(progress:indeterminate)::-moz-progress-bar',
];

// Chromium and WebKit name the value of a meter after its region; Firefox matches the region on the meter itself.
const meterRegions: readonly [string, string, string][] = [
	['::-webkit-meter-optimum-value', ':-moz-meter-optimum', intent.success.main],
	['::-webkit-meter-suboptimum-value', ':-moz-meter-sub-optimum', intent.warning.main],
	['::-webkit-meter-even-less-good-value', ':-moz-meter-sub-sub-optimum', intent.error.main],
];

// The parts the browser draws inside a control, given back to it in the high contrast modes.
const controlPartSelectors: string[] = [
	...rangeTrackSelectors,
	...rangeThumbSelectors,
	':where(input[type="range"])::-moz-range-progress',
	':where(input[type="color"])::-webkit-color-swatch-wrapper',
	...colorSwatchSelectors,
	':where(input)::-webkit-calendar-picker-indicator',
	':where(input[list])::-webkit-calendar-picker-indicator',
	':where(input[type="search"])::-webkit-search-cancel-button',
	':where(input)::-webkit-inner-spin-button',
	':where(input)::-webkit-outer-spin-button',
	':where(input)::file-selector-button',
	':where(progress)::-webkit-progress-bar',
	...progressValueSelectors,
	':where(meter)::-webkit-meter-bar',
	...meterRegions.map(
		([webkitValue]: [string, string, string]): string => `:where(meter)${webkitValue}`,
	),
	':where(meter)::-moz-meter-bar',
	':where(summary)::-webkit-details-marker',
];

const ruleForEach = (selectors: string[], rule: CSSObject): CSSObject => {
	return Object.fromEntries(
		selectors.map((selector: string): [string, CSSObject] => [selector, rule]),
	);
};

// Gives an element back to the browser in the high contrast modes, where its theme colors would be replaced.
const revertedRule: CSSObject = { all: 'revert' };

// The thin bar shared by ranges, progress bars and meters.
const barHeight: string = spacing[2];

const indeterminateProgressAnimation: string = 'midnight-indigo-indeterminate-progress';

type BaselineGlyph =
	| 'chevron'
	| 'disabledChevron'
	| 'summaryChevron'
	| 'check'
	| 'indeterminate'
	| 'disabledCheck'
	| 'calendar'
	| 'clock'
	| 'clear';

/**
 * Global styles of `UiProvider` with `baseline`, for a theme. The tokens of the theme come before any default of the
 * browser, and element selectors are wrapped in `:where()`, whose specificity is zero, so any class of a component or of
 * the application wins over them; nothing resets margins or typography of the content. The high contrast modes keep the
 * system colors: nothing here sets `forced-color-adjust`, and native controls get their system look back.
 */
export const createNativeBaselineStyles = (theme: UiTheme = defaultUiTheme): CSSObject => {
	const tokens: Readonly<DesignTokens> = theme.tokens;

	const glyphs: Readonly<Record<BaselineGlyph, string>> = {
		chevron: glyphImage('chevronDown', tokens.text.muted),
		disabledChevron: glyphImage('chevronDown', tokens.text.disabled),
		summaryChevron: glyphImage('chevronRight', tokens.text.muted),
		check: glyphImage('check', tokens.intent.brand.contrastText),
		indeterminate: glyphImage('minus', tokens.intent.brand.contrastText),
		disabledCheck: glyphImage('check', tokens.text.disabled),
		calendar: glyphImage('calendar', tokens.text.muted),
		clock: glyphImage('clock', tokens.text.muted),
		clear: glyphImage('close', tokens.text.muted),
	};

	return {
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
		[`@media ${noMotionPreferenceMediaQuery}`]: {
			html: { scrollBehavior: 'smooth' },
			':where(progress:indeterminate)': {
				animation: `${indeterminateProgressAnimation} 1.4s ${motion.easing.standard} infinite`,
			},
			':where(summary)::before': {
				transition: `transform ${motion.duration.fast} ${motion.easing.standard}`,
			},
		},
		'::selection': { backgroundColor: accent.selection, color: accent.onSelection },
		':where(:focus-visible)': {
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: focus.offset,
		},

		// Controls.
		[nativeControlSelector]: {
			appearance: 'none',
			font: 'inherit',
			letterSpacing: 'inherit',
			color: 'inherit',
			background: 'transparent',
			border: 0,
		},
		// The reset drops the disabled look of the browser, so the theme gives it back.
		':where(button:disabled, input:disabled, select:disabled, textarea:disabled)': {
			color: text.disabled,
			cursor: 'not-allowed',
		},
		// Below 4.5:1 on purpose: an accepted exception of the contrast audit, since the placeholder is only an example.
		':where(input, textarea)::placeholder': { color: text.placeholder, opacity: 1 },
		':where(input, textarea, select):-webkit-autofill': nativeFieldAutofillStyles,
		':where(input, textarea, select):autofill': nativeFieldAutofillStyles,
		':where(select:not([multiple], [size]:not([size="1"])))': {
			paddingInlineEnd: `calc(${iconSize.small} + ${spacing[2]})`,
			backgroundImage: glyphs.chevron,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'right center',
			backgroundSize: iconSize.small,
		},
		':where(select:not([multiple], [size]:not([size="1"])):dir(rtl))': {
			backgroundPosition: 'left center',
		},
		':where(select:not([multiple], [size]:not([size="1"])):disabled)': {
			backgroundImage: glyphs.disabledChevron,
		},
		':where(option, optgroup)': { backgroundColor: surface.overlay, color: text.primary },
		':where(input[type="checkbox"], input[type="radio"])': {
			flexShrink: 0,
			inlineSize: iconSize.small,
			blockSize: iconSize.small,
			verticalAlign: 'middle',
			border: `1.5px solid ${border.control}`,
			borderRadius: radius.checkbox,
			backgroundColor: surface.field,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundSize: '0.75rem',
			cursor: 'pointer',
		},
		':where(input[type="radio"])': { borderRadius: radius.pill },
		':where(input[type="checkbox"], input[type="radio"]):where(:hover:not(:disabled))': {
			borderColor: intent.brand.border,
		},
		':where(input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate, input[type="radio"]:checked)':
			{
				borderColor: intent.brand.main,
				backgroundColor: intent.brand.main,
			},
		':where(input[type="checkbox"]:checked)': { backgroundImage: glyphs.check },
		':where(input[type="checkbox"]:indeterminate)': { backgroundImage: glyphs.indeterminate },
		':where(input[type="radio"]:checked)': {
			backgroundImage: `radial-gradient(circle closest-side, ${intent.brand.contrastText} 0 40%, transparent calc(40% + 0.5px))`,
		},
		':where(input[type="checkbox"]:disabled, input[type="radio"]:disabled)': {
			borderColor: state.disabledBorder,
			backgroundColor: state.disabledSurface,
			cursor: 'not-allowed',
		},
		':where(input[type="checkbox"]:disabled:checked)': { backgroundImage: glyphs.disabledCheck },
		':where(input[type="radio"]:disabled:checked)': {
			backgroundImage: `radial-gradient(circle closest-side, ${text.disabled} 0 40%, transparent calc(40% + 0.5px))`,
		},
		// The track is as tall as the thumb, which needs no offset to sit in its middle; the bar is drawn in the middle.
		':where(input[type="range"])': { blockSize: iconSize.small, cursor: 'pointer' },
		':where(input[type="range"]:disabled)': { cursor: 'not-allowed' },
		...ruleForEach(rangeTrackSelectors, {
			blockSize: iconSize.small,
			border: 0,
			background: `linear-gradient(${border.default}, ${border.default}) center / 100% ${barHeight} no-repeat`,
		}),
		':where(input[type="range"])::-moz-range-progress': {
			blockSize: barHeight,
			borderRadius: radius.pill,
			backgroundColor: intent.brand.main,
		},
		...ruleForEach(rangeThumbSelectors, {
			appearance: 'none',
			boxSizing: 'border-box',
			inlineSize: iconSize.small,
			blockSize: iconSize.small,
			border: `2px solid ${surface.field}`,
			borderRadius: radius.pill,
			backgroundColor: intent.brand.main,
		}),
		...ruleForEach(disabledRangeThumbSelectors, { backgroundColor: text.disabled }),
		':where(input[type="range"]:disabled)::-moz-range-progress': { backgroundColor: text.disabled },
		':where(input[type="color"])': {
			boxSizing: 'border-box',
			inlineSize: controlHeight.small,
			blockSize: controlHeight.small,
			padding: spacing[1],
			border: `1px solid ${border.control}`,
			borderRadius: radius.control,
			backgroundColor: surface.field,
			cursor: 'pointer',
		},
		':where(input[type="color"])::-webkit-color-swatch-wrapper': { padding: 0 },
		...ruleForEach(colorSwatchSelectors, { border: 0, borderRadius: radius.checkbox }),
		// The indicator stays where it was, so a click on it still opens the picker of the browser.
		':where(input)::-webkit-calendar-picker-indicator': {
			inlineSize: iconSize.small,
			blockSize: iconSize.small,
			padding: 0,
			background: `${glyphs.calendar} center / contain no-repeat`,
			opacity: 1,
			cursor: 'pointer',
		},
		':where(input[type="time"])::-webkit-calendar-picker-indicator': {
			backgroundImage: glyphs.clock,
		},
		// Chromium draws the button that opens the suggestions of a `datalist` on the same indicator, with an arrow of its own
		// in the text color: a transparent color hides the arrow, the image draws the chevron of the theme.
		':where(input[list])::-webkit-calendar-picker-indicator': {
			color: 'transparent',
			backgroundImage: glyphs.chevron,
		},
		':where(input:disabled)::-webkit-calendar-picker-indicator': {
			opacity: 0.4,
			cursor: 'not-allowed',
		},
		// The browser still decides when the button that clears a search field shows; the theme only draws it.
		':where(input[type="search"])::-webkit-search-cancel-button': {
			appearance: 'none',
			inlineSize: iconSize.small,
			blockSize: iconSize.small,
			background: `${glyphs.clear} center / contain no-repeat`,
			cursor: 'pointer',
		},
		':where(input)::-webkit-inner-spin-button': { display: 'none' },
		':where(input)::-webkit-outer-spin-button': { display: 'none' },
		// Firefox draws the spin buttons inside the field unless it has the appearance of a plain text field.
		':where(input[type="number"])': { MozAppearance: 'textfield' },
		':where(input)::file-selector-button': {
			blockSize: controlHeight.small,
			marginInlineEnd: spacing[3],
			paddingInline: spacing[3],
			border: `1px solid ${border.control}`,
			borderRadius: radius.control,
			backgroundColor: surface.raised,
			color: text.primary,
			font: 'inherit',
			fontWeight: fontWeight.medium,
			cursor: 'pointer',
		},
		':where(input:enabled)::file-selector-button:hover': { backgroundColor: state.hover },
		':where(input:disabled)::file-selector-button': {
			borderColor: state.disabledBorder,
			backgroundColor: state.disabledSurface,
			color: text.disabled,
			cursor: 'not-allowed',
		},
		':where(progress, meter)': {
			appearance: 'none',
			blockSize: barHeight,
			border: 0,
			borderRadius: radius.pill,
			overflow: 'hidden',
			// The shorthand also drops the gradient Firefox paints on a meter without appearance.
			background: border.subtle,
			verticalAlign: 'middle',
		},
		':where(progress)::-webkit-progress-bar': { backgroundColor: 'transparent' },
		...ruleForEach(progressValueSelectors, {
			borderRadius: radius.pill,
			backgroundColor: intent.brand.main,
		}),
		// Without a value there is nothing to fill: a segment of the bar runs across it (still, with reduced motion).
		':where(progress:indeterminate)': {
			backgroundImage: `linear-gradient(${intent.brand.main}, ${intent.brand.main})`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundSize: '40% 100%',
		},
		...ruleForEach(indeterminateProgressValueSelectors, { backgroundColor: 'transparent' }),
		[`@keyframes ${indeterminateProgressAnimation}`]: {
			from: { backgroundPosition: '-100% 0' },
			to: { backgroundPosition: '200% 0' },
		},
		':where(meter)::-webkit-meter-bar': {
			blockSize: barHeight,
			border: 0,
			borderRadius: radius.pill,
			background: border.subtle,
		},
		...Object.fromEntries(
			meterRegions.map(([webkitValue, , color]: [string, string, string]): [string, CSSObject] => {
				return [`:where(meter)${webkitValue}`, { borderRadius: radius.pill, background: color }];
			}),
		),
		':where(meter)::-moz-meter-bar': { borderRadius: radius.pill },
		...Object.fromEntries(
			meterRegions.map(([, mozRegion, color]: [string, string, string]): [string, CSSObject] => {
				return [`:where(meter${mozRegion})::-moz-meter-bar`, { background: color }];
			}),
		),
		':where(fieldset)': {
			minInlineSize: 0,
			paddingBlock: spacing[4],
			paddingInline: spacing[5],
			border: `1px solid ${border.subtle}`,
			borderRadius: radius.card,
		},
		':where(legend)': {
			paddingInline: spacing[2],
			fontSize: typography.label.fontSize,
			fontWeight: fontWeight.semibold,
			color: text.primary,
		},

		// Disclosure and dialog.
		':where(summary)': {
			display: 'flex',
			alignItems: 'center',
			gap: spacing[2],
			listStyle: 'none',
			fontWeight: fontWeight.medium,
			color: text.primary,
			cursor: 'pointer',
		},
		':where(summary)::-webkit-details-marker': { display: 'none' },
		':where(summary)::before': {
			content: '""',
			flexShrink: 0,
			inlineSize: iconSize.small,
			blockSize: iconSize.small,
			background: `${glyphs.summaryChevron} center / contain no-repeat`,
		},
		':where(summary:dir(rtl))::before': { transform: 'scaleX(-1)' },
		':where(details[open] > summary)::before': { transform: 'rotate(90deg)' },
		':where(dialog)': {
			padding: spacing[6],
			border: `1px solid ${border.subtle}`,
			borderRadius: radius.dialog,
			backgroundColor: surface.dialog,
			color: text.primary,
			boxShadow: elevation.dialog,
		},
		// Older engines do not let `::backdrop` inherit the custom properties, so its values are resolved.
		':where(dialog)::backdrop': {
			backgroundColor: tokens.backdrop.scrim,
			backdropFilter: `blur(${tokens.backdrop.blur})`,
		},

		// Text elements.
		':where(a)': { color: accent.link, textUnderlineOffset: '0.15em' },
		':where(a:hover)': { color: accent.linkHover },
		':where(hr)': {
			height: 0,
			border: 0,
			borderBlockStart: `1px solid ${border.default}`,
			color: 'inherit',
		},
		':where(h1, h2, h3, h4, h5, h6, p)': { textWrap: 'pretty' },
		':where(code, kbd, pre, samp)': {
			fontFamily: fontFamily.mono,
			fontVariantNumeric: 'tabular-nums',
		},
		':where(code, kbd, samp)': { fontSize: typography.code.fontSize },
		':where(code)': {
			paddingBlock: '0.1em',
			paddingInline: '0.35em',
			borderRadius: radius.controlSmall,
			backgroundColor: surface.overlay,
			color: text.primary,
		},
		':where(kbd)': {
			paddingBlock: '0.1em',
			paddingInline: '0.4em',
			border: `1px solid ${border.default}`,
			borderBlockEndWidth: '2px',
			borderRadius: radius.controlSmall,
			backgroundColor: surface.raised,
			color: text.primary,
			fontWeight: fontWeight.medium,
		},
		':where(pre)': {
			...scrollbarStyles,
			overflow: 'auto',
			padding: spacing[4],
			border: `1px solid ${border.subtle}`,
			borderRadius: radius.control,
			backgroundColor: surface.field,
			color: text.primary,
			fontSize: typography.code.fontSize,
			tabSize: 2,
		},
		':where(pre code)': {
			padding: 0,
			borderRadius: radius.none,
			background: 'none',
			font: 'inherit',
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
			borderInlineStart: `${spacing[1]} solid ${border.strong}`,
			color: text.secondary,
		},
		':where(ul, ol)': { paddingInlineStart: spacing[6] },
		':where(li)::marker': { color: text.muted },
		':where(ol > li)::marker': { fontVariantNumeric: 'tabular-nums' },
		':where(dt)': { fontWeight: fontWeight.semibold, color: text.primary },
		':where(dd)': { color: text.secondary },

		// Tables: the rows are separated like the rows of `Table`.
		':where(table)': { borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' },
		':where(caption)': {
			paddingBlock: spacing[2],
			fontWeight: fontWeight.medium,
			textAlign: 'start',
			color: text.primary,
		},
		':where(th, td)': {
			paddingBlock: spacing[3],
			paddingInline: spacing[4],
			textAlign: 'start',
			verticalAlign: 'middle',
		},
		':where(th)': { fontWeight: fontWeight.semibold, color: text.primary },
		':where(thead)': {
			borderBlockEnd: `1px solid ${border.default}`,
			backgroundColor: surface.tableHeader,
		},
		':where(thead th)': {
			fontSize: typography.overline.fontSize,
			fontWeight: typography.overline.fontWeight,
			letterSpacing: typography.overline.letterSpacing,
			textTransform: typography.overline.textTransform,
			color: text.muted,
		},
		':where(tbody > tr + tr, tfoot > tr)': { borderBlockStart: `1px solid ${border.subtle}` },

		[`@media ${forcedColorsMediaQuery}`]: {
			'::selection': { backgroundColor: 'Highlight', color: 'HighlightText' },
			':where(:focus-visible)': { outlineColor: 'Highlight' },
			':where(mark)': { backgroundColor: 'Mark', color: 'MarkText' },
			// Without the reset, the browser draws the boundaries of the controls in the system colors again.
			[nativeControlSelector]: { appearance: 'revert', background: 'revert', border: 'revert' },
			':where(button:disabled, input:disabled, select:disabled, textarea:disabled)': {
				color: 'GrayText',
			},
			':where(progress, meter)': revertedRule,
			...ruleForEach(controlPartSelectors, revertedRule),
			// The chevron of the theme is an image in a fixed color: the system marker takes its place.
			':where(summary)': { display: 'revert', listStyle: 'revert' },
			':where(summary)::before': { display: 'none' },
		},
	};
};

/** The global styles of `UiProvider` with `baseline`, for the official theme. */
export const nativeBaselineStyles: CSSObject = /* @__PURE__ */ createNativeBaselineStyles();
