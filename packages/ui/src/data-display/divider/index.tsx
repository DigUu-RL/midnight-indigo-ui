'use client';
// Thin line separating groups of content.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends Omit<ComponentPropsWithRef<'hr'>, 'children'> {
	/** Defaults to `'horizontal'`. A vertical divider stretches to the height of its flex row. */
	orientation?: DividerOrientation;
	/**
	 * Hides the line from assistive technologies when it only decorates, e.g. between items that are already
	 * grouped by headings or lists. Defaults to `false`: the divider is announced as a separator.
	 */
	decorative?: boolean;
}

interface DividerStyleProps {
	orientation: DividerOrientation;
}

// The line uses `border.default`, which is decorative (below 3:1): grouping never depends on it alone.
const Line = styled('hr', { shouldForwardProp: forwardAllBut('orientation') })<DividerStyleProps>(({
	orientation,
}: DividerStyleProps): CSSObject => {
	const horizontal: boolean = orientation === 'horizontal';

	return {
		flexShrink: 0,
		alignSelf: 'stretch',
		width: horizontal ? 'auto' : 0,
		height: horizontal ? 0 : 'auto',
		margin: 0,
		border: 0,
		[horizontal ? 'borderBlockStart' : 'borderInlineStart']:
			`1px solid ${themeVariables.border.default}`,
	};
});

export const Divider = ({
	orientation = 'horizontal',
	decorative = false,
	...attributes
}: DividerProps): ReactElement => {
	const semantics: Record<string, string> = decorative
		? { role: 'presentation', 'aria-hidden': 'true' }
		: orientation === 'vertical'
			? { role: 'separator', 'aria-orientation': 'vertical' }
			: {};

	return <Line {...attributes} {...semantics} orientation={orientation} />;
};
