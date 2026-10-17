import { describe, expect, it } from 'vitest';

import { contrastRatio } from '#src/tokens/color.ts';
import {
	createDesignTokens,
	surfaceTokens,
	textTokens,
	tokens,
} from '#src/tokens/design-tokens.ts';
import {
	brandMainColor,
	defaultIntentSources,
	deriveIntentTokens,
	officialMainColor,
	semanticIntents,
} from '#src/tokens/intents.ts';
import type { DesignTokens } from '#src/tokens/design-tokens.ts';
import type {
	IntentDerivationContext,
	IntentSources,
	IntentTokens,
	SemanticIntent,
} from '#src/tokens/intents.ts';

// Source value: `keyword` in `tools/theme/theme-palette.ts` of the Midnight Indigo repository.
// This literal is intentionally duplicated: changing the brand pink must fail here.
const officialPinkSource: string = '#FF6AC1';

const context: IntentDerivationContext = {
	canvas: surfaceTokens.canvas,
	lightestSurface: surfaceTokens.overlay,
	lightInk: textTokens.primary,
	darkInk: textTokens.inverse,
};

describe('official pink', (): void => {
	it('is exactly the Midnight Indigo keyword pink', (): void => {
		expect(officialMainColor).toBe(officialPinkSource);
		expect(defaultIntentSources.official.main).toBe(officialPinkSource);
		expect(tokens.intent.official.main).toBe(officialPinkSource);
	});

	it('keeps dark text on the pink fill, as the accessibility hypothesis states', (): void => {
		expect(tokens.intent.official.contrastText).toBe(textTokens.inverse);
	});
});

describe('brand indigo', (): void => {
	it('is the solid indigo of the color scale', (): void => {
		expect(brandMainColor).toBe('#5E48D6');
		expect(tokens.intent.brand.main).toBe(tokens.color.indigo['500']);
	});

	it('keeps 4.5:1 for the light label of a solid brand control in every state', (): void => {
		const { contrastText, main, hover, pressed }: IntentTokens = tokens.intent.brand;

		expect(contrastText).toBe(textTokens.primary);

		[main, hover, pressed].forEach((fill: string): void => {
			expect(contrastRatio(contrastText, fill)).toBeGreaterThanOrEqual(4.5);
		});
	});

	it('pins a hover lighter than main, since the derived one misses 4.5:1', (): void => {
		const derived: IntentTokens = deriveIntentTokens({ main: brandMainColor }, context);

		expect(contrastRatio(derived.contrastText, derived.hover)).toBeLessThan(4.5);
		expect(tokens.intent.brand.hover).toBe('#664FDE');
	});
});

describe('semantic intents', (): void => {
	it('are exactly the seven public intents', (): void => {
		expect(semanticIntents).toEqual([
			'official',
			'brand',
			'default',
			'success',
			'warning',
			'error',
			'info',
		]);
	});

	it('all expose the same fields', (): void => {
		const officialFields: string[] = Object.keys(tokens.intent.official).toSorted();

		semanticIntents.forEach((intent: SemanticIntent): void => {
			expect(Object.keys(tokens.intent[intent]).toSorted()).toEqual(officialFields);
		});
	});
});

describe('deriveIntentTokens', (): void => {
	it('is deterministic', (): void => {
		expect(deriveIntentTokens({ main: '#36C995' }, context)).toEqual(
			deriveIntentTokens({ main: '#36C995' }, context),
		);
	});

	it('normalizes the main color', (): void => {
		expect(deriveIntentTokens({ main: '#f6c' }, context).main).toBe('#FF66CC');
	});

	it('lets explicit fields override derived ones', (): void => {
		const derived: IntentTokens = deriveIntentTokens(
			{ main: '#36C995', container: '#0a2a20' },
			context,
		);

		expect(derived.container).toBe('#0A2A20');
		expect(derived.hover).toBe(deriveIntentTokens({ main: '#36C995' }, context).hover);
	});

	it('guarantees legible text and borders even for a dim main color', (): void => {
		const derived: IntentTokens = deriveIntentTokens({ main: '#3A2A5E' }, context);

		expect(contrastRatio(derived.text, context.lightestSurface)).toBeGreaterThanOrEqual(4.5);
		expect(contrastRatio(derived.border, context.lightestSurface)).toBeGreaterThanOrEqual(3);

		expect(contrastRatio(derived.onContainer, derived.containerPressed)).toBeGreaterThanOrEqual(
			4.5,
		);
	});

	it('rejects an invalid main color with an explanatory error', (): void => {
		expect((): unknown => deriveIntentTokens({ main: '#nope' }, context)).toThrow(
			/Invalid color "#nope"/,
		);
	});
});

describe('createDesignTokens', (): void => {
	it('reflects a custom official.main in the intent and in the accents derived from it', (): void => {
		const sources: IntentSources = { ...defaultIntentSources, official: { main: '#A68CFF' } };
		const custom: Readonly<DesignTokens> = createDesignTokens(sources);

		expect(custom.intent.official.main).toBe('#A68CFF');
		expect(custom.accent.link).toBe(custom.intent.official.text);
		expect(tokens.intent.official.main).toBe(officialPinkSource);
	});

	it('draws focus in the official pink and selected text in the brand indigo', (): void => {
		const sources: IntentSources = { ...defaultIntentSources, brand: { main: '#3F8CFF' } };
		const custom: Readonly<DesignTokens> = createDesignTokens(sources);

		expect(tokens.focus).toEqual({ ring: officialPinkSource, width: '2px', offset: '2px' });
		expect(tokens.accent.selection).toBe(tokens.intent.brand.containerPressed);
		expect(custom.accent.selection).toBe(custom.intent.brand.containerPressed);
		expect(custom.accent.selection).not.toBe(tokens.accent.selection);
	});

	it('returns a frozen token tree', (): void => {
		expect(Object.isFrozen(tokens)).toBe(true);
		expect(Object.isFrozen(tokens.intent.official)).toBe(true);
		expect(Object.isFrozen(tokens.chart.series)).toBe(true);
	});
});
