'use client';
// Layout shared by the empty and error states: an icon, a title, an optional description and an action, centered.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { prettyWrapStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, typography, fontWeight, radius, text, iconSize }: typeof themeVariables =
	themeVariables;

export type StateMessageHeadingLevel = 2 | 3 | 4 | 5 | 6;

/** Props common to `EmptyState` and `ErrorState`. */
export interface StateMessageContentProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
	/** What is missing or what went wrong, in a few words. */
	title: ReactNode;
	/** What it means and what the user can do next. */
	description?: ReactNode;
	/** Decorative icon in place of the default glyph. */
	icon?: ReactNode;
	/** Next step, typically a `Button`. */
	action?: ReactNode;
	/**
	 * Renders the title as a heading of this level, when the state replaces a whole section of the page. Without it
	 * (default), the title is a paragraph, as inside a table or a card that already has a heading.
	 */
	headingLevel?: StateMessageHeadingLevel;
}

type HeadingElement = `h${StateMessageHeadingLevel}`;

const headingElements: Record<StateMessageHeadingLevel, HeadingElement> = {
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
};

interface StateMessageProps extends StateMessageContentProps {
	/** Color of the icon. */
	iconColor: string;
	defaultIcon: ReactNode;
}

const Root = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: spacing[2],
	padding: `${spacing[8]} ${spacing[4]}`,
	textAlign: 'center',
	color: text.secondary,
});

const IconFrame = styled('span')({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: spacing[1],
	borderRadius: radius.pill,
	fontSize: iconSize.large,
});

const Title = styled('p')({
	...typography.headingSmall,
	...prettyWrapStyles,
	margin: 0,
	fontWeight: fontWeight.semibold,
	color: text.primary,
});

const Description = styled('p')({
	...typography.bodySmall,
	...prettyWrapStyles,
	maxWidth: '40rem',
	margin: 0,
});

const Action = styled('div')({ marginTop: spacing[2] });

export const StateMessage = ({
	title,
	description,
	icon,
	action,
	headingLevel,
	iconColor,
	defaultIcon,
	...attributes
}: StateMessageProps): ReactElement => {
	return (
		<Root {...attributes}>
			<IconFrame aria-hidden='true' style={{ color: iconColor }}>
				{icon ?? defaultIcon}
			</IconFrame>

			<Title as={headingLevel === undefined ? 'p' : headingElements[headingLevel]}>{title}</Title>
			{description === undefined ? null : <Description>{description}</Description>}
			{action === undefined ? null : <Action>{action}</Action>}
		</Root>
	);
};
