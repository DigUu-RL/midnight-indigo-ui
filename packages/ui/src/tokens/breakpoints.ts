// Viewport widths where layouts change. Media queries cannot read custom properties, so these are plain values.

/** Window size classes, from phones in portrait to wide desktop monitors. */
export const breakpointNames = ['compact', 'medium', 'expanded', 'large', 'extraLarge'] as const;

export type Breakpoint = (typeof breakpointNames)[number];

/**
 * Minimum width of each class in CSS pixels at the default text size: `compact` phones, `medium` tablets in portrait
 * and large phones in landscape, `expanded` tablets in landscape and small laptops, `large` desktops, `extraLarge`
 * wide monitors.
 */
export const breakpoints: Readonly<Record<Breakpoint, number>> = Object.freeze({
	compact: 0,
	medium: 600,
	expanded: 840,
	large: 1200,
	extraLarge: 1600,
});

// Pixels per `em` in a media query: the browser default font size, which media queries always measure against.
const pixelsPerEm: number = 16;

/**
 * Media query that matches from `breakpoint` up, e.g. `(min-width: 52.5em)` for `expanded`. Widths are in `em`, so a
 * user who enlarges the default text size gets the layout of a narrower viewport, as with zoom.
 */
export const breakpointMediaQuery = (breakpoint: Breakpoint): string => {
	return `(min-width: ${String(breakpoints[breakpoint] / pixelsPerEm)}em)`;
};
