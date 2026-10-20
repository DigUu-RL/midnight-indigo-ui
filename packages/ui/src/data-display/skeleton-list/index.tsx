'use client';
// Placeholder of a `List` that is still loading: rows with an optional leading circle and two lines of text.
import { styled } from '@mui/material/styles';
import type { ReactElement } from 'react';

import { themeVariables } from '#src/theme/theme-variables.ts';
import { LoadingStatus } from '#src/data-display/loading-status/index.tsx';
import type { LoadingStatusProps } from '#src/data-display/loading-status/index.tsx';
import { Skeleton } from '#src/data-display/skeleton/index.tsx';

const { spacing, border }: typeof themeVariables = themeVariables;

export interface SkeletonListProps extends LoadingStatusProps {
	/** Number of rows. Defaults to `3`. */
	items?: number;
	/** Shows a circle before each row, as for an `Avatar`. Defaults to `false`. */
	withLeading?: boolean;
}

const Row = styled('div')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[3],
	padding: `${spacing[3]} 0`,
	'& + &': { borderTop: `1px solid ${border.subtle}` },
});

const Text = styled('div')({ display: 'flex', flex: 1, flexDirection: 'column', gap: spacing[1] });

/** A status region: it announces `label` once, and the rows are hidden from assistive technologies. */
export const SkeletonList = ({
	items = 3,
	withLeading = false,
	...props
}: SkeletonListProps): ReactElement => {
	const count: number = Math.max(1, Math.floor(items));

	return (
		<LoadingStatus {...props}>
			{Array.from({ length: count }, (_: unknown, index: number): ReactElement => {
				return (
					<Row key={index}>
						{withLeading ? <Skeleton shape='circle' /> : null}

						<Text>
							<Skeleton width='40%' />
							<Skeleton width='70%' />
						</Text>
					</Row>
				);
			})}
		</LoadingStatus>
	);
};
