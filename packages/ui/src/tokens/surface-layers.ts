// Order of the surface layers and how much each one stands out from the layer below it.
import { contrastRatio, relativeLuminance } from '@/src/tokens/color';
import type { DesignTokens, SurfaceTokens } from '@/src/tokens/design-tokens';

/** Every surface, from the darkest (the canvas) to the lightest (menus and popovers). */
export const surfaceLayers: readonly (keyof SurfaceTokens)[] = [
	'canvas',
	'field',
	'sidebar',
	'tableHeader',
	'raised',
	'dialog',
	'overlay',
];

export interface SurfaceLayerMeasure {
	surface: keyof SurfaceTokens;
	color: string;
	/** WCAG 2.2 relative luminance. */
	luminance: number;
	/** Luminance gained over the layer below; `undefined` for the canvas. */
	luminanceStep: number | undefined;
	/** Contrast ratio against the layer below; `undefined` for the canvas. */
	ratioToPrevious: number | undefined;
}

/** Measures every layer against the one below it, in the order of `surfaceLayers`. */
export const measureSurfaceLayers = (tokens: Readonly<DesignTokens>): SurfaceLayerMeasure[] => {
	return surfaceLayers.map((surface: keyof SurfaceTokens, index: number): SurfaceLayerMeasure => {
		const color: string = tokens.surface[surface];
		const previousSurface: keyof SurfaceTokens | undefined = surfaceLayers[index - 1];

		const previous: string | undefined =
			previousSurface === undefined ? undefined : tokens.surface[previousSurface];

		const luminance: number = relativeLuminance(color);

		return {
			surface,
			color,
			luminance,
			luminanceStep: previous === undefined ? undefined : luminance - relativeLuminance(previous),
			ratioToPrevious: previous === undefined ? undefined : contrastRatio(color, previous),
		};
	});
};
