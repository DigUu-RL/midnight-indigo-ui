import { describe, expect, it } from 'vitest';

import { contrastRatio } from './color.ts';
import { createDesignTokens, surfaceTokens, textTokens, tokens } from './design-tokens.ts';
import {
	defaultIntentSources,
	deriveIntentTokens,
	officialMainColor,
	semanticIntents,
} from './intents.ts';
import type { DesignTokens } from './design-tokens.ts';
import type {
	IntentDerivationContext,
	IntentSources,
	IntentTokens,
	SemanticIntent,
} from './intents.ts';

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

describe('semantic intents', (): void => {
	it('are exactly the six public intents', (): void => {
		expect(semanticIntents).toEqual(['official', 'default', 'success', 'warning', 'error', 'info']);
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

	it('returns a frozen token tree', (): void => {
		expect(Object.isFrozen(tokens)).toBe(true);
		expect(Object.isFrozen(tokens.intent.official)).toBe(true);
		expect(Object.isFrozen(tokens.chart.series)).toBe(true);
	});
});
