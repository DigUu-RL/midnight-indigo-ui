// The complete design token set: base groups plus intents derived from their sources. Dark-only by design.
import { translucent } from '@/src/tokens/color';
import type { HexColor } from '@/src/tokens/color';
import {
	brandMainColor,
	defaultIntentSources,
	deriveIntentPalette,
	officialMainColor,
} from '@/src/tokens/intents';
import type { IntentDerivationContext, IntentPalette, IntentSources } from '@/src/tokens/intents';
import { deriveSupportTokens, supportMainColors } from '@/src/tokens/support-colors';
import type { SupportTokens } from '@/src/tokens/support-colors';

/** Steps of the pink and indigo scales, from the lightest (`50`) to the darkest (`950`). */
export const colorScaleSteps = [
	'50',
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'800',
	'900',
	'950',
] as const;

export type ColorScaleStep = (typeof colorScaleSteps)[number];

/** Steps of the midnight scale, from the lightest (`50`) to the darkest (`850`), every 50. */
export const midnightScaleSteps = [
	'50',
	'100',
	'150',
	'200',
	'250',
	'300',
	'350',
	'400',
	'450',
	'500',
	'550',
	'600',
	'650',
	'700',
	'750',
	'800',
	'850',
] as const;

export type MidnightScaleStep = (typeof midnightScaleSteps)[number];

export type ColorScale = Record<ColorScaleStep, HexColor>;

export type MidnightScale = Record<MidnightScaleStep, HexColor>;

/** Fixed color scales of the project identity; the semantic groups take their values from them. */
export interface ColorTokens {
	pink: ColorScale;
	indigo: ColorScale;
	midnight: MidnightScale;
}

/** Background layers, declared from the darkest to the lightest. */
export interface SurfaceTokens {
	canvas: HexColor;
	field: HexColor;
	sidebar: HexColor;
	tableHeader: HexColor;
	raised: HexColor;
	dialog: HexColor;
	overlay: HexColor;
}

export interface TextTokens {
	primary: HexColor;
	secondary: HexColor;
	muted: HexColor;
	placeholder: HexColor;
	disabled: HexColor;
	inverse: HexColor;
}

export interface BorderTokens {
	subtle: HexColor;
	default: HexColor;
	strong: HexColor;
	control: HexColor;
}

/** Complete border lines, as values of the CSS `border` shorthand. */
export interface StrokeTokens {
	dashed: string;
}

export interface FocusTokens {
	ring: HexColor;
	width: string;
	offset: string;
}

export interface AccentTokens {
	link: HexColor;
	linkHover: HexColor;
	selection: HexColor;
	onSelection: HexColor;
}

export interface StateTokens {
	hover: HexColor;
	pressed: HexColor;
	selected: HexColor;
	disabledSurface: HexColor;
	disabledText: HexColor;
	disabledBorder: HexColor;
}

export interface ChartTokens {
	series: readonly HexColor[];
	grid: HexColor;
	axis: HexColor;
	label: HexColor;
	tooltipSurface: HexColor;
}

/** Corner radius by role: every element of a role takes the same radius, whatever its component. */
export interface RadiusTokens {
	none: string;
	checkbox: string;
	controlSmall: string;
	control: string;
	overlay: string;
	card: string;
	dialog: string;
	pill: string;
}

export type SpacingStep = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';

export type SpacingTokens = Record<SpacingStep, string>;

/** Heights of the controls: `small`, `medium` and `large` follow `ControlSize`, `field` is a medium text field. */
export interface ControlHeightTokens {
	small: string;
	medium: string;
	large: string;
	field: string;
}

/** Inner spacing of a card and the gap between the cards of a grid. */
export interface CardTokens {
	paddingBlock: string;
	paddingInline: string;
	gap: string;
	gridGap: string;
}

/** Sides of a tonal icon (a glyph on a tinted square), by where it appears. */
export interface TonalIconTokens {
	kpi: string;
	list: string;
	alert: string;
}

export interface ElevationTokens {
	none: string;
	card: string;
	overlay: string;
	dialog: string;
	official: string;
	brand: string;
}

/** Stacking order (`z-index`) of the layers above the page, from the lowest to the highest. */
export interface LayerTokens {
	base: string;
	sticky: string;
	drawer: string;
	dialog: string;
	popover: string;
	toast: string;
	tooltip: string;
}

export interface BackdropTokens {
	scrim: string;
	blur: string;
}

export interface MotionTokens {
	duration: {
		instant: string;
		fast: string;
		moderate: string;
		slow: string;
	};
	easing: {
		standard: string;
		enter: string;
		exit: string;
	};
}

export interface FontFamilyTokens {
	sans: string;
	mono: string;
}

export interface FontWeightTokens {
	regular: string;
	medium: string;
	semibold: string;
	bold: string;
}

/** Typographic roles, from the largest to the smallest, plus monospace code. */
export const typographyRoles = [
	'display',
	'headingLarge',
	'headingMedium',
	'headingSmall',
	'body',
	'bodySmall',
	'label',
	'caption',
	'overline',
	'code',
] as const;

export type TypographyRole = (typeof typographyRoles)[number];

/** Field names match the CSS properties, so a role can be spread into a style object. */
export interface TypographyStyle {
	fontFamily: string;
	fontSize: string;
	fontWeight: string;
	lineHeight: string;
	letterSpacing: string;
	textTransform: string;
}

export type TypographyTokens = Record<TypographyRole, TypographyStyle>;

export interface IconSizeTokens {
	small: string;
	medium: string;
	large: string;
}

export interface DesignTokens {
	color: ColorTokens;
	surface: SurfaceTokens;
	text: TextTokens;
	border: BorderTokens;
	stroke: StrokeTokens;
	focus: FocusTokens;
	accent: AccentTokens;
	state: StateTokens;
	intent: IntentPalette;
	support: SupportTokens;
	chart: ChartTokens;
	radius: RadiusTokens;
	spacing: SpacingTokens;
	controlHeight: ControlHeightTokens;
	card: CardTokens;
	elevation: ElevationTokens;
	layer: LayerTokens;
	backdrop: BackdropTokens;
	motion: MotionTokens;
	fontFamily: FontFamilyTokens;
	fontWeight: FontWeightTokens;
	typography: TypographyTokens;
	iconSize: IconSizeTokens;
	tonalIcon: TonalIconTokens;
}

// `400` is the official pink and `300` its hover. The lighter steps mix it with white, the darker ones with the
// darkest midnight.
export const pinkScale: Readonly<ColorScale> = {
	'50': '#FFF3FA',
	'100': '#FFE4F4',
	'200': '#FFCCEA',
	'300': '#FF93D0',
	'400': officialMainColor,
	'500': '#D258A1',
	'600': '#A54581',
	'700': '#783360',
	'800': '#502344',
	'900': '#32162E',
	'950': '#1E0E20',
};

// `500` is the solid indigo, `400` its hover and active border, `300` indigo text and icons.
export const indigoScale: Readonly<ColorScale> = {
	'50': '#F6F4FF',
	'100': '#EBE7FE',
	'200': '#D2CAFD',
	'300': '#8F7AFB',
	'400': '#7560F0',
	'500': brandMainColor,
	'600': '#4C3AAE',
	'700': '#3A2D86',
	'800': '#2A2162',
	'900': '#1E1746',
	'950': '#130F2E',
};

// Neutral with an indigo hue: every surface, border and state value of the v2 standard comes from this scale.
export const midnightScale: Readonly<MidnightScale> = {
	'50': '#F2EFFC',
	'100': '#C3BDDC',
	'150': '#ABA4C9',
	'200': '#9790B8',
	'250': '#6E62A3',
	'300': '#453C7A',
	'350': '#2C2558',
	'400': '#251C5C',
	'450': '#1E1940',
	'500': '#1B1638',
	'550': '#1B1540',
	'600': '#17132F',
	'650': '#13102B',
	'700': '#0F0C24',
	'750': '#0A0819',
	'800': '#080615',
	'850': '#05040E',
};

// Each layer is lighter than the one below it; the luminance steps are documented in tokens.md (`surfaceLayers`).
export const surfaceTokens: Readonly<SurfaceTokens> = {
	canvas: midnightScale['850'],
	field: midnightScale['800'],
	sidebar: midnightScale['750'],
	tableHeader: midnightScale['700'],
	raised: midnightScale['650'],
	dialog: midnightScale['600'],
	overlay: midnightScale['500'],
};

export const textTokens: Readonly<TextTokens> = {
	primary: '#F2EFFC',
	secondary: '#C3BDDC',
	muted: '#9790B8',
	// Below 4.5:1 on `field` by design: an accepted exception of the contrast audit (`contrastExceptions`).
	placeholder: midnightScale['250'],
	disabled: '#5E5880',
	inverse: surfaceTokens.canvas,
};

// `strong` is below 3:1 on the canvas, so the boundary of a control, which must meet it, is `control`.
export const borderTokens: Readonly<BorderTokens> = {
	subtle: midnightScale['450'],
	default: midnightScale['350'],
	strong: midnightScale['300'],
	control: midnightScale['250'],
};

export const strokeTokens: Readonly<StrokeTokens> = {
	dashed: `1px dashed ${borderTokens.strong}`,
};

// The official pink, like the main action: focus and the primary action share the color that draws the eye.
export const focusTokens: Readonly<FocusTokens> = {
	ring: officialMainColor,
	width: '2px',
	offset: '2px',
};

// Pressed sits between hover and selected, so each state is lighter than the previous one.
export const stateTokens: Readonly<StateTokens> = {
	hover: midnightScale['550'],
	pressed: midnightScale['450'],
	selected: midnightScale['400'],
	disabledSurface: '#0E0B1C',
	disabledText: textTokens.disabled,
	disabledBorder: '#2A2445',
};

// The larger the element, the rounder its corners: from the checkbox to the dialog.
export const radiusTokens: Readonly<RadiusTokens> = {
	none: '0',
	checkbox: '5px',
	controlSmall: '7px',
	control: '8px',
	overlay: '10px',
	card: '12px',
	dialog: '14px',
	pill: '9999px',
};

export const spacingTokens: Readonly<SpacingTokens> = {
	'0': '0',
	'1': '0.25rem',
	'2': '0.5rem',
	'3': '0.75rem',
	'4': '1rem',
	'5': '1.25rem',
	'6': '1.5rem',
	'8': '2rem',
	'10': '2.5rem',
	'12': '3rem',
	'16': '4rem',
};

// 32, 40, 48 and 42 px. A medium text field is 2 px taller than a medium button, room for its text and border.
export const controlHeightTokens: Readonly<ControlHeightTokens> = {
	small: spacingTokens['8'],
	medium: spacingTokens['10'],
	large: spacingTokens['12'],
	field: '2.625rem',
};

// 20 × 22 px with a gap of 16, and 20 px between cards. The inline padding is the only value off the 4 px grid.
export const cardTokens: Readonly<CardTokens> = {
	paddingBlock: spacingTokens['5'],
	paddingInline: '1.375rem',
	gap: spacingTokens['4'],
	gridGap: spacingTokens['5'],
};

// 42, 36 and 28 px.
export const tonalIconTokens: Readonly<TonalIconTokens> = {
	kpi: '2.625rem',
	list: '2.25rem',
	alert: '1.75rem',
};

// Shadows are barely visible on the dark canvas, so elevation pairs them with lighter surfaces and borders. The
// colored shadows (`official`, `brand`) follow the intent `main` of the theme and are added by `createDesignTokens`.
export const elevationTokens: Readonly<Omit<ElevationTokens, 'official' | 'brand'>> = {
	none: 'none',
	card: '0 1px 2px 0 rgb(0 0 0 / 0.5), 0 4px 12px -4px rgb(0 0 0 / 0.5)',
	overlay: '0 8px 24px -6px rgb(0 0 0 / 0.7)',
	dialog: '0 24px 48px -12px rgb(0 0 0 / 0.8)',
};

const coloredShadow = (color: string): string => `0 6px 20px -6px ${translucent(color, 0.45)}`;

// Spaced by 100 so an application can slot its own layer in between. A popover or a menu opened inside a dialog
// stays above it, toasts stay above dialogs, and tooltips above everything.
export const layerTokens: Readonly<LayerTokens> = {
	base: '0',
	sticky: '1100',
	drawer: '1200',
	dialog: '1300',
	popover: '1400',
	toast: '1500',
	tooltip: '1600',
};

// The canvas at 72%, blurred: the page behind a dialog stays recognizable but recedes.
export const backdropTokens: Readonly<BackdropTokens> = {
	scrim: translucent(surfaceTokens.canvas, 0.72),
	blur: '4px',
};

export const motionTokens: Readonly<MotionTokens> = {
	duration: {
		instant: '0ms',
		fast: '120ms',
		moderate: '200ms',
		slow: '320ms',
	},
	easing: {
		standard: 'cubic-bezier(0.2, 0, 0, 1)',
		enter: 'cubic-bezier(0, 0, 0, 1)',
		exit: 'cubic-bezier(0.3, 0, 1, 1)',
	},
};

// Geist Sans and Geist Mono are the official typefaces (decision D02). The library ships no font file: the
// application self-hosts them, and the system fonts that follow keep the interface usable while they load or when they
// are absent.
export const fontFamilyTokens: Readonly<FontFamilyTokens> = {
	sans: "'Geist Variable', Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
	mono: "'Geist Mono Variable', 'Geist Mono', ui-monospace, SFMono-Regular, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};

export const fontWeightTokens: Readonly<FontWeightTokens> = {
	regular: '400',
	medium: '500',
	semibold: '600',
	bold: '700',
};

interface TypographyStyleOptions {
	letterSpacing?: string;
	textTransform?: string;
	fontFamily?: string;
}

const createTypographyStyle = (
	fontSize: string,
	lineHeight: string,
	fontWeight: string,
	{
		letterSpacing = '0',
		textTransform = 'none',
		fontFamily = fontFamilyTokens.sans,
	}: TypographyStyleOptions = {},
): TypographyStyle => {
	return { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform };
};

// Sizes in rem follow the browser text size and zoom; unitless line heights scale with them. At the default text size
// they are 40, 32, 24, 18, 15, 13, 13, 12, 11 and 13 px.
export const typographyTokens: Readonly<TypographyTokens> = {
	display: createTypographyStyle('2.5rem', '1.2', fontWeightTokens.bold, {
		letterSpacing: '-0.02em',
	}),
	headingLarge: createTypographyStyle('2rem', '1.25', fontWeightTokens.bold, {
		letterSpacing: '-0.015em',
	}),
	headingMedium: createTypographyStyle('1.5rem', '1.3', fontWeightTokens.bold, {
		letterSpacing: '-0.01em',
	}),
	headingSmall: createTypographyStyle('1.125rem', '1.4', fontWeightTokens.semibold),
	body: createTypographyStyle('0.9375rem', '1.6', fontWeightTokens.regular),
	bodySmall: createTypographyStyle('0.8125rem', '1.5', fontWeightTokens.regular),
	label: createTypographyStyle('0.8125rem', '1.4', fontWeightTokens.medium, {
		letterSpacing: '0.01em',
	}),
	caption: createTypographyStyle('0.75rem', '1.4', fontWeightTokens.regular, {
		letterSpacing: '0.01em',
	}),
	// The smallest role: capitals and a wide tracking keep it legible.
	overline: createTypographyStyle('0.6875rem', '1.4', fontWeightTokens.semibold, {
		letterSpacing: '0.09em',
		textTransform: 'uppercase',
	}),
	code: createTypographyStyle('0.8125rem', '1.5', fontWeightTokens.medium, {
		fontFamily: fontFamilyTokens.mono,
	}),
};

export const iconSizeTokens: Readonly<IconSizeTokens> = {
	small: '1rem',
	medium: '1.25rem',
	large: '1.5rem',
};

// The support colors, starting with the identity pink and violet. Red comes last: it also reads as an error.
const chartSeries: readonly HexColor[] = [
	supportMainColors.pink,
	supportMainColors.violet,
	supportMainColors.blue,
	supportMainColors.green,
	supportMainColors.amber,
	supportMainColors.turquoise,
	supportMainColors.orange,
	supportMainColors.red,
];

const intentDerivationContext: Readonly<IntentDerivationContext> = {
	canvas: surfaceTokens.canvas,
	lightestSurface: surfaceTokens.overlay,
	lightInk: textTokens.primary,
	darkInk: textTokens.inverse,
};

const deepFreeze = <Value extends object>(value: Value): Readonly<Value> => {
	Object.values(value).forEach((child: unknown): void => {
		if (typeof child === 'object' && child !== null) deepFreeze(child);
	});

	return Object.freeze(value);
};

/** Builds the complete token set from intent sources; intents omitted fields are derived deterministically. */
export const createDesignTokens = (
	intentSources: IntentSources = defaultIntentSources,
): Readonly<DesignTokens> => {
	const intent: IntentPalette = deriveIntentPalette(intentSources, intentDerivationContext);

	return deepFreeze({
		color: {
			pink: { ...pinkScale },
			indigo: { ...indigoScale },
			midnight: { ...midnightScale },
		},
		surface: { ...surfaceTokens },
		text: { ...textTokens },
		border: { ...borderTokens },
		stroke: { ...strokeTokens },
		focus: { ...focusTokens },
		accent: {
			link: intent.official.text,
			linkHover: intent.official.light,
			selection: intent.brand.containerPressed,
			onSelection: textTokens.primary,
		},
		state: { ...stateTokens },
		intent,
		support: deriveSupportTokens(intentDerivationContext),
		chart: {
			series: [...chartSeries],
			grid: borderTokens.subtle,
			axis: borderTokens.strong,
			label: textTokens.secondary,
			tooltipSurface: surfaceTokens.overlay,
		},
		radius: { ...radiusTokens },
		spacing: { ...spacingTokens },
		controlHeight: { ...controlHeightTokens },
		card: { ...cardTokens },
		elevation: {
			...elevationTokens,
			official: coloredShadow(intent.official.main),
			brand: coloredShadow(intent.brand.main),
		},
		layer: { ...layerTokens },
		backdrop: { ...backdropTokens },
		motion: {
			duration: { ...motionTokens.duration },
			easing: { ...motionTokens.easing },
		},
		fontFamily: { ...fontFamilyTokens },
		fontWeight: { ...fontWeightTokens },
		typography: Object.fromEntries(
			typographyRoles.map((role: TypographyRole): [TypographyRole, TypographyStyle] => {
				return [role, { ...typographyTokens[role] }];
			}),
		) as TypographyTokens,
		iconSize: { ...iconSizeTokens },
		tonalIcon: { ...tonalIconTokens },
	});
};

/** The official token set of Midnight Indigo: UI. */
export const tokens: Readonly<DesignTokens> = createDesignTokens();
