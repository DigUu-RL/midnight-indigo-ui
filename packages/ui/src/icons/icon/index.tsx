// SVG icon that is either named for assistive technologies (functional) or hidden from them (decorative).
import type { ReactElement, ReactNode, SVGProps } from 'react';

import { themeVariables } from '@/src/theme/theme-variables';

/** A token size from `iconSize`, or `'inherit'` to follow the font size of the surrounding text (`1em`). */
export type IconSize = 'small' | 'medium' | 'large' | 'inherit';

/**
 * Every icon states its role. A functional icon conveys information on its own and needs a `label`. A decorative
 * icon repeats information already in text, or sits inside a control that is named by its own text or
 * `aria-label`, and is hidden from the accessibility tree. The type rejects both and neither.
 */
export type IconAccessibility =
	{ label: string; decorative?: never } | { decorative: true; label?: never };

export interface IconAccessibilityAttributes {
	role?: 'img';
	'aria-label'?: string;
	'aria-hidden'?: true;
	focusable?: 'false';
}

/**
 * Accessibility attributes of an icon, for any icon component (e.g. a third-party icon set). Throws on a blank
 * label: an empty name hides a functional icon as effectively as `aria-hidden`.
 */
export const iconAccessibilityProps = (
	accessibility: IconAccessibility,
): IconAccessibilityAttributes => {
	if (accessibility.decorative === true) return { 'aria-hidden': true, focusable: 'false' };

	if (accessibility.label.trim() === '') {
		throw new TypeError(
			'An icon label cannot be blank. Describe what the icon conveys, or mark it as decorative.',
		);
	}

	return { role: 'img', 'aria-label': accessibility.label };
};

type SvgAttributes = Omit<
	SVGProps<SVGSVGElement>,
	'aria-hidden' | 'aria-label' | 'aria-labelledby' | 'children' | 'focusable' | 'ref' | 'role'
>;

export type IconProps = SvgAttributes &
	IconAccessibility & {
		/** Shapes drawn in `viewBox` (default `0 0 24 24`), filled with the current text color. */
		children: ReactNode;
		/** Defaults to `'inherit'`. */
		size?: IconSize;
	};

/**
 * Renders inline SVG content as an icon. It is not tied to any icon set: pass the paths of the icon, or use
 * `iconAccessibilityProps` with an icon component. The color is `currentColor`, so an icon takes the color of its
 * text; a functional icon needs 3:1 against its background, which every text and intent token used for text meets.
 */
export const Icon = ({
	children,
	label,
	decorative,
	size = 'inherit',
	viewBox = '0 0 24 24',
	style,
	...svgAttributes
}: IconProps): ReactElement => {
	const dimension: string = size === 'inherit' ? '1em' : themeVariables.iconSize[size];
	const accessibility: IconAccessibility = decorative === true ? { decorative } : { label };

	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox={viewBox}
			fill='currentColor'
			{...svgAttributes}
			{...iconAccessibilityProps(accessibility)}
			style={{ width: dimension, height: dimension, flexShrink: 0, ...style }}
		>
			{children}
		</svg>
	);
};
