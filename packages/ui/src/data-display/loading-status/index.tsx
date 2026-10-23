'use client';
// Status region of the skeleton layouts: assistive technologies hear the label once, instead of the placeholders.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import { visuallyHiddenStyles } from '@/src/shared/appearance';

/** Text announced while content loads. Translate it with the rest of the interface. */
export const defaultLoadingLabel: string = 'Loading';

/** Texts of the loading status, which `SkeletonText` and `SkeletonList` render. */
export interface LoadingStatusLabels {
	/** Announced when the placeholders appear. */
	loading: string;
}

const defaultLoadingStatusLabels: Readonly<LoadingStatusLabels> = Object.freeze({
	loading: defaultLoadingLabel,
});

export interface LoadingStatusProps extends Omit<ComponentPropsWithRef<'div'>, 'role'> {
	/** Announced when the placeholders appear. Defaults to the provided `loadingStatus.loading`, or `'Loading'`. */
	label?: string;
}

const HiddenLabel = styled('span')(visuallyHiddenStyles);

export const LoadingStatus = ({
	label,
	children,
	...attributes
}: LoadingStatusProps & { children: ReactNode }): ReactElement => {
	const texts: LoadingStatusLabels = useComponentLabels(
		'loadingStatus',
		defaultLoadingStatusLabels,
		label === undefined ? undefined : { loading: label },
	);

	return (
		<div {...attributes} role='status'>
			<HiddenLabel>{texts.loading}</HiddenLabel>
			{children}
		</div>
	);
};
