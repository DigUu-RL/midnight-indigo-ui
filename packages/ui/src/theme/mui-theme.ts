// Adapter from the library theme to Material UI, which provides behavior (focus, keyboard, overlays) underneath.
import { createTheme } from '@mui/material/styles';
import type {
	CSSProperties,
	SimplePaletteColorOptions,
	Theme,
	TransitionsOptions,
	TypographyVariantsOptions,
} from '@mui/material/styles';

import { breakpoints } from '#src/tokens/index.ts';
import type { DesignTokens, IntentTokens } from '#src/tokens/index.ts';
import type { UiTheme } from '#src/theme/create-ui-theme.ts';

export interface MuiThemeOptions {
	/** Zeroes every Material UI transition and disables the ripple. `UiProvider` follows the user preference. */
	reducedMotion?: boolean;
}

const toPaletteColor = (intent: IntentTokens): SimplePaletteColorOptions => {
	return {
		main: intent.main,
		light: intent.light,
		dark: intent.dark,
		contrastText: intent.contrastText,
	};
};

// Headings and paragraphs avoid a single short word on their last line; `noWrap` still wins, since Material UI
// declares its `white-space` after the variant.
const prettyWrap: CSSProperties = { textWrap: 'pretty' };

const toTypography = (tokens: Readonly<DesignTokens>): TypographyVariantsOptions => {
	const { typography, fontFamily, fontWeight }: Readonly<DesignTokens> = tokens;

	return {
		fontFamily: fontFamily.sans,
		fontWeightRegular: fontWeight.regular,
		fontWeightMedium: fontWeight.medium,
		fontWeightBold: fontWeight.bold,
		h1: { ...typography.display, ...prettyWrap },
		h2: { ...typography.headingLarge, ...prettyWrap },
		h3: { ...typography.headingMedium, ...prettyWrap },
		h4: { ...typography.headingSmall, ...prettyWrap },
		h5: { ...typography.headingSmall, ...prettyWrap },
		h6: { ...typography.headingSmall, ...prettyWrap },
		subtitle1: { ...typography.body, fontWeight: fontWeight.medium, ...prettyWrap },
		subtitle2: { ...typography.label },
		body1: { ...typography.body, ...prettyWrap },
		body2: { ...typography.bodySmall, ...prettyWrap },
		button: { ...typography.label },
		caption: { ...typography.caption },
		overline: { ...typography.overline },
	};
};

const toMilliseconds = (duration: string): number => Number.parseFloat(duration);

const toTransitions = (
	tokens: Readonly<DesignTokens>,
	reducedMotion: boolean,
): TransitionsOptions => {
	const { duration, easing }: Readonly<DesignTokens>['motion'] = tokens.motion;
	const fast: number = reducedMotion ? 0 : toMilliseconds(duration.fast);
	const moderate: number = reducedMotion ? 0 : toMilliseconds(duration.moderate);
	const slow: number = reducedMotion ? 0 : toMilliseconds(duration.slow);

	return {
		duration: {
			shortest: fast,
			shorter: moderate,
			short: moderate,
			standard: slow,
			complex: slow,
			enteringScreen: moderate,
			leavingScreen: fast,
		},
		easing: {
			easeInOut: easing.standard,
			easeOut: easing.enter,
			easeIn: easing.exit,
			sharp: easing.standard,
		},
	};
};

/**
 * Material UI theme equivalent to `theme`. `UiProvider` applies it already; call it only to style Material UI
 * components that you render directly. `official` maps to `primary` and `default` to `secondary`.
 */
export const toMuiTheme = (
	theme: UiTheme,
	{ reducedMotion = false }: MuiThemeOptions = {},
): Theme => {
	const { intent, surface, text, border, state, radius, layer }: UiTheme['tokens'] = theme.tokens;

	return createTheme({
		palette: {
			mode: 'dark',
			primary: toPaletteColor(intent.official),
			secondary: toPaletteColor(intent.default),
			success: toPaletteColor(intent.success),
			warning: toPaletteColor(intent.warning),
			error: toPaletteColor(intent.error),
			info: toPaletteColor(intent.info),
			background: { default: surface.canvas, paper: surface.raised },
			text: { primary: text.primary, secondary: text.secondary, disabled: text.disabled },
			divider: border.default,
			action: {
				hover: state.hover,
				selected: state.selected,
				disabled: state.disabledText,
				disabledBackground: state.disabledSurface,
			},
		},
		shape: { borderRadius: Number.parseFloat(radius.medium) },
		typography: toTypography(theme.tokens),
		transitions: toTransitions(theme.tokens, reducedMotion),
		// `theme.breakpoints` and `useMediaQuery` of the application switch at the same widths as the library.
		breakpoints: {
			values: {
				xs: breakpoints.compact,
				sm: breakpoints.medium,
				md: breakpoints.expanded,
				lg: breakpoints.large,
				xl: breakpoints.extraLarge,
			},
		},
		// Material UI components rendered directly by the application stack like the library overlays.
		zIndex: {
			appBar: Number(layer.sticky),
			drawer: Number(layer.drawer),
			modal: Number(layer.dialog),
			snackbar: Number(layer.toast),
			tooltip: Number(layer.tooltip),
		},
		components: {
			// The ripple is a decorative animation with its own timing, outside the transition durations.
			MuiButtonBase: { defaultProps: { disableRipple: reducedMotion } },
		},
	});
};
