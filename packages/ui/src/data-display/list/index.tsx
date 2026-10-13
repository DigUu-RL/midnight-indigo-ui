'use client';
// A list of records, one per row: a title, a supporting line and content before and after them.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, typography, fontWeight, border, text }: typeof themeVariables = themeVariables;

export interface ListProps extends ComponentPropsWithRef<'ul'> {
	/** Renders an `<ol>`, for lists whose order means something (a ranking, steps). Defaults to `false`. */
	ordered?: boolean;
	/** Draws a line between the items. Defaults to `true`. */
	divided?: boolean;
}

export interface ListItemProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
	/** Main text of the item. Links and buttons go here or in `trailing`, never around the whole item. */
	title: ReactNode;
	/** Supporting line under the title. */
	description?: ReactNode;
	/** Content before the text, e.g. an `Avatar` or an icon. */
	leading?: ReactNode;
	/** Content after the text, e.g. a value, a `Chip` or an `IconButton`. */
	trailing?: ReactNode;
}

interface ListStyleProps {
	divided: boolean;
}

const StyledList = styled('ul', {
	shouldForwardProp: forwardAllBut('divided'),
})<ListStyleProps>(({ divided }: ListStyleProps): CSSObject => {
	return {
		margin: 0,
		padding: 0,
		listStyle: 'none',
		'& > li + li': divided ? { borderTop: `1px solid ${border.subtle}` } : {},
	};
});

const Item = styled('li')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[3],
	minWidth: 0,
	padding: `${spacing[3]} 0`,
});

const Slot = styled('div')({
	display: 'flex',
	flexShrink: 0,
	alignItems: 'center',
	gap: spacing[2],
});

const Text = styled('div')({ flex: 1, minWidth: 0 });

const Title = styled('div')({
	...typography.body,
	fontWeight: fontWeight.medium,
	overflowWrap: 'anywhere',
	color: text.primary,
});

const Description = styled('div')({
	...typography.bodySmall,
	overflowWrap: 'anywhere',
	color: text.secondary,
});

/**
 * Semantic `<ul>` (or `<ol>`): assistive technologies announce the number of items. For records compared column by
 * column, use a `Table`.
 */
export const List = ({
	ordered = false,
	divided = true,
	...attributes
}: ListProps): ReactElement => {
	return <StyledList {...attributes} as={ordered ? 'ol' : 'ul'} divided={divided} />;
};

export const ListItem = ({
	title,
	description,
	leading,
	trailing,
	...attributes
}: ListItemProps): ReactElement => {
	return (
		<Item {...attributes}>
			{leading === undefined ? null : <Slot>{leading}</Slot>}

			<Text>
				<Title>{title}</Title>
				{description === undefined ? null : <Description>{description}</Description>}
			</Text>

			{trailing === undefined ? null : <Slot>{trailing}</Slot>}
		</Item>
	);
};
