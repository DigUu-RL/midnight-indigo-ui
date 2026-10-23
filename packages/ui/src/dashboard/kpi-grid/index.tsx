'use client';
// The key figures of a page, side by side: a named list of `StatCard`, as many per row as fit.
import { styled } from '@mui/material/styles';
import type { ReactElement } from 'react';

import { StatCard } from '@/src/data-display/stat-card/index';
import type { StatCardProps } from '@/src/data-display/stat-card/index';
import { Grid, GridItem } from '@/src/layout/grid/index';
import type { GridProps } from '@/src/layout/grid/index';
import { themeVariables } from '@/src/theme/theme-variables';

/** One key figure: the props of a `StatCard`, plus an `id` unique within the grid. */
export interface KpiItem extends Omit<StatCardProps, 'loading' | 'ref'> {
	id: string;
}

export interface KpiGridProps extends Omit<
	GridProps,
	'as' | 'columns' | 'minColumnWidth' | 'children'
> {
	/** Names the list, e.g. `'Key figures'`. */
	label: string;
	items: readonly KpiItem[];
	/** Shows every card with a placeholder in place of its value, e.g. while the figures load. */
	loading?: boolean;
	/** Minimum width of a card: the grid fits as many as the width allows. Defaults to `'14rem'`. */
	minColumnWidth?: string;
	/** Step of the spacing scale between the cards. Defaults to `card.gridGap` (20 px). */
	gap?: NonNullable<GridProps['gap']>;
}

// The cards of a row share the height of the tallest.
const Card = styled(StatCard)({ height: '100%' });

// Declared after the gap of `Grid`, so it replaces it. Every prop reaches `Grid`, `as` included, which the wrapper would
// otherwise render by itself.
const CardGrid = styled(Grid, { shouldForwardProp: (): boolean => true })({
	gap: themeVariables.card.gridGap,
});

/** A list (`ul`) named by `label`, so the number of figures is announced, with a `StatCard` (a named group) per item. */
export const KpiGrid = ({
	label,
	items,
	loading = false,
	minColumnWidth = '14rem',
	gap,
	...attributes
}: KpiGridProps): ReactElement => {
	const cards: ReactElement[] = items.map(({ id, ...card }: KpiItem): ReactElement => {
		return (
			<GridItem key={id} as='li'>
				<Card {...card} loading={loading} />
			</GridItem>
		);
	});

	return gap === undefined ? (
		<CardGrid {...attributes} as='ul' aria-label={label} minColumnWidth={minColumnWidth}>
			{cards}
		</CardGrid>
	) : (
		<Grid {...attributes} as='ul' aria-label={label} minColumnWidth={minColumnWidth} gap={gap}>
			{cards}
		</Grid>
	);
};
