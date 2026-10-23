import { describe, expect, it } from 'vitest';

import {
	auditContrast,
	contrastExceptions,
	contrastMinimums,
	createContrastPairs,
	describeContrastPair,
	evaluateContrastPair,
	findUnauditedColorTokens,
	formatContrastReport,
	resolveTokenPath,
} from '@/src/tokens/contrast';
import type { ContrastException, ContrastPair, ContrastResult } from '@/src/tokens/contrast';
import { createDesignTokens, tokens } from '@/src/tokens/design-tokens';
import type {
	AccentTokens,
	BorderTokens,
	DesignTokens,
	SurfaceTokens,
} from '@/src/tokens/design-tokens';
import { defaultIntentSources } from '@/src/tokens/intents';

describe('official contrast pairs', (): void => {
	const namedResults: [string, ContrastResult][] = auditContrast(tokens).map(
		(result: ContrastResult): [string, ContrastResult] => [result.message, result],
	);

	it.each(namedResults)('%s', (_: string, result: ContrastResult): void => {
		// The assertion message names both tokens, the measured ratio and where the pair is used.
		expect(result.ratio, result.message).toBeGreaterThanOrEqual(result.minimum);
	});

	it('reports no failing pair', (): void => {
		// On failure, the report lists every failing pair with its tokens, ratio and usage.
		const report: string = formatContrastReport(auditContrast(tokens));
		expect(report, report).toBe('');
	});

	it('covers text, focus and every intent on every surface', (): void => {
		const foregrounds: Set<string> = new Set<string>(
			createContrastPairs(tokens).map((pair: ContrastPair): string => pair.foreground),
		);

		[
			'text.primary',
			'text.muted',
			'border.control',
			'focus.ring',
			'intent.error.text',
			'support.amber.text',
			'chart.series.8',
			'chart.label',
		].forEach((path: string): void => {
			expect(foregrounds).toContain(path);
		});
	});

	it('audits the brand intent and the pink focus ring on every surface', (): void => {
		const pairs: ContrastPair[] = createContrastPairs(tokens);

		const backgroundsOf = (foreground: string): string[] => {
			return pairs
				.filter((pair: ContrastPair): boolean => pair.foreground === foreground)
				.map((pair: ContrastPair): string => pair.background);
		};

		const everySurface: string[] = [
			'canvas',
			'field',
			'sidebar',
			'tableHeader',
			'raised',
			'dialog',
			'overlay',
		].map((surface: string): string => `surface.${surface}`);

		expect(backgroundsOf('focus.ring')).toEqual(everySurface);
		expect(backgroundsOf('intent.brand.text')).toEqual(everySurface);
		expect(backgroundsOf('intent.brand.border')).toEqual(everySurface);

		expect(backgroundsOf('intent.brand.contrastText')).toEqual([
			'intent.brand.main',
			'intent.brand.hover',
			'intent.brand.pressed',
		]);
	});
});

describe('contrast matrix', (): void => {
	const describedPairs: string[] = createContrastPairs(tokens).map(describeContrastPair);

	it('measures every support color on its tonal background over every surface', (): void => {
		expect(describedPairs).toContain(
			'support.violet.text on support.violet.soft over surface.overlay',
		);

		expect(describedPairs).toContain(
			'support.amber.main on support.amber.soft over surface.canvas',
		);

		expect(describedPairs).toContain('support.red.main on surface.dialog');
	});

	it('composites a translucent background over its backdrop', (): void => {
		const result: ContrastResult = evaluateContrastPair(tokens, {
			foreground: 'support.pink.text',
			background: 'support.pink.soft',
			backdrop: 'surface.raised',
			requirement: 'text',
			usage: 'Label of a pink tag',
		});

		// 16% of #FF6AC1 over #13102B.
		expect(result.backgroundColor).toBe('#391E43');

		expect(result.message).toMatch(
			/^support\.pink\.text on support\.pink\.soft over surface\.raised meets/,
		);
	});

	it('audits or exempts every color token', (): void => {
		expect(findUnauditedColorTokens(tokens)).toEqual([]);
	});

	it('fails on a color token outside the matrix', (): void => {
		// Kept in variables: a token that is not declared yet is what the audit must catch.
		const border: BorderTokens = { ...tokens.border, glow: '#8F7AFB' } as BorderTokens;
		const accent: AccentTokens = { ...tokens.accent, visited: '#C3BDDC' } as AccentTokens;
		const withNewToken: Readonly<DesignTokens> = { ...tokens, border, accent };

		expect(findUnauditedColorTokens(withNewToken)).toEqual(['border.glow', 'accent.visited']);
	});

	it('audits a new surface by itself', (): void => {
		const surface: SurfaceTokens = { ...tokens.surface, popover: '#2A2162' } as SurfaceTokens;
		const withNewSurface: Readonly<DesignTokens> = { ...tokens, surface };

		const backgrounds: string[] = createContrastPairs(withNewSurface)
			.filter((pair: ContrastPair): boolean => pair.foreground === 'text.muted')
			.map((pair: ContrastPair): string => pair.background);

		expect(backgrounds).toContain('surface.popover');
		expect(findUnauditedColorTokens(withNewSurface)).toEqual([]);
	});
});

describe('accepted exceptions of the v2 design', (): void => {
	it('are exactly the pairs approved by the design, with their lowest accepted ratio', (): void => {
		const approved: [string, string, number][] = contrastExceptions.map(
			(exception: ContrastException): [string, string, number] => {
				return [describeContrastPair(exception), exception.requirement, exception.minimum];
			},
		);

		expect(approved).toEqual([
			// Outline of the v2 text fields (#2C2558, 1.4:1): the visible label and the field background identify the
			// field, and the focused field gets the pink focus border, which meets 3:1.
			['border.default on surface.field', 'nonText', 1.4],
			// Hovered outline (#453C7A, 2.1:1): hover is extra feedback, never the only way to find the field.
			['border.strong on surface.field', 'nonText', 2],
			// Placeholder (#6E62A3, 3.8:1): an example of the value, never the only instruction; the label is visible.
			['text.placeholder on surface.field', 'text', 3.7],
			// Page scrollbar thumb (#2C2558, 1.5:1), revising the 3:1 of F20: scrolling does not depend on it, and the
			// high contrast modes give the scrollbar back to the system.
			['border.default on surface.canvas', 'nonText', 1.4],
		]);
	});

	it('each carry a justification', (): void => {
		contrastExceptions.forEach((exception: ContrastException): void => {
			expect(exception.justification.length, describeContrastPair(exception)).toBeGreaterThan(40);
		});
	});

	it('stay below the WCAG minimum, so an exception that is no longer needed is removed', (): void => {
		auditContrast(tokens)
			.filter((result: ContrastResult): boolean => result.exception !== undefined)
			.forEach((result: ContrastResult): void => {
				expect(result.ratio, result.message).toBeLessThan(contrastMinimums[result.requirement]);
			});
	});

	it('fail when a token change lowers the pair below the accepted ratio', (): void => {
		const darkerBorder: Readonly<DesignTokens> = {
			...tokens,
			border: { ...tokens.border, default: tokens.border.subtle },
		};

		expect(formatContrastReport(auditContrast(darkerBorder))).toBe(
			[
				'2 contrast pair(s) fail:',
				'- border.default on surface.field FAILS 1.40:1, an accepted exception to 3.00:1 (nonText): 1.21:1. ' +
					'Used for: Outline of a text field. Adjust one of the two tokens.',
				'- border.default on surface.canvas FAILS 1.40:1, an accepted exception to 3.00:1 (nonText): 1.23:1. ' +
					'Used for: Thumb of the page scrollbar. Adjust one of the two tokens.',
			].join('\n'),
		);
	});

	it('apply only to their own pair', (): void => {
		const result: ContrastResult = evaluateContrastPair(tokens, {
			foreground: 'text.placeholder',
			background: 'surface.raised',
			requirement: 'text',
			usage: 'Placeholder outside a field',
		});

		expect([result.minimum, result.exception, result.passes]).toEqual([4.5, undefined, false]);
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
		expect((): unknown => resolveTokenPath(tokens, 'intent.accent.main')).toThrow(
			'Unknown token path "intent.accent.main".',
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
