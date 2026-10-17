import { describe, expect, it } from 'vitest';

import { relativeLuminance } from '#src/tokens/color.ts';
import { toCssVariables } from '#src/tokens/css-variables.ts';
import {
	colorScaleSteps,
	createDesignTokens,
	midnightScaleSteps,
	tokens,
} from '#src/tokens/design-tokens.ts';
import type { ColorTokens, DesignTokens } from '#src/tokens/design-tokens.ts';
import { defaultIntentSources } from '#src/tokens/intents.ts';

// Values of the v2 standard. Intentionally duplicated: changing an identity color must fail here.
const officialPink: string = '#FF6AC1';

const midnightValues: readonly string[] = [
	'#F2EFFC',
	'#C3BDDC',
	'#ABA4C9',
	'#9790B8',
	'#6E62A3',
	'#453C7A',
	'#2C2558',
	'#251C5C',
	'#1E1940',
	'#1B1638',
	'#1B1540',
	'#17132F',
	'#13102B',
	'#0F0C24',
	'#0A0819',
	'#080615',
	'#05040E',
];

const scales: (keyof ColorTokens)[] = ['pink', 'indigo', 'midnight'];

describe('pink scale', (): void => {
	it('has the official pink at 400 and its hover at 300', (): void => {
		expect(tokens.color.pink['400']).toBe(officialPink);
		expect(tokens.color.pink['300']).toBe('#FF93D0');
	});
});

describe('indigo scale', (): void => {
	it('has the solid, hover and text indigo of the v2 standard', (): void => {
		expect(tokens.color.indigo['500']).toBe('#5E48D6');
		expect(tokens.color.indigo['400']).toBe('#7560F0');
		expect(tokens.color.indigo['300']).toBe('#8F7AFB');
	});
});

describe('midnight scale', (): void => {
	it('has exactly the neutrals of the v2 standard, from the lightest to the darkest', (): void => {
		expect(Object.keys(tokens.color.midnight)).toEqual([...midnightScaleSteps]);
		expect(Object.values(tokens.color.midnight)).toEqual(midnightValues);
	});
});

describe('color scales', (): void => {
	it('list the pink and indigo steps in order', (): void => {
		expect(Object.keys(tokens.color.pink)).toEqual([...colorScaleSteps]);
		expect(Object.keys(tokens.color.indigo)).toEqual([...colorScaleSteps]);
	});

	it.each(['pink', 'indigo'] as const)(
		'%s gets darker at every step',
		(scale: 'pink' | 'indigo'): void => {
			const luminances: number[] = Object.values(tokens.color[scale]).map(relativeLuminance);

			luminances.slice(1).forEach((luminance: number, index: number): void => {
				expect(luminance).toBeLessThan(luminances[index] ?? 0);
			});
		},
	);

	it.each(scales)('%s is declared as CSS variables', (scale: keyof ColorTokens): void => {
		const variables: Record<string, string> = toCssVariables(tokens);

		Object.entries(tokens.color[scale]).forEach(([step, value]: [string, string]): void => {
			expect(variables[`--mi-color-${scale}-${step}`]).toBe(value);
		});
	});

	it('do not follow a custom official intent', (): void => {
		const custom: Readonly<DesignTokens> = createDesignTokens({
			...defaultIntentSources,
			official: { main: '#A68CFF' },
		});

		expect(custom.color).toEqual(tokens.color);
	});

	it('are frozen', (): void => {
		expect(Object.isFrozen(tokens.color.midnight)).toBe(true);
	});
});
