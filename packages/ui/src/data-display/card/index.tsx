'use client';
// Raised surface grouping related content, with an optional header.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { createContext, use, useId } from 'react';
import type { ComponentPropsWithRef, Context, ReactElement, ReactNode } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, typography, surface, border, text, radius, elevation }: typeof themeVariables =
	themeVariables;

export type CardVariant = 'outline' | 'elevated';

/** `section` and `article` make the card a region named by its `CardHeader` title. */
export type CardElement = 'div' | 'section' | 'article';

export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface CardProps extends ComponentPropsWithRef<'div'> {
	/** Defaults to `'div'`. A `section` or `article` without a `CardHeader` needs an `aria-label`. */
	as?: CardElement;
	/** `outline` (default) separates by the border; `elevated` adds a shadow, e.g. for a card over other content. */
	variant?: CardVariant;
}

export interface CardHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
	title: ReactNode;
	/** Supporting line under the title. */
	subtitle?: ReactNode;
	/** Content before the title, e.g. an `Avatar`. */
	avatar?: ReactNode;
	/** Controls at the end of the header, e.g. an `IconButton`. */
	action?: ReactNode;
	/** Level of the title heading; pick it from the document outline, not from the size. Defaults to 3. */
	headingLevel?: CardHeadingLevel;
}

export type CardContentProps = ComponentPropsWithRef<'div'>;

type HeadingElement = `h${CardHeadingLevel}`;

const headingElements: Record<CardHeadingLevel, HeadingElement> = {
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
};

interface CardStyleProps {
	cardVariant: CardVariant;
}

// Identifier of the title, shared by the card (which is labelled by it) and its header (which renders it).
const CardTitleContext: Context<string | undefined> = createContext<string | undefined>(undefined);

const StyledCard = styled('div', {
	shouldForwardProp: forwardAllBut('cardVariant'),
})<CardStyleProps>(({ cardVariant }: CardStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'flex',
		flexDirection: 'column',
		gap: spacing[4],
		minWidth: 0,
		padding: spacing[5],
		border: `1px solid ${border.default}`,
		borderRadius: radius.large,
		backgroundColor: surface.raised,
		boxShadow: cardVariant === 'elevated' ? elevation.medium : elevation.none,
		color: text.primary,
	};
});

const Header = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[3],
});

const HeaderText = styled('div')({ flex: '1 1 12rem', minWidth: 0 });

const Title = styled('h3')({ ...typography.headingSmall, margin: 0, color: text.primary });

const Subtitle = styled('p')({
	...typography.bodySmall,
	margin: `${spacing[1]} 0 0`,
	color: text.secondary,
});

const HeaderSlot = styled('div')({ display: 'flex', flexShrink: 0, alignItems: 'center' });

const Content = styled('div')({ ...typography.body, minWidth: 0, color: text.secondary });

export const Card = ({
	as: element = 'div',
	variant = 'outline',
	children,
	...attributes
}: CardProps): ReactElement => {
	const titleId: string = useId();
	const isRegion: boolean = element !== 'div' && attributes['aria-label'] === undefined;

	return (
		<CardTitleContext value={titleId}>
			<StyledCard
				as={element}
				aria-labelledby={isRegion ? titleId : undefined}
				{...attributes}
				cardVariant={variant}
			>
				{children}
			</StyledCard>
		</CardTitleContext>
	);
};

export const CardHeader = ({
	title,
	subtitle,
	avatar,
	action,
	headingLevel = 3,
	...attributes
}: CardHeaderProps): ReactElement => {
	const titleId: string | undefined = use(CardTitleContext);
	const headingElement: HeadingElement = headingElements[headingLevel];

	return (
		<Header {...attributes}>
			{avatar === undefined ? null : <HeaderSlot>{avatar}</HeaderSlot>}
			<HeaderText>
				<Title as={headingElement} id={titleId}>
					{title}
				</Title>
				{subtitle === undefined ? null : <Subtitle>{subtitle}</Subtitle>}
			</HeaderText>
			{action === undefined ? null : <HeaderSlot>{action}</HeaderSlot>}
		</Header>
	);
};

export const CardContent = (attributes: CardContentProps): ReactElement => {
	return <Content {...attributes} />;
};
