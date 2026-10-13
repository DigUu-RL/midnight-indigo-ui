'use client';
// Status region of the skeleton layouts: assistive technologies hear the label once, instead of the placeholders.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { visuallyHiddenStyles } from '#src/shared/appearance.ts';

/** Text announced while content loads. Translate it with the rest of the interface. */
export const defaultLoadingLabel: string = 'Loading';

export interface LoadingStatusProps extends Omit<ComponentPropsWithRef<'div'>, 'role'> {
	/** Announced when the placeholders appear. Defaults to `defaultLoadingLabel`. */
	label?: string;
}

const HiddenLabel = styled('span')(visuallyHiddenStyles);

export const LoadingStatus = ({
	label = defaultLoadingLabel,
	children,
	...attributes
}: LoadingStatusProps & { children: ReactNode }): ReactElement => {
	return (
		<div {...attributes} role='status'>
			<HiddenLabel>{label}</HiddenLabel>
			{children}
		</div>
	);
};
