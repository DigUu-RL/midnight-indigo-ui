'use client';
// Two-dimensional layout: equal columns per breakpoint, or as many columns of a minimum width as fit.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { responsiveStyles } from '#src/shared/responsive.ts';
import type { Responsive } from '#src/shared/responsive.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SpacingStep } from '#src/tokens/index.ts';

const { spacing }: typeof themeVariables = themeVariables;

export type GridElement = 'div' | 'section' | 'ul' | 'ol';

export type GridItemElement = 'div' | 'section' | 'article' | 'li';

/** Either a number of equal columns (responsive) or the minimum width of a column, never both. */
type GridColumnProps =
	| {
			/** Number of equal columns. Defaults to 1; responsive, e.g. `{ compact: 1, medium: 2, large: 4 }`. */
			columns?: Responsive<number>;
			minColumnWidth?: never;
	  }
	| {
			/**
			 * Minimum width of a column, e.g. `'16rem'`: the grid fits as many as the width allows, without media queries,
			 * and never more than one on a viewport narrower than that.
			 */
			minColumnWidth: string;
			columns?: never;
	  };

export type GridProps = Omit<ComponentPropsWithRef<'div'>, 'children'> &
	GridColumnProps & {
		/** Defaults to `'div'`; use a list when the items are a collection, with `GridItem as='li'`. */
		as?: GridElement;
		/** Step of the spacing scale between rows and columns. Defaults to `'4'` (16 px); responsive. */
		gap?: Responsive<SpacingStep>;
		children?: ComponentPropsWithRef<'div'>['children'];
	};

/** Number of columns an item spans, or `'full'` for the whole row. */
export type GridSpan = number | 'full';

export interface GridItemProps extends ComponentPropsWithRef<'div'> {
	/** Defaults to `'div'`. */
	as?: GridItemElement;
	/** Defaults to 1; responsive, e.g. `{ compact: 'full', expanded: 2 }`. */
	span?: Responsive<GridSpan>;
}

interface GridStyleProps {
	gridColumns: Responsive<number> | undefined;
	minColumnWidth: string | undefined;
	gridGap: Responsive<SpacingStep>;
}

const equalColumns = (count: number): CSSObject => {
	return { gridTemplateColumns: `repeat(${String(count)}, minmax(0, 1fr))` };
};

const StyledGrid = styled('div', {
	shouldForwardProp: forwardAllBut('gridColumns', 'minColumnWidth', 'gridGap'),
})<GridStyleProps>(({ gridColumns, minColumnWidth, gridGap }: GridStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'grid',
		minWidth: 0,
		margin: 0,
		padding: 0,
		listStyle: 'none',
		// `min()` keeps a single column narrower than the minimum on a narrow viewport instead of overflowing.
		...(minColumnWidth === undefined
			? responsiveStyles(gridColumns ?? 1, equalColumns)
			: {
					gridTemplateColumns: `repeat(auto-fill, minmax(min(${minColumnWidth}, 100%), 1fr))`,
				}),
		...responsiveStyles(gridGap, (step: SpacingStep): CSSObject => ({ gap: spacing[step] })),
	};
});

const StyledGridItem = styled('div', {
	shouldForwardProp: forwardAllBut('gridSpan'),
})<{ gridSpan: Responsive<GridSpan> }>(({
	gridSpan,
}: {
	gridSpan: Responsive<GridSpan>;
}): CSSObject => {
	return {
		boxSizing: 'border-box',
		minWidth: 0,
		...responsiveStyles(gridSpan, (span: GridSpan): CSSObject => {
			return {
				gridColumn: span === 'full' ? '1 / -1' : `span ${String(span)} / span ${String(span)}`,
			};
		}),
	};
});

export const Grid = ({
	as: element = 'div',
	columns,
	minColumnWidth,
	gap = '4',
	...attributes
}: GridProps): ReactElement => {
	return (
		<StyledGrid
			{...attributes}
			as={element}
			gridColumns={columns}
			minColumnWidth={minColumnWidth}
			gridGap={gap}
		/>
	);
};

export const GridItem = ({
	as: element = 'div',
	span = 1,
	...attributes
}: GridItemProps): ReactElement => {
	return <StyledGridItem {...attributes} as={element} gridSpan={span} />;
};
