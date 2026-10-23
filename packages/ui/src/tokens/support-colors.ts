// Support palette harmonized with the pink and the indigo: categories, tags, avatars and charts.
import { contrastRatio, ensureContrast, mixColors, soft, softAlpha } from '@/src/tokens/color';
import type { HexColor } from '@/src/tokens/color';
import type { IntentDerivationContext } from '@/src/tokens/intents';

export const supportColorNames = [
	'pink',
	'violet',
	'blue',
	'green',
	'amber',
	'red',
	'turquoise',
	'orange',
] as const;

export type SupportColor = (typeof supportColorNames)[number];

/** Tokens of one support color, as consumed by components. */
export interface SupportColorTokens {
	/** The support color itself: icons, dots, chart marks; meets 3:1 on its `soft` background. */
	main: HexColor;
	/** Tonal background, `main` at 16% as a translucent CSS color. */
	soft: string;
	/** Text on `soft`; equals `main` unless `main` is below 4.5:1 on it. */
	text: HexColor;
}

export type SupportTokens = Record<SupportColor, SupportColorTokens>;

/**
 * Exact support colors. `pink` is the official pink and `violet` the indigo `300`; `green`, `amber`, `red` and `blue`
 * are the `main` of the status intents `success`, `warning`, `error` and `info`.
 */
export const supportMainColors: Readonly<Record<SupportColor, HexColor>> = {
	pink: '#FF6AC1',
	violet: '#8F7AFB',
	blue: '#65BDEB',
	green: '#36C995',
	amber: '#F2B84B',
	red: '#F2545B',
	turquoise: '#3FD0C9',
	orange: '#F28A4B',
};

const textMinimumRatio: number = 4.5;

/**
 * Derives the tokens of every support color. `text` is measured on the most saturated `soft` background over the
 * lightest surface, the pair with the lowest contrast, so it meets 4.5:1 on every surface.
 */
export const deriveSupportTokens = (
	context: Pick<IntentDerivationContext, 'lightestSurface' | 'lightInk'>,
): SupportTokens => {
	return Object.fromEntries(
		supportColorNames.map((name: SupportColor): [SupportColor, SupportColorTokens] => {
			const main: HexColor = supportMainColors[name];
			const darkestSoft: HexColor = mixColors(main, context.lightestSurface, softAlpha.maximum);

			return [
				name,
				{
					main,
					soft: soft(main),
					text: ensureContrast(main, darkestSoft, textMinimumRatio, context.lightInk),
				},
			];
		}),
	) as SupportTokens;
};

/** Lowest contrast of a support color on its `soft` background, over every surface and alpha of `softAlpha`. */
export interface SupportContrastMeasure {
	color: SupportColor;
	textRatio: number;
	iconRatio: number;
}

/** Measures every support color on `soft` backgrounds composited over each of `surfaces`. */
export const measureSupportContrast = (
	support: Readonly<SupportTokens>,
	surfaces: readonly HexColor[],
): SupportContrastMeasure[] => {
	return supportColorNames.map((color: SupportColor): SupportContrastMeasure => {
		const { main, text }: SupportColorTokens = support[color];

		const backgrounds: HexColor[] = surfaces.flatMap((surface: HexColor): HexColor[] => {
			return [softAlpha.minimum, softAlpha.maximum].map((alpha: number): HexColor => {
				return mixColors(main, surface, alpha);
			});
		});

		const lowestRatio = (foreground: HexColor): number => {
			return Math.min(
				...backgrounds.map((background: HexColor): number => contrastRatio(foreground, background)),
			);
		};

		return { color, textRatio: lowestRatio(text), iconRatio: lowestRatio(main) };
	});
};

// 32-bit FNV-1a: tiny, fast and well spread for short texts such as names.
const fnvOffsetBasis: number = 0x811c9dc5;
const fnvPrime: number = 0x01000193;

const hashText = (text: string): number => {
	return Array.from(text).reduce((hash: number, character: string): number => {
		return Math.imul(hash ^ (character.codePointAt(0) ?? 0), fnvPrime) >>> 0;
	}, fnvOffsetBasis);
};

/**
 * Assigns a support color to a text, such as the name of an avatar. Deterministic: the same text always gets the same
 * color, on the server and in the browser. Case and surrounding spaces are ignored.
 */
export const supportColorFor = (text: string): SupportColor => {
	const index: number = hashText(text.trim().toLowerCase()) % supportColorNames.length;
	return supportColorNames[index] ?? supportColorNames[0];
};
