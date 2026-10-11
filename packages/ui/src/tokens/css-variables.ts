// Maps the token tree to CSS custom properties (`--mi-<group>-<name>`) and renders the public stylesheet.
import type { DesignTokens } from './design-tokens.ts';

export const cssVariablePrefix: string = '--mi';

const toKebabCase = (segment: string): string => {
	return segment.replace(/[A-Z]/g, (letter: string): string => `-${letter.toLowerCase()}`);
};

/** Name of the CSS custom property for a token path, e.g. `['intent', 'official', 'contrastText']`. */
export const cssVariableName = (path: readonly string[]): string => {
	return [cssVariablePrefix, ...path.map(toKebabCase)].join('-');
};

/** `var(...)` reference for a token path, ready to use in CSS-in-JS or inline styles. */
export const cssVariableReference = (path: readonly string[]): string => {
	return `var(${cssVariableName(path)})`;
};

// Arrays (chart series) are numbered from 1 so the names read naturally: `--mi-chart-series-1`.
const flattenTokens = (value: unknown, path: readonly string[]): [string[], string][] => {
	if (typeof value === 'string') return [[[...path], value]];

	const entries: [string, unknown][] = Array.isArray(value)
		? value.map((item: unknown, index: number): [string, unknown] => [String(index + 1), item])
		: Object.entries(value as Record<string, unknown>);

	return entries.flatMap(([key, child]: [string, unknown]): [string[], string][] => {
		return flattenTokens(child, [...path, key]);
	});
};

/** Every token as `[path, value]`, in declaration order. */
export const listTokenEntries = (tokens: Readonly<DesignTokens>): [string[], string][] => {
	return flattenTokens(tokens, []);
};

/** Every token as a CSS custom property declaration map. */
export const toCssVariables = (tokens: Readonly<DesignTokens>): Record<string, string> => {
	return Object.fromEntries(
		listTokenEntries(tokens).map(([path, value]: [string[], string]): [string, string] => {
			return [cssVariableName(path), value];
		}),
	);
};

/**
 * Cascade layers of the library stylesheets, in increasing priority: the theme injected by `UiProvider`
 * overrides the static defaults of `styles.css` whatever their order in the document, and any unlayered
 * application CSS overrides both.
 */
export const cssLayers = {
	defaults: 'midnight-indigo.defaults',
	theme: 'midnight-indigo.theme',
} as const;

export type CssLayer = (typeof cssLayers)[keyof typeof cssLayers];

export interface TokenStylesheetOptions {
	/** Element that receives the custom properties. Defaults to `:root`. */
	selector?: string;
	/** Cascade layer that wraps the declarations. Defaults to `cssLayers.defaults`. */
	layer?: CssLayer;
}

const indent = (line: string): string => (line === '' ? line : `  ${line}`);

/**
 * Renders a stylesheet that declares every token on `selector`, inside a cascade layer. The color scheme is
 * always dark: there is no light palette and no light/dark toggle.
 */
export const createTokenStylesheet = (
	tokens: Readonly<DesignTokens>,
	{ selector = ':root', layer = cssLayers.defaults }: TokenStylesheetOptions = {},
): string => {
	const declarations: string[] = Object.entries(toCssVariables(tokens)).map(
		([name, value]: [string, string]): string => `  ${name}: ${value};`,
	);

	const reducedMotionDurations: string[] = Object.keys(tokens.motion.duration).map(
		(name: string): string => {
			return `    ${cssVariableName(['motion', 'duration', name])}: 0ms;`;
		},
	);

	const rules: string[] = [
		`${selector} {`,
		'  color-scheme: dark;',
		...declarations,
		'}',
		'',
		'@media (prefers-reduced-motion: reduce) {',
		`  ${selector} {`,
		...reducedMotionDurations,
		'  }',
		'}',
	];

	// Declaring the layer order first makes the priority independent of which stylesheet loads first.
	return [
		`@layer ${Object.values(cssLayers).join(', ')};`,
		'',
		`@layer ${layer} {`,
		...rules.map(indent),
		'}',
		'',
	].join('\n');
};
