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
 * Renders a stylesheet that declares every token on `selector`. The color scheme is always dark:
 * there is no light palette and no light/dark toggle.
 */
export const createTokenStylesheet = (
	tokens: Readonly<DesignTokens>,
	selector: string = ':root',
): string => {
	const declarations: string[] = Object.entries(toCssVariables(tokens)).map(
		([name, value]: [string, string]): string => `  ${name}: ${value};`,
	);

	const reducedMotionDurations: string[] = Object.keys(tokens.motion.duration).map(
		(name: string): string => {
			return `    ${cssVariableName(['motion', 'duration', name])}: 0ms;`;
		},
	);

	return [
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
		'',
	].join('\n');
};
