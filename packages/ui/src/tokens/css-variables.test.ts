import { describe, expect, it } from 'vitest';

import {
	createTokenStylesheet,
	cssVariableName,
	cssVariableReference,
	listTokenEntries,
	toCssVariables,
} from './css-variables.ts';
import { tokens } from './design-tokens.ts';

describe('CSS variable names', (): void => {
	it('prefix and kebab-case the token path', (): void => {
		expect(cssVariableName(['intent', 'official', 'contrastText'])).toBe(
			'--mi-intent-official-contrast-text',
		);
		expect(cssVariableReference(['surface', 'canvas'])).toBe('var(--mi-surface-canvas)');
	});

	it('number array items from 1', (): void => {
		expect(toCssVariables(tokens)['--mi-chart-series-1']).toBe(tokens.chart.series[0]);
	});

	it('are unique for every token', (): void => {
		expect(Object.keys(toCssVariables(tokens))).toHaveLength(listTokenEntries(tokens).length);
	});
});

describe('createTokenStylesheet', (): void => {
	const stylesheet: string = createTokenStylesheet(tokens);

	it('declares every token as a custom property', (): void => {
		Object.entries(toCssVariables(tokens)).forEach(([name, value]: [string, string]): void => {
			expect(stylesheet).toContain(`  ${name}: ${value};`);
		});
	});

	it('is dark-only', (): void => {
		expect(stylesheet).toContain('color-scheme: dark;');
		expect(stylesheet).not.toMatch(/prefers-color-scheme|color-scheme:\s*light/);
	});

	it('zeroes durations under reduced motion', (): void => {
		expect(stylesheet).toMatch(
			/@media \(prefers-reduced-motion: reduce\)[\s\S]*--mi-motion-duration-slow: 0ms;/,
		);
	});

	it('accepts a custom selector', (): void => {
		expect(createTokenStylesheet(tokens, '.app')).toMatch(/^\.app \{/);
	});
});
