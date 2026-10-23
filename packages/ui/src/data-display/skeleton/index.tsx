'use client';
// Placeholder with the shape of content that is still loading.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { forwardAllBut, reducedMotion } from '@/src/shared/appearance';
import { pulse } from '@/src/shared/circular-indicator/index';
import { themeVariables } from '@/src/theme/theme-variables';

export type SkeletonShape = 'text' | 'rectangle' | 'circle';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
	/** `text` is one line of the surrounding font size; `circle` has the `width` as diameter. Defaults to `'text'`. */
	shape?: SkeletonShape;
	/** CSS length. Defaults to the full width (`text`, `rectangle`) or `2.5rem` (`circle`). */
	width?: string;
	/** CSS length. Defaults to one line (`text`), `6rem` (`rectangle`) or the width (`circle`). */
	height?: string;
}

interface SkeletonStyleProps {
	shape: SkeletonShape;
	skeletonWidth: string | undefined;
	skeletonHeight: string | undefined;
}

// A slow loop: the pulse signals activity without drawing attention. It stops under reduced motion.
const pulseDuration: string = '1.6s';

const defaultHeights: Record<SkeletonShape, string> = {
	text: '1lh',
	rectangle: '6rem',
	circle: '2.5rem',
};

const radii: Record<SkeletonShape, string> = {
	text: themeVariables.radius.controlSmall,
	rectangle: themeVariables.radius.control,
	circle: themeVariables.radius.pill,
};

const Placeholder = styled('span', {
	shouldForwardProp: forwardAllBut('shape', 'skeletonWidth', 'skeletonHeight'),
})<SkeletonStyleProps>(({
	shape,
	skeletonWidth,
	skeletonHeight,
}: SkeletonStyleProps): CSSObject => {
	const circle: boolean = shape === 'circle';
	const width: string = skeletonWidth ?? (circle ? defaultHeights.circle : '100%');

	return {
		display: 'block',
		flexShrink: 0,
		width,
		height: skeletonHeight ?? (circle ? width : defaultHeights[shape]),
		borderRadius: radii[shape],
		backgroundColor: themeVariables.surface.overlay,
		animationName: pulse,
		animationDuration: pulseDuration,
		animationTimingFunction: 'ease-in-out',
		animationIterationCount: 'infinite',
		[reducedMotion]: { animationName: 'none' },
	};
});

/**
 * Always hidden from assistive technologies. Mark the region that is loading with `aria-busy="true"` and give it a
 * name, so that screen readers announce the content once, when it arrives.
 */
export const Skeleton = ({
	shape = 'text',
	width,
	height,
	...attributes
}: SkeletonProps): ReactElement => {
	return (
		<Placeholder
			{...attributes}
			aria-hidden='true'
			shape={shape}
			skeletonWidth={width}
			skeletonHeight={height}
		/>
	);
};
