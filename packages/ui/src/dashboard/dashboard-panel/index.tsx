'use client';
// A titled region of a dashboard page around a chart, a listing or any other content. It only composes: a chart is
// passed as a child, so this subpath never loads the chart engine.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { Card, CardContent, CardHeader } from '#src/data-display/card/index.tsx';
import type { CardHeadingLevel } from '#src/data-display/card/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, border }: typeof themeVariables = themeVariables;

// Attributes of the `div` of `Card`, which renders the `section`.
export interface DashboardPanelProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
	/** Names the region, e.g. `'Revenue by month'`. */
	title: ReactNode;
	/** Supporting line under the title, e.g. the period shown. */
	description?: ReactNode;
	/** Controls at the end of the header, e.g. a period `Select` or a menu of exports. */
	actions?: ReactNode;
	/** Controls between the header and the content, e.g. the `SearchField` of a listing. */
	toolbar?: ReactNode;
	/** Content below a line at the end, e.g. a link to the full report. */
	footer?: ReactNode;
	/** Level of the title heading; pick it from the document outline. Defaults to 2, under the `h1` of `PageHeader`. */
	headingLevel?: CardHeadingLevel;
	/** The chart, table or list. */
	children: ReactNode;
}

const Toolbar = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'flex-end',
	gap: spacing[3],
});

const Footer = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[3],
	paddingBlockStart: spacing[4],
	borderBlockStart: `1px solid ${border.subtle}`,
});

/**
 * A `section` named by its title (a region landmark). Give a `Chart` inside it `hideTitle` with the same title, so the
 * figure keeps its name without repeating the heading on screen.
 */
export const DashboardPanel = ({
	title,
	description,
	actions,
	toolbar,
	footer,
	headingLevel = 2,
	children,
	...attributes
}: DashboardPanelProps): ReactElement => {
	return (
		<Card {...attributes} as='section'>
			<CardHeader
				title={title}
				subtitle={description}
				action={actions}
				headingLevel={headingLevel}
			/>

			{toolbar === undefined ? null : <Toolbar>{toolbar}</Toolbar>}
			<CardContent>{children}</CardContent>
			{footer === undefined ? null : <Footer>{footer}</Footer>}
		</Card>
	);
};
