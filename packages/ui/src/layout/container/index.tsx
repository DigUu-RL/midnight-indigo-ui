'use client';
// Centers the content of a page or a section and limits its line length, with side gutters that grow with the viewport.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { responsiveStyles } from '#src/shared/responsive.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SpacingStep } from '#src/tokens/index.ts';

const { spacing }: typeof themeVariables = themeVariables;

/** Maximum width: `small` 40 rem (forms, reading), `medium` 64 rem, `large` 80 rem (dashboards), `full` none. */
export type ContainerSize = 'small' | 'medium' | 'large' | 'full';

export type ContainerElement = 'div' | 'main' | 'section' | 'article' | 'header' | 'footer';

export interface ContainerProps extends ComponentPropsWithRef<'div'> {
	/** Defaults to `'div'`. Use `'main'` once per page, for its main content. */
	as?: ContainerElement;
	/** Defaults to `'large'`. */
	size?: ContainerSize;
	/** Side padding of 16, 24 and 32 px (`compact`, `medium`, `expanded` and up). Defaults to `true`. */
	gutters?: boolean;
}

interface ContainerStyleProps {
	containerSize: ContainerSize;
	gutters: boolean;
}

const maximumWidths: Record<ContainerSize, string> = {
	small: '40rem',
	medium: '64rem',
	large: '80rem',
	full: 'none',
};

const gutterSteps: Readonly<Record<'compact' | 'medium' | 'expanded', SpacingStep>> = {
	compact: '4',
	medium: '6',
	expanded: '8',
};

const StyledContainer = styled('div', {
	shouldForwardProp: forwardAllBut('containerSize', 'gutters'),
})<ContainerStyleProps>(({ containerSize, gutters }: ContainerStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		width: '100%',
		maxWidth: maximumWidths[containerSize],
		marginInline: 'auto',
		minWidth: 0,
		...(gutters
			? responsiveStyles(gutterSteps, (step: SpacingStep): CSSObject => {
					return { paddingInline: spacing[step] };
				})
			: {}),
	};
});

export const Container = ({
	as: element = 'div',
	size = 'large',
	gutters = true,
	...attributes
}: ContainerProps): ReactElement => {
	return <StyledContainer {...attributes} as={element} containerSize={size} gutters={gutters} />;
};
