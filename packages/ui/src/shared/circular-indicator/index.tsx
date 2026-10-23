'use client';
// Ring drawn by the circular progress indicator and by buttons in their loading state. Hidden from assistive
// technologies: the component around it carries the role, the name and the value.
import { keyframes, styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ReactElement } from 'react';

type Keyframes = ReturnType<typeof keyframes>;

import { forwardAllBut, reducedMotion } from '@/src/shared/appearance';

interface CircularIndicatorProps {
	/** Completed fraction, from 0 to 1. Leave it out while the duration is unknown. */
	fraction?: number | undefined;
	/** CSS length of the side. */
	size: string;
	/** Color of the remaining part of the ring; transparent by default. The arc uses `currentColor`. */
	trackColor?: string;
}

interface RingProps {
	indeterminate: boolean;
	ringSize: string;
}

const radius: number = 9;
const strokeWidth: number = 3;
const circumference: number = 2 * Math.PI * radius;
const indeterminateArcFraction: number = 0.25;

// Loops of an activity indicator, longer than the transition durations of the motion tokens.
const rotationDuration: string = '0.9s';
const pulseDuration: string = '1.6s';

const rotation: Keyframes = keyframes({ to: { transform: 'rotate(360deg)' } });
export const pulse: Keyframes = keyframes({ '50%': { opacity: 0.4 } });

/** Under reduced motion an unknown progress pulses in place instead of moving. */
export const indeterminatePulseStyles: CSSObject = {
	animationName: pulse,
	animationDuration: pulseDuration,
	animationTimingFunction: 'ease-in-out',
	animationIterationCount: 'infinite',
};

const Ring = styled('svg', {
	shouldForwardProp: forwardAllBut('indeterminate', 'ringSize'),
})<RingProps>(({ indeterminate, ringSize }: RingProps): CSSObject => {
	return {
		width: ringSize,
		height: ringSize,
		flexShrink: 0,
		...(indeterminate
			? {
					animationName: rotation,
					animationDuration: rotationDuration,
					animationTimingFunction: 'linear',
					animationIterationCount: 'infinite',
					// A full ring, so that the still arc is not read as a value.
					[reducedMotion]: {
						...indeterminatePulseStyles,
						'& > circle:last-of-type': { strokeDashoffset: 0 },
					},
				}
			: {}),
	};
});

export const CircularIndicator = ({
	fraction,
	size,
	trackColor = 'transparent',
}: CircularIndicatorProps): ReactElement => {
	const indeterminate: boolean = fraction === undefined;
	const visibleFraction: number = fraction ?? indeterminateArcFraction;

	return (
		<Ring
			viewBox='0 0 24 24'
			aria-hidden='true'
			focusable='false'
			indeterminate={indeterminate}
			ringSize={size}
		>
			<circle
				cx='12'
				cy='12'
				r={radius}
				fill='none'
				stroke={trackColor}
				strokeWidth={strokeWidth}
			/>

			<circle
				cx='12'
				cy='12'
				r={radius}
				fill='none'
				stroke='currentColor'
				strokeWidth={strokeWidth}
				strokeLinecap='round'
				strokeDasharray={circumference}
				strokeDashoffset={circumference * (1 - visibleFraction)}
				transform='rotate(-90 12 12)'
			/>
		</Ring>
	);
};
