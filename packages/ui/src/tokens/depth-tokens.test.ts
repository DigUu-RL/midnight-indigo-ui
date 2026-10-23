import { describe, expect, it } from 'vitest';

import { contrastRatio, relativeLuminance } from '@/src/tokens/color';
import { contrastMinimums } from '@/src/tokens/contrast';
import { toCssVariables } from '@/src/tokens/css-variables';
import { createDesignTokens, tokens } from '@/src/tokens/design-tokens';
import type { DesignTokens } from '@/src/tokens/design-tokens';
import { defaultIntentSources } from '@/src/tokens/intents';

// Values of the v2 standard. Intentionally duplicated: changing a surface, border or state must fail here.
describe('surface tokens', (): void => {
	it('are the v2 layers', (): void => {
		expect(tokens.surface).toEqual({
			canvas: '#05040E',
			field: '#080615',
			sidebar: '#0A0819',
			tableHeader: '#0F0C24',
			raised: '#13102B',
			dialog: '#17132F',
			overlay: '#1B1638',
		});
	});

	it('no longer declare the removed sunken and base layers', (): void => {
		const variables: Record<string, string> = toCssVariables(tokens);

		expect(variables).not.toHaveProperty('--mi-surface-sunken');
		expect(variables).not.toHaveProperty('--mi-surface-base');
		expect(variables['--mi-surface-table-header']).toBe('#0F0C24');
	});
});

describe('state tokens', (): void => {
	it('have the v2 hover and selected backgrounds', (): void => {
		expect(tokens.state.hover).toBe('#1B1540');
		expect(tokens.state.selected).toBe('#251C5C');
	});

	it('get lighter from hover to pressed to selected', (): void => {
		const luminances: number[] = [
			tokens.state.hover,
			tokens.state.pressed,
			tokens.state.selected,
		].map(relativeLuminance);

		expect(luminances).toEqual(
			[...luminances].sort((first: number, second: number): number => first - second),
		);

		expect(new Set(luminances).size).toBe(3);
	});
});

describe('border tokens', (): void => {
	it('have the v2 subtle, default and strong borders', (): void => {
		expect(tokens.border).toMatchObject({
			subtle: '#1E1940',
			default: '#2C2558',
			strong: '#453C7A',
		});
	});

	it('keep the boundary of controls at 3:1 on the canvas, which strong does not reach', (): void => {
		expect(contrastRatio(tokens.border.control, tokens.surface.canvas)).toBeGreaterThanOrEqual(
			contrastMinimums.nonText,
		);

		expect(contrastRatio(tokens.border.strong, tokens.surface.canvas)).toBeLessThan(
			contrastMinimums.nonText,
		);
	});

	it('offer a dashed strong line for empty states and drop zones', (): void => {
		expect(tokens.stroke.dashed).toBe('1px dashed #453C7A');
	});
});

describe('elevation tokens', (): void => {
	it('have the card, overlay and dialog levels, and no longer low, medium and high', (): void => {
		expect(Object.keys(tokens.elevation)).toEqual([
			'none',
			'card',
			'overlay',
			'dialog',
			'official',
			'brand',
		]);
	});

	it('color the official and brand shadows with the pink and the indigo', (): void => {
		expect(tokens.elevation.official).toContain('rgb(255 106 193 / 0.45)');
		expect(tokens.elevation.brand).toContain('rgb(94 72 214 / 0.45)');
	});

	it('follow the main color of a custom official intent', (): void => {
		const custom: Readonly<DesignTokens> = createDesignTokens({
			...defaultIntentSources,
			official: { main: '#A68CFF' },
		});

		expect(custom.elevation.official).toContain('rgb(166 140 255 / 0.45)');
		expect(custom.elevation.dialog).toBe(tokens.elevation.dialog);
	});
});

describe('backdrop tokens', (): void => {
	it('are the canvas at 72% with a 4px blur', (): void => {
		expect(tokens.backdrop).toEqual({ scrim: 'rgb(5 4 14 / 0.72)', blur: '4px' });
	});
});
