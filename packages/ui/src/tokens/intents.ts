// Semantic intents and the deterministic derivation of their full token set from a `main` color.
import {
	ensureContrast,
	mixColors,
	normalizeHexColor,
	pickHighestContrast,
} from '#src/tokens/color.ts';
import type { HexColor } from '#src/tokens/color.ts';

export const semanticIntents = [
	'official',
	'default',
	'success',
	'warning',
	'error',
	'info',
] as const;

export type SemanticIntent = (typeof semanticIntents)[number];

/** Input of one intent: `main` is required; any other field overrides its derived value. */
export interface IntentSource {
	main: HexColor;
	light?: HexColor;
	dark?: HexColor;
	contrastText?: HexColor;
	container?: HexColor;
	onContainer?: HexColor;
	border?: HexColor;
	text?: HexColor;
	hover?: HexColor;
	pressed?: HexColor;
	containerHover?: HexColor;
	containerPressed?: HexColor;
}

/** Complete token set of one intent, as consumed by components. */
export type IntentTokens = Required<IntentSource>;

export type IntentSources = Record<SemanticIntent, IntentSource>;

export type IntentPalette = Record<SemanticIntent, IntentTokens>;

/** Colors the derivation measures against; they come from the surface and text tokens. */
export interface IntentDerivationContext {
	/** Darkest surface, used to shade and to build containers. */
	canvas: HexColor;
	/** Lightest surface on which intent text and borders must stay legible. */
	lightestSurface: HexColor;
	/** Light ink, used to tint and as a contrast-text candidate. */
	lightInk: HexColor;
	/** Dark ink, used as a contrast-text candidate. */
	darkInk: HexColor;
}

/** Exact brand value: the `keyword` pink of the Midnight Indigo theme. Must not change silently. */
export const officialMainColor: HexColor = '#FF6AC1';

/** Default intent sources. Every value except `official.main` is a provisional proposal. */
export const defaultIntentSources: Readonly<IntentSources> = {
	official: { main: officialMainColor },
	default: { main: '#9290A8' },
	success: { main: '#36C995' },
	warning: { main: '#F2B84B' },
	error: { main: '#F2545B' },
	info: { main: '#65BDEB' },
};

const textMinimumRatio: number = 4.5;
const nonTextMinimumRatio: number = 3;

/**
 * Derives every intent token from `source.main`. Same input, same output; explicit fields in `source` win.
 * Contrast is guaranteed by construction for `text`, `border` and `onContainer`; the remaining pairs are
 * checked by `auditContrast`, which explains any failure.
 */
export const deriveIntentTokens = (
	source: IntentSource,
	context: IntentDerivationContext,
): IntentTokens => {
	const main: HexColor = normalizeHexColor(source.main);
	const containerPressed: HexColor = mixColors(main, context.canvas, 0.26);

	const derived: IntentTokens = {
		main,
		light: mixColors(context.lightInk, main, 0.3),
		dark: mixColors(context.canvas, main, 0.3),
		contrastText: pickHighestContrast(main, [context.darkInk, context.lightInk]),
		container: mixColors(main, context.canvas, 0.14),
		onContainer: ensureContrast(
			mixColors(context.lightInk, main, 0.4),
			containerPressed,
			textMinimumRatio,
			context.lightInk,
		),
		border: ensureContrast(main, context.lightestSurface, nonTextMinimumRatio, context.lightInk),
		text: ensureContrast(main, context.lightestSurface, textMinimumRatio, context.lightInk),
		hover: mixColors(context.lightInk, main, 0.15),
		pressed: mixColors(context.canvas, main, 0.15),
		containerHover: mixColors(main, context.canvas, 0.2),
		containerPressed,
	};

	const overrides: Partial<IntentTokens> = Object.fromEntries(
		Object.entries(source).map(([field, value]: [string, string]): [string, HexColor] => {
			return [field, normalizeHexColor(value)];
		}),
	);

	return { ...derived, ...overrides };
};

export const deriveIntentPalette = (
	sources: IntentSources,
	context: IntentDerivationContext,
): IntentPalette => {
	return Object.fromEntries(
		semanticIntents.map((intent: SemanticIntent): [SemanticIntent, IntentTokens] => {
			return [intent, deriveIntentTokens(sources[intent], context)];
		}),
	) as IntentPalette;
};
