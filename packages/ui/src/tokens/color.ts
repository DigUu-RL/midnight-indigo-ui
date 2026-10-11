// Color math used to derive and audit tokens: sRGB hex parsing, mixing and WCAG 2.2 contrast.

/** A color written as `#RGB` or `#RRGGBB`. Tokens always store the normalized `#RRGGBB` uppercase form. */
export type HexColor = `#${string}`;

export interface RgbColor {
	red: number;
	green: number;
	blue: number;
}

const hexColorPattern: RegExp = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isHexColor = (value: string): value is HexColor => hexColorPattern.test(value);

const expandShortHex = (digits: string): string => {
	return digits.length === 3
		? digits.replace(/./g, (digit: string): string => `${digit}${digit}`)
		: digits;
};

export const parseHexColor = (color: string): RgbColor => {
	if (!isHexColor(color)) {
		throw new TypeError(
			`Invalid color "${color}": expected a hexadecimal color such as #FF6AC1 or #F6C.`,
		);
	}

	const digits: string = expandShortHex(color.slice(1));
	const channel = (offset: number): number => Number.parseInt(digits.slice(offset, offset + 2), 16);
	return { red: channel(0), green: channel(2), blue: channel(4) };
};

const formatChannel = (value: number): string => {
	return Math.round(Math.min(255, Math.max(0, value)))
		.toString(16)
		.padStart(2, '0')
		.toUpperCase();
};

export const formatHexColor = (color: RgbColor): HexColor => {
	return `#${formatChannel(color.red)}${formatChannel(color.green)}${formatChannel(color.blue)}`;
};

/** Returns the color in the canonical `#RRGGBB` uppercase form. */
export const normalizeHexColor = (color: string): HexColor => formatHexColor(parseHexColor(color));

/**
 * Mixes two colors in sRGB space, like CSS `color-mix(in srgb, foreground weight, background)`.
 * `weight` is the share of `foreground`, from 0 (only background) to 1 (only foreground).
 */
export const mixColors = (foreground: string, background: string, weight: number): HexColor => {
	const foregroundChannels: RgbColor = parseHexColor(foreground);
	const backgroundChannels: RgbColor = parseHexColor(background);
	const share: number = Math.min(1, Math.max(0, weight));
	const blend = (front: number, back: number): number => front * share + back * (1 - share);

	return formatHexColor({
		red: blend(foregroundChannels.red, backgroundChannels.red),
		green: blend(foregroundChannels.green, backgroundChannels.green),
		blue: blend(foregroundChannels.blue, backgroundChannels.blue),
	});
};

const linearizeChannel = (value: number): number => {
	const normalized: number = value / 255;
	return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

/** WCAG 2.2 relative luminance, from 0 (black) to 1 (white). */
export const relativeLuminance = (color: string): number => {
	const { red, green, blue }: RgbColor = parseHexColor(color);
	return (
		0.2126 * linearizeChannel(red) +
		0.7152 * linearizeChannel(green) +
		0.0722 * linearizeChannel(blue)
	);
};

/** WCAG 2.2 contrast ratio between two opaque colors, from 1 to 21. */
export const contrastRatio = (first: string, second: string): number => {
	const firstLuminance: number = relativeLuminance(first);
	const secondLuminance: number = relativeLuminance(second);
	const lighter: number = Math.max(firstLuminance, secondLuminance);
	const darker: number = Math.min(firstLuminance, secondLuminance);
	return (lighter + 0.05) / (darker + 0.05);
};

/** Formats a ratio truncated (never rounded up) to two decimals, so 4.497 is shown as 4.49, not 4.50. */
export const formatContrastRatio = (ratio: number): string => {
	return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
};

const contrastAdjustmentSteps: number = 20;

/**
 * Moves `color` toward `target` in 5% steps until it reaches `minimumRatio` against `background`.
 * Deterministic: the same input always yields the same output. Returns `target` when no step suffices.
 */
export const ensureContrast = (
	color: string,
	background: string,
	minimumRatio: number,
	target: string,
): HexColor => {
	const candidates: HexColor[] = Array.from(
		{ length: contrastAdjustmentSteps + 1 },
		(_: unknown, step: number): HexColor => {
			return mixColors(target, color, step / contrastAdjustmentSteps);
		},
	);

	const firstPassing: HexColor | undefined = candidates.find(
		(candidate: HexColor): boolean => contrastRatio(candidate, background) >= minimumRatio,
	);

	return firstPassing ?? normalizeHexColor(target);
};

/** Picks, among `candidates`, the color with the highest contrast against `background`. */
export const pickHighestContrast = (
	background: string,
	candidates: readonly HexColor[],
): HexColor => {
	return candidates.reduce((best: HexColor, candidate: HexColor): HexColor => {
		return contrastRatio(candidate, background) > contrastRatio(best, background)
			? candidate
			: best;
	});
};
