import { describe, expect, it } from 'vitest';

import { tokens, typographyRoles } from '#src/tokens/design-tokens.ts';
import type { TypographyRole, TypographyStyle } from '#src/tokens/design-tokens.ts';

const typographyEntries: [TypographyRole, TypographyStyle][] = typographyRoles.map(
	(role: TypographyRole): [TypographyRole, TypographyStyle] => [role, tokens.typography[role]],
);

const toRem = (size: string): number => Number.parseFloat(size);

describe('typography scale', (): void => {
	it('declares every role', (): void => {
		expect(Object.keys(tokens.typography)).toEqual([...typographyRoles]);
	});

	// rem follows the browser text size setting, which px ignores; unitless line heights scale with the text.
	it.each(typographyEntries)(
		'%s scales with the browser text size',
		(_: string, style: TypographyStyle): void => {
			expect(style.fontSize).toMatch(/^\d+(\.\d+)?rem$/);
			expect(style.lineHeight).toMatch(/^\d+(\.\d+)?$/);
			expect(style.letterSpacing).toMatch(/^(0|-?\d*\.\d+em)$/);
		},
	);

	it.each(typographyEntries)('%s stays legible', (_: string, style: TypographyStyle): void => {
		expect(toRem(style.fontSize)).toBeGreaterThanOrEqual(0.75);
		expect(Number(style.lineHeight)).toBeGreaterThanOrEqual(1.2);
	});

	it('gives running text a line height of at least 1.5', (): void => {
		expect(Number(tokens.typography.body.lineHeight)).toBeGreaterThanOrEqual(1.5);
		expect(Number(tokens.typography.bodySmall.lineHeight)).toBeGreaterThanOrEqual(1.5);
	});

	it('keeps body text at the browser default size', (): void => {
		expect(tokens.typography.body.fontSize).toBe('1rem');
	});

	it('orders headings from the largest to the smallest', (): void => {
		const headingSizes: number[] = (
			['display', 'headingLarge', 'headingMedium', 'headingSmall', 'body'] as const
		).map((role: TypographyRole): number => toRem(tokens.typography[role].fontSize));

		expect(headingSizes).toEqual(
			headingSizes.toSorted((left: number, right: number): number => right - left),
		);

		expect(new Set(headingSizes).size).toBe(headingSizes.length);
	});

	it.each(typographyEntries)(
		'%s uses the font tokens',
		(role: TypographyRole, style: TypographyStyle): void => {
			const expectedFamily: string =
				role === 'code' ? tokens.fontFamily.mono : tokens.fontFamily.sans;

			expect(style.fontFamily).toBe(expectedFamily);
			expect(Object.values(tokens.fontWeight)).toContain(style.fontWeight);
		},
	);
});

describe('font stacks', (): void => {
	it('put Geist Sans first and end with a generic family', (): void => {
		expect(tokens.fontFamily.sans).toMatch(/^'Geist Variable', Geist, /);
		expect(tokens.fontFamily.sans).toMatch(/, sans-serif$/);
		expect(tokens.fontFamily.mono).toMatch(/, monospace$/);
	});

	it('never download a font', (): void => {
		Object.values(tokens.fontFamily).forEach((fontFamily: string): void => {
			expect(fontFamily).not.toMatch(/url\(|@import|https?:/);
		});
	});
});

describe('icon sizes', (): void => {
	it('are in rem and increase from small to large', (): void => {
		const sizes: string[] = [tokens.iconSize.small, tokens.iconSize.medium, tokens.iconSize.large];
		const values: number[] = sizes.map(toRem);

		sizes.forEach((size: string): void => {
			expect(size).toMatch(/^\d+(\.\d+)?rem$/);
		});

		expect(values).toEqual(values.toSorted((left: number, right: number): number => left - right));
		expect(new Set(values).size).toBe(values.length);
	});
});
