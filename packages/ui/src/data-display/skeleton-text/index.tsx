'use client';
// Placeholder of a paragraph that is still loading: full lines and a shorter last one.
import { styled } from '@mui/material/styles';
import type { ReactElement } from 'react';

import { themeVariables } from '#src/theme/theme-variables.ts';
import { LoadingStatus } from '#src/data-display/loading-status/index.tsx';
import type { LoadingStatusProps } from '#src/data-display/loading-status/index.tsx';
import { Skeleton } from '#src/data-display/skeleton/index.tsx';

export interface SkeletonTextProps extends LoadingStatusProps {
	/** Number of lines. Defaults to `3`. */
	lines?: number;
}

const Lines = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: themeVariables.spacing[2],
});

/** A status region: it announces `label` once, and the lines are hidden from assistive technologies. */
export const SkeletonText = ({ lines = 3, ...props }: SkeletonTextProps): ReactElement => {
	const count: number = Math.max(1, Math.floor(lines));

	return (
		<LoadingStatus {...props}>
			<Lines>
				{Array.from({ length: count }, (_: unknown, index: number): ReactElement => {
					return <Skeleton key={index} width={index === count - 1 && count > 1 ? '60%' : '100%'} />;
				})}
			</Lines>
		</LoadingStatus>
	);
};
