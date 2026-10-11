import { describe, expect, it } from 'vitest';

import {
	auditContrast,
	createContrastPairs,
	evaluateContrastPair,
	resolveTokenPath,
} from './contrast.ts';
import type { ContrastPair, ContrastResult } from './contrast.ts';
import { createDesignTokens, tokens } from './design-tokens.ts';
import type { DesignTokens } from './design-tokens.ts';
import { defaultIntentSources } from './intents.ts';

describe('official contrast pairs', (): void => {
	const namedResults: [string, ContrastResult][] = auditContrast(tokens).map(
		(result: ContrastResult): [string, ContrastResult] => [result.message, result],
	);

	it.each(namedResults)('%s', (_: string, result: ContrastResult): void => {
		// The assertion message names both tokens, the measured ratio and where the pair is used.
		expect(result.ratio, result.message).toBeGreaterThanOrEqual(result.minimum);
	});

	it('covers text, focus and every intent on every surface', (): void => {
		const foregrounds: Set<string> = new Set<string>(
			createContrastPairs(tokens).map((pair: ContrastPair): string => pair.foreground),
		);

		[
			'text.primary',
			'text.muted',
			'border.strong',
			'focus.ring',
			'intent.error.text',
			'chart.series.8',
		].forEach((path: string): void => {
			expect(foregrounds).toContain(path);
		});
	});
});

describe('auditContrast on a custom palette', (): void => {
	it('produces an explanatory failure instead of passing silently', (): void => {
		const custom: Readonly<DesignTokens> = createDesignTokens({
			...defaultIntentSources,
			success: { main: '#36C995', contrastText: '#F2EFFC' },
		});

		const failure: ContrastResult | undefined = auditContrast(custom).find(
			(result: ContrastResult): boolean => !result.passes,
		);

		expect(failure?.message).toBe(
			'intent.success.contrastText on intent.success.main FAILS 4.50:1 (text): 1.86:1. ' +
				'Used for: Label of a filled success control (main). Adjust one of the two tokens.',
		);
	});
});

describe('resolveTokenPath', (): void => {
	it('resolves nested and numbered paths', (): void => {
		expect(resolveTokenPath(tokens, 'intent.official.main')).toBe('#FF6AC1');
		expect(resolveTokenPath(tokens, 'chart.series.1')).toBe(tokens.chart.series[0]);
	});

	it('rejects unknown paths', (): void => {
		expect((): unknown => resolveTokenPath(tokens, 'intent.brand.main')).toThrow(
			'Unknown token path "intent.brand.main".',
		);

		expect((): unknown => resolveTokenPath(tokens, 'surface')).toThrow(/Unknown token path/);
	});

	it('is used by evaluateContrastPair for both colors', (): void => {
		const result: ContrastResult = evaluateContrastPair(tokens, {
			foreground: 'text.primary',
			background: 'surface.canvas',
			requirement: 'text',
			usage: 'Body text',
		});

		expect([result.foregroundColor, result.backgroundColor]).toEqual([
			tokens.text.primary,
			tokens.surface.canvas,
		]);
	});
});
