'use client';
// Progress of an operation, known (determinate) or not (indeterminate), as a bar or a ring.
import { keyframes, styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

type Keyframes = ReturnType<typeof keyframes>;

import { assertLabel, forwardAllBut, reducedMotion } from '../../shared/appearance.ts';
import type { ControlSize } from '../../shared/appearance.ts';
import {
	CircularIndicator,
	indeterminatePulseStyles,
} from '../../shared/circular-indicator/index.tsx';
import { themeVariables } from '../../theme/theme-variables.ts';
import type { SemanticIntent } from '../../tokens/index.ts';

const { radius, motion, intent: intentVariables }: typeof themeVariables = themeVariables;

export type ProgressBarShape = 'linear' | 'circular';

export type ProgressBarSize = ControlSize;

export interface ProgressBarProps extends Omit<
	ComponentPropsWithRef<'div'>,
	'children' | 'aria-label'
> {
	/** Accessible name: what is progressing, e.g. `'Uploading report.pdf'`. Cannot be blank. */
	label: string;
	/** Current value between `min` and `max`. Leave it out while the duration is unknown (indeterminate). */
	value?: number;
	/** Defaults to 0. */
	min?: number;
	/** Defaults to 100. */
	max?: number;
	/** Readable value for assistive technologies when a percentage is not meaningful, e.g. `'Step 2 of 5'`. */
	valueText?: string;
	/** Defaults to `'linear'`. */
	shape?: ProgressBarShape;
	/** Defaults to `'official'`. */
	intent?: SemanticIntent;
	/** Thickness of the bar (4, 6 or 8 px) or side of the ring (16, 24 or 40 px). Defaults to `'medium'`. */
	size?: ProgressBarSize;
}

interface TrackStyleProps {
	barIntent: SemanticIntent;
	barSize: ProgressBarSize;
}

interface IndicatorStyleProps {
	fraction: number | undefined;
}

const thicknesses: Record<ProgressBarSize, string> = {
	small: '0.25rem',
	medium: '0.375rem',
	large: '0.5rem',
};

const ringSides: Record<ProgressBarSize, string> = {
	small: '1rem',
	medium: '1.5rem',
	large: '2.5rem',
};

// One sweep of the indeterminate segment, a loop longer than the transition durations of the motion tokens.
const sweepDuration: string = '1.4s';
const indeterminateSegmentWidth: string = '40%';

const sweep: Keyframes = keyframes({
	// The segment is 40% of the track, so 250% of its own width crosses the whole track.
	from: { transform: 'translateX(-100%)' },
	to: { transform: `translateX(250%)` },
});

// The track is the soft container of the intent; `main` on it is part of the contrast audit (3:1).
const Track = styled('div', {
	shouldForwardProp: forwardAllBut('barIntent', 'barSize'),
})<TrackStyleProps>(({ barIntent, barSize }: TrackStyleProps): CSSObject => {
	return {
		position: 'relative',
		width: '100%',
		height: thicknesses[barSize],
		overflow: 'hidden',
		borderRadius: radius.pill,
		backgroundColor: intentVariables[barIntent].container,
		color: intentVariables[barIntent].main,
	};
});

const Indicator = styled('div', {
	shouldForwardProp: forwardAllBut('fraction'),
})<IndicatorStyleProps>(({ fraction }: IndicatorStyleProps): CSSObject => {
	const base: CSSObject = {
		position: 'absolute',
		insetBlock: 0,
		insetInlineStart: 0,
		borderRadius: 'inherit',
		backgroundColor: 'currentColor',
	};

	if (fraction !== undefined) {
		return {
			...base,
			width: '100%',
			transform: `scaleX(${String(fraction)})`,
			transformOrigin: 'left',
			transitionProperty: 'transform',
			transitionDuration: motion.duration.moderate,
			transitionTimingFunction: motion.easing.standard,
			'[dir="rtl"] &': { transformOrigin: 'right' },
		};
	}

	return {
		...base,
		width: indeterminateSegmentWidth,
		animationName: sweep,
		animationDuration: sweepDuration,
		animationTimingFunction: motion.easing.standard,
		animationIterationCount: 'infinite',
		// A full bar pulsing in place: a still segment would be read as a value.
		[reducedMotion]: { ...indeterminatePulseStyles, width: '100%', transform: 'none' },
	};
});

const Ring = styled('div', { shouldForwardProp: forwardAllBut('barIntent') })<{
	barIntent: SemanticIntent;
}>(({ barIntent }: { barIntent: SemanticIntent }): CSSObject => {
	return { display: 'inline-flex', color: intentVariables[barIntent].main };
});

const clampFraction = (value: number, min: number, max: number): number => {
	return max > min ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
};

/** `role="progressbar"`; without `value`, the value attributes are left out, as ARIA prescribes. */
export const ProgressBar = ({
	label,
	value,
	min = 0,
	max = 100,
	valueText,
	shape = 'linear',
	intent = 'official',
	size = 'medium',
	...attributes
}: ProgressBarProps): ReactElement => {
	const fraction: number | undefined =
		value === undefined ? undefined : clampFraction(value, min, max);

	const valueAttributes: Record<string, number | string | undefined> =
		value === undefined
			? {}
			: {
					'aria-valuenow': Math.min(Math.max(value, min), max),
					'aria-valuemin': min,
					'aria-valuemax': max,
					'aria-valuetext': valueText,
				};

	const indicator: ReactElement =
		shape === 'linear' ? (
			<Track barIntent={intent} barSize={size}>
				<Indicator fraction={fraction} />
			</Track>
		) : (
			<Ring barIntent={intent}>
				<CircularIndicator
					fraction={fraction}
					size={ringSides[size]}
					trackColor={intentVariables[intent].container}
				/>
			</Ring>
		);

	return (
		<div
			{...attributes}
			role='progressbar'
			aria-label={assertLabel(label, 'The label of a ProgressBar')}
			{...valueAttributes}
		>
			{indicator}
		</div>
	);
};
