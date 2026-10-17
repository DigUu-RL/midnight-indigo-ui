import { describe, expect, it } from 'vitest';

import type { HexColor } from '#src/tokens/color.ts';
import { contrastMinimums } from '#src/tokens/contrast.ts';
import { tokens } from '#src/tokens/design-tokens.ts';
import type { SurfaceTokens } from '#src/tokens/design-tokens.ts';
import { brandMainColor, officialMainColor } from '#src/tokens/intents.ts';
import {
	measureSupportContrast,
	supportColorFor,
	supportColorNames,
	supportMainColors,
} from '#src/tokens/support-colors.ts';
import type { SupportColor, SupportContrastMeasure } from '#src/tokens/support-colors.ts';
import { surfaceLayers } from '#src/tokens/surface-layers.ts';

describe('support colors', (): void => {
	it('publish the exact values of the v2 palette', (): void => {
		expect(supportMainColors).toEqual({
			pink: '#FF6AC1',
			violet: '#8F7AFB',
			blue: '#65BDEB',
			green: '#36C995',
			amber: '#F2B84B',
			red: '#F2545B',
			turquoise: '#3FD0C9',
			orange: '#F28A4B',
		});
	});

	it('share the identity and status colors instead of repeating them', (): void => {
		expect(supportMainColors.pink).toBe(officialMainColor);
		expect(supportMainColors.violet).toBe(tokens.color.indigo['300']);
		expect(supportMainColors.violet).not.toBe(brandMainColor);

		expect([
			tokens.intent.success.main,
			tokens.intent.warning.main,
			tokens.intent.error.main,
			tokens.intent.info.main,
		]).toEqual([
			supportMainColors.green,
			supportMainColors.amber,
			supportMainColors.red,
			supportMainColors.blue,
		]);
	});

	it('are tokens with a translucent soft background at 16%', (): void => {
		expect(tokens.support.violet.main).toBe('#8F7AFB');
		expect(tokens.support.violet.soft).toBe('rgb(143 122 251 / 0.16)');
		expect(Object.isFrozen(tokens.support.violet)).toBe(true);
	});

	it('keep text equal to main unless main misses 4.5:1 on soft', (): void => {
		const adjusted: SupportColor[] = supportColorNames.filter((color: SupportColor): boolean => {
			return tokens.support[color].text !== tokens.support[color].main;
		});

		expect(adjusted).toEqual(['violet', 'red']);
	});
});

describe('support colors on their soft background', (): void => {
	const surfaces: HexColor[] = surfaceLayers.map((surface: keyof SurfaceTokens): HexColor => {
		return tokens.surface[surface];
	});

	const measures: [SupportColor, SupportContrastMeasure][] = measureSupportContrast(
		tokens.support,
		surfaces,
	).map((measure: SupportContrastMeasure): [SupportColor, SupportContrastMeasure] => {
		return [measure.color, measure];
	});

	it.each(measures)(
		'%s text meets 4.5:1 and icons 3:1 on every surface',
		(_: SupportColor, measure: SupportContrastMeasure): void => {
			expect(measure.textRatio).toBeGreaterThanOrEqual(contrastMinimums.text);
			expect(measure.iconRatio).toBeGreaterThanOrEqual(contrastMinimums.nonText);
		},
	);

	it('measures the lightest surface at the strongest alpha, the lowest pair', (): void => {
		const violet: SupportContrastMeasure | undefined = measureSupportContrast(tokens.support, [
			tokens.surface.overlay,
		]).find((measure: SupportContrastMeasure): boolean => measure.color === 'violet');

		expect(violet?.iconRatio).toBeLessThan(contrastMinimums.text);
		expect(violet?.textRatio).toBeGreaterThanOrEqual(contrastMinimums.text);
	});
});

describe('chart series', (): void => {
	it('start with pink, violet and blue and use every support color once', (): void => {
		expect(tokens.chart.series.slice(0, 3)).toEqual(['#FF6AC1', '#8F7AFB', '#65BDEB']);
		expect([...tokens.chart.series].sort()).toEqual(Object.values(supportMainColors).sort());
	});
});

describe('supportColorFor', (): void => {
	const names: string[] = [
		'Samus Aran',
		'Spike Spiegel',
		'Leia Organa',
		'Faye Valentine',
		'Link',
		'Zelda',
		'Ahsoka Tano',
		'Cloud Strife',
		'Tifa Lockhart',
		'Edward Elric',
		'Han Solo',
		'Jet Black',
	];

	it('always gives the same text the same color', (): void => {
		names.forEach((name: string): void => {
			expect(supportColorFor(name)).toBe(supportColorFor(name));
		});

		expect(supportColorFor('Samus Aran')).toBe(supportColorFor('  samus aran '));
	});

	it('returns stable support colors across releases', (): void => {
		// A change here recolors every avatar of every application: treat it as a breaking change.
		expect(['Samus Aran', 'Spike Spiegel', 'Leia Organa', ''].map(supportColorFor)).toEqual([
			'pink',
			'blue',
			'pink',
			'red',
		]);
	});

	it('spreads different texts over several colors', (): void => {
		const colors: Set<SupportColor> = new Set<SupportColor>(names.map(supportColorFor));

		expect(colors.size).toBeGreaterThanOrEqual(5);
		expect(supportColorNames).toEqual(expect.arrayContaining([...colors]));
	});
});
