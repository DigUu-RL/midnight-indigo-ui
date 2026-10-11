// The complete design token set: base groups plus intents derived from their sources. Dark-only by design.
import type { HexColor } from './color.ts';
import { defaultIntentSources, deriveIntentPalette } from './intents.ts';
import type { IntentDerivationContext, IntentPalette, IntentSources } from './intents.ts';

export interface SurfaceTokens {
	canvas: HexColor;
	sunken: HexColor;
	base: HexColor;
	raised: HexColor;
	overlay: HexColor;
}

export interface TextTokens {
	primary: HexColor;
	secondary: HexColor;
	muted: HexColor;
	disabled: HexColor;
	inverse: HexColor;
}

export interface BorderTokens {
	subtle: HexColor;
	default: HexColor;
	strong: HexColor;
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

export interface RadiusTokens {
	none: string;
	small: string;
	medium: string;
	large: string;
	extraLarge: string;
	pill: string;
}

export type SpacingStep = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';

export type SpacingTokens = Record<SpacingStep, string>;

export interface ElevationTokens {
	none: string;
	low: string;
	medium: string;
	high: string;
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
}

export type TypographyTokens = Record<TypographyRole, TypographyStyle>;

export interface IconSizeTokens {
	small: string;
	medium: string;
	large: string;
}

export interface DesignTokens {
	surface: SurfaceTokens;
	text: TextTokens;
	border: BorderTokens;
	focus: FocusTokens;
	accent: AccentTokens;
	state: StateTokens;
	intent: IntentPalette;
	chart: ChartTokens;
	radius: RadiusTokens;
	spacing: SpacingTokens;
	elevation: ElevationTokens;
	motion: MotionTokens;
	fontFamily: FontFamilyTokens;
	fontWeight: FontWeightTokens;
	typography: TypographyTokens;
	iconSize: IconSizeTokens;
}

export const surfaceTokens: Readonly<SurfaceTokens> = {
	canvas: '#020108',
	sunken: '#030209',
	base: '#040208',
	raised: '#0A0716',
	overlay: '#110C22',
};

export const textTokens: Readonly<TextTokens> = {
	primary: '#F2EFFC',
	secondary: '#C3BDDC',
	muted: '#9790B8',
	disabled: '#5E5880',
	inverse: surfaceTokens.canvas,
};

export const borderTokens: Readonly<BorderTokens> = {
	subtle: '#1F1838',
	default: '#352A5E',
	strong: '#6E62A3',
};

export const focusTokens: Readonly<FocusTokens> = {
	ring: '#B7A8FF',
	width: '2px',
	offset: '2px',
};

export const stateTokens: Readonly<StateTokens> = {
	hover: '#16112B',
	pressed: '#1D1636',
	selected: '#241B44',
	disabledSurface: '#0E0B1C',
	disabledText: textTokens.disabled,
	disabledBorder: '#2A2445',
};

export const radiusTokens: Readonly<RadiusTokens> = {
	none: '0',
	small: '4px',
	medium: '8px',
	large: '12px',
	extraLarge: '16px',
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

// Shadows are barely visible on the dark canvas, so elevation pairs them with lighter surfaces and borders.
export const elevationTokens: Readonly<ElevationTokens> = {
	none: 'none',
	low: '0 1px 2px 0 rgb(0 0 0 / 0.6)',
	medium: '0 4px 12px -2px rgb(0 0 0 / 0.7)',
	high: '0 12px 32px -4px rgb(0 0 0 / 0.8)',
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

// Inter is the provisional typeface (decision D02). The library ships no font file: the application self-hosts
// it, and the system fonts that follow keep the interface usable while it loads or when it is absent.
export const fontFamilyTokens: Readonly<FontFamilyTokens> = {
	sans: "'Inter Variable', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
	mono: "ui-monospace, SFMono-Regular, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};

export const fontWeightTokens: Readonly<FontWeightTokens> = {
	regular: '400',
	medium: '500',
	semibold: '600',
	bold: '700',
};

const createTypographyStyle = (
	fontSize: string,
	lineHeight: string,
	fontWeight: string,
	letterSpacing: string = '0',
	fontFamily: string = fontFamilyTokens.sans,
): TypographyStyle => {
	return { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing };
};

// Sizes in rem follow the browser text size and zoom; unitless line heights scale with them.
export const typographyTokens: Readonly<TypographyTokens> = {
	display: createTypographyStyle('2.25rem', '1.2', fontWeightTokens.bold, '-0.02em'),
	headingLarge: createTypographyStyle('1.75rem', '1.25', fontWeightTokens.semibold, '-0.015em'),
	headingMedium: createTypographyStyle('1.375rem', '1.3', fontWeightTokens.semibold, '-0.01em'),
	headingSmall: createTypographyStyle('1.125rem', '1.4', fontWeightTokens.semibold),
	body: createTypographyStyle('1rem', '1.5', fontWeightTokens.regular),
	bodySmall: createTypographyStyle('0.875rem', '1.5', fontWeightTokens.regular),
	label: createTypographyStyle('0.875rem', '1.4', fontWeightTokens.medium, '0.01em'),
	caption: createTypographyStyle('0.75rem', '1.4', fontWeightTokens.regular, '0.02em'),
	code: createTypographyStyle(
		'0.875rem',
		'1.5',
		fontWeightTokens.regular,
		'0',
		fontFamilyTokens.mono,
	),
};

export const iconSizeTokens: Readonly<IconSizeTokens> = {
	small: '1rem',
	medium: '1.25rem',
	large: '1.5rem',
};

const chartSeries: readonly HexColor[] = [
	'#FF6AC1',
	'#65BDEB',
	'#36C995',
	'#F2B84B',
	'#A68CFF',
	'#FF8A5B',
	'#4FD1C5',
	'#D4D1E8',
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
		surface: { ...surfaceTokens },
		text: { ...textTokens },
		border: { ...borderTokens },
		focus: { ...focusTokens },
		accent: {
			link: intent.official.text,
			linkHover: intent.official.light,
			selection: intent.official.containerPressed,
			onSelection: textTokens.primary,
		},
		state: { ...stateTokens },
		intent,
		chart: {
			series: [...chartSeries],
			grid: borderTokens.subtle,
			axis: borderTokens.strong,
			label: textTokens.secondary,
			tooltipSurface: surfaceTokens.overlay,
		},
		radius: { ...radiusTokens },
		spacing: { ...spacingTokens },
		elevation: { ...elevationTokens },
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
	});
};

/** The official token set of Midnight Indigo: UI. */
export const tokens: Readonly<DesignTokens> = createDesignTokens();
