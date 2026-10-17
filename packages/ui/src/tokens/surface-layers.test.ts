import { describe, expect, it } from 'vitest';

import { tokens } from '#src/tokens/design-tokens.ts';
import { measureSurfaceLayers, surfaceLayers } from '#src/tokens/surface-layers.ts';
import type { SurfaceLayerMeasure } from '#src/tokens/surface-layers.ts';

describe('surfaceLayers', (): void => {
	it('lists every surface token exactly once', (): void => {
		expect([...surfaceLayers].sort()).toEqual(Object.keys(tokens.surface).sort());
	});

	it('follows the declaration order of the surface tokens', (): void => {
		expect([...surfaceLayers]).toEqual(Object.keys(tokens.surface));
	});
});

describe('measureSurfaceLayers', (): void => {
	const layers: SurfaceLayerMeasure[] = measureSurfaceLayers(tokens);

	it('starts at the canvas, which has no layer below it', (): void => {
		expect(layers[0]).toMatchObject({
			surface: 'canvas',
			color: tokens.surface.canvas,
			luminanceStep: undefined,
			ratioToPrevious: undefined,
		});
	});

	it.each(
		layers
			.slice(1)
			.map((layer: SurfaceLayerMeasure): [string, SurfaceLayerMeasure] => [layer.surface, layer]),
	)('%s is lighter than the layer below it', (_: string, layer: SurfaceLayerMeasure): void => {
		expect(layer.luminanceStep).toBeGreaterThan(0);
		expect(layer.ratioToPrevious).toBeGreaterThan(1);
	});

	it('measures the step between neighbors from their luminance', (): void => {
		layers.slice(1).forEach((layer: SurfaceLayerMeasure, index: number): void => {
			const below: SurfaceLayerMeasure | undefined = layers[index];

			expect(layer.luminanceStep).toBeCloseTo(layer.luminance - (below?.luminance ?? 0), 10);
		});
	});

	it('ends at the overlay, the lightest layer', (): void => {
		const luminances: number[] = layers.map(
			(layer: SurfaceLayerMeasure): number => layer.luminance,
		);

		expect(layers.at(-1)?.surface).toBe('overlay');
		expect(Math.max(...luminances)).toBe(layers.at(-1)?.luminance);
	});
});
