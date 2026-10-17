'use client';
// Top of a page: its title, what it is for and the actions that apply to the whole page.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { prettyWrapStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, typography, text }: typeof themeVariables = themeVariables;

export type PageHeaderHeadingLevel = 1 | 2 | 3;

export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
	/** Name of the page, e.g. `'Sales overview'`. */
	title: ReactNode;
	/** Supporting text under the title. */
	description?: ReactNode;
	/** Controls at the end, e.g. an export button; they wrap below the title on narrow viewports. */
	actions?: ReactNode;
	/** Level of the title heading. Defaults to 1: one per page. */
	headingLevel?: PageHeaderHeadingLevel;
}

type HeadingElement = `h${PageHeaderHeadingLevel}`;

const headingElements: Record<PageHeaderHeadingLevel, HeadingElement> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
};

const Root = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'flex-end',
	justifyContent: 'space-between',
	gap: spacing[4],
});

const Text = styled('div')({ flex: '1 1 20rem', minWidth: 0 });

const Title = styled('h1')({
	...typography.headingLarge,
	...prettyWrapStyles,
	margin: 0,
	overflowWrap: 'anywhere',
	color: text.primary,
});

const Description = styled('p')({
	...typography.body,
	...prettyWrapStyles,
	margin: `${spacing[2]} 0 0`,
	color: text.secondary,
});

const Actions = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[2],
});

export const PageHeader = ({
	title,
	description,
	actions,
	headingLevel = 1,
	...attributes
}: PageHeaderProps): ReactElement => {
	return (
		<Root {...attributes}>
			<Text>
				<Title as={headingElements[headingLevel]}>{title}</Title>
				{description === undefined ? null : <Description>{description}</Description>}
			</Text>

			{actions === undefined ? null : <Actions>{actions}</Actions>}
		</Root>
	);
};
