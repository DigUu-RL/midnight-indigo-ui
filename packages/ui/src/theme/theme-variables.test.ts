import { describe, expect, it } from 'vitest';

import {
	cssVariableReference,
	listTokenEntries,
	resolveTokenPath,
	tokens,
} from '#src/tokens/index.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

describe('themeVariables', (): void => {
	it('references the CSS custom property of each token', (): void => {
		expect(themeVariables.intent.official.main).toBe('var(--mi-intent-official-main)');
		expect(themeVariables.surface.canvas).toBe('var(--mi-surface-canvas)');
		expect(themeVariables.chart.series[0]).toBe('var(--mi-chart-series-1)');
	});

	it('covers every token', (): void => {
		listTokenEntries(tokens).forEach(([path]: [string[], string]): void => {
			expect(resolveTokenPath(themeVariables as never, path.join('.'))).toBe(
				cssVariableReference(path),
			);
		});
	});

	it('is immutable', (): void => {
		expect(Object.isFrozen(themeVariables.intent.official)).toBe(true);
	});
});
