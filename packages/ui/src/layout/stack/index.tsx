'use client';
// Lays its children out in a column or a row with a gap from the spacing scale.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { responsiveStyles } from '#src/shared/responsive.ts';
import type { Responsive } from '#src/shared/responsive.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SpacingStep } from '#src/tokens/index.ts';

const { spacing }: typeof themeVariables = themeVariables;

export type StackDirection = 'column' | 'row';

/** Alignment across the direction of the stack. */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/** Distribution along the direction of the stack. */
export type StackJustify = 'start' | 'center' | 'end' | 'between';

/** Lists are rendered without bullets or indentation; their items keep the list semantics. */
export type StackElement = 'div' | 'section' | 'article' | 'header' | 'footer' | 'ul' | 'ol';

export interface StackProps extends ComponentPropsWithRef<'div'> {
	/** Defaults to `'div'`. */
	as?: StackElement;
	/** Defaults to `'column'`; responsive, e.g. `{ compact: 'column', medium: 'row' }`. */
	direction?: Responsive<StackDirection>;
	/** Step of the spacing scale between children. Defaults to `'4'` (16 px); responsive. */
	gap?: Responsive<SpacingStep>;
	/** Defaults to `'stretch'`. */
	align?: StackAlign;
	/** Defaults to `'start'`. */
	justify?: StackJustify;
	/** Wraps children onto new lines when a row runs out of room, e.g. a row of buttons at high zoom. */
	wrap?: boolean;
}

interface StackStyleProps {
	stackDirection: Responsive<StackDirection>;
	stackGap: Responsive<SpacingStep>;
	stackAlign: StackAlign;
	stackJustify: StackJustify;
	stackWrap: boolean;
}

const alignments: Record<StackAlign, string> = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
	stretch: 'stretch',
	baseline: 'baseline',
};

const distributions: Record<StackJustify, string> = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
	between: 'space-between',
};

const StyledStack = styled('div', {
	shouldForwardProp: forwardAllBut(
		'stackDirection',
		'stackGap',
		'stackAlign',
		'stackJustify',
		'stackWrap',
	),
})<StackStyleProps>(({
	stackDirection,
	stackGap,
	stackAlign,
	stackJustify,
	stackWrap,
}: StackStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'flex',
		minWidth: 0,
		margin: 0,
		padding: 0,
		listStyle: 'none',
		alignItems: alignments[stackAlign],
		justifyContent: distributions[stackJustify],
		flexWrap: stackWrap ? 'wrap' : 'nowrap',
		...responsiveStyles(stackDirection, (direction: StackDirection): CSSObject => {
			return { flexDirection: direction };
		}),
		...responsiveStyles(stackGap, (step: SpacingStep): CSSObject => ({ gap: spacing[step] })),
	};
});

export const Stack = ({
	as: element = 'div',
	direction = 'column',
	gap = '4',
	align = 'stretch',
	justify = 'start',
	wrap = false,
	...attributes
}: StackProps): ReactElement => {
	return (
		<StyledStack
			{...attributes}
			as={element}
			stackDirection={direction}
			stackGap={gap}
			stackAlign={align}
			stackJustify={justify}
			stackWrap={wrap}
		/>
	);
};
