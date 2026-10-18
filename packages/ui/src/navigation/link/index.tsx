'use client';
// Navigates to another page or place: an `<a>` with an `href`, rendered by the router of the host when it is internal.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import {
	colorTransitionStyles,
	focusRingStyles,
	forwardAllBut,
	visuallyHiddenStyles,
} from '#src/shared/appearance.ts';
import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { useLinkAs } from '#src/navigation/navigation-provider/index.tsx';
import type { LinkComponent } from '#src/navigation/navigation-provider/index.tsx';

const { accent, fontWeight, radius }: typeof themeVariables = themeVariables;

/** `inline` links sit in running text and are always underlined; `standalone` ones stand alone, e.g. in a list. */
export type LinkVariant = 'inline' | 'standalone';

/** Texts of the link. Translate them with the rest of the interface. */
export interface LinkLabels {
	/** Read after the text of an `external` link. */
	opensInNewTab: string;
}

export const defaultLinkLabels: Readonly<LinkLabels> = Object.freeze({
	opensInNewTab: '(opens in a new tab)',
});

export interface LinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'target'> {
	href: string;
	/** The visible text; it is also the accessible name, so it must say where the link goes. */
	children: ComponentPropsWithRef<'a'>['children'];
	/** Defaults to `'inline'`. */
	variant?: LinkVariant;
	/** Marks the link to the page being shown (`aria-current="page"`). */
	current?: boolean;
	/**
	 * Another site, opened in a new tab: a plain `<a>` with `target="_blank"`, `rel="noopener noreferrer"`, an icon and
	 * a hidden `labels.opensInNewTab`, so the change of context is never a surprise.
	 */
	external?: boolean;
	/** Overrides some or all of `defaultLinkLabels`. */
	labels?: Partial<LinkLabels>;
}

interface LinkStyleProps {
	linkVariant: LinkVariant;
}

const ExternalIcon = styled('span')({
	display: 'inline-flex',
	marginInlineStart: '0.2em',
	verticalAlign: '-0.1em',
	'& svg': { width: '0.875em', height: '0.875em' },
	// The arrow points away from the text in both reading directions.
	'[dir="rtl"] & svg': { transform: 'scaleX(-1)' },
});

const HiddenText = styled('span')(visuallyHiddenStyles);

// `accent.link` is part of the contrast audit on every surface. Inline links are underlined because a link in running
// text must not be told apart by its color alone (WCAG 1.4.1).
const StyledLink = styled('a', {
	shouldForwardProp: forwardAllBut('linkVariant'),
})<LinkStyleProps>(({ linkVariant }: LinkStyleProps): CSSObject => {
	return {
		borderRadius: radius.controlSmall,
		color: accent.link,
		textDecorationLine: linkVariant === 'inline' ? 'underline' : 'none',
		textDecorationThickness: '1px',
		textUnderlineOffset: '0.2em',
		cursor: 'pointer',
		...colorTransitionStyles,
		'&:hover': { color: accent.linkHover, textDecorationLine: 'underline' },
		'&[aria-current="page"]': { fontWeight: fontWeight.semibold },
		...focusRingStyles,
	};
});

export const Link = ({
	href,
	children,
	variant = 'inline',
	current = false,
	external = false,
	labels,
	rel,
	...attributes
}: LinkProps): ReactElement => {
	const texts: LinkLabels = useComponentLabels('link', defaultLinkLabels, labels);
	const linkAs: { as?: LinkComponent } = useLinkAs();

	if (external) {
		return (
			<StyledLink
				{...attributes}
				href={href}
				target='_blank'
				rel={rel ?? 'noopener noreferrer'}
				linkVariant={variant}
			>
				{children}

				<ExternalIcon aria-hidden='true'>
					<Glyph name='externalLink' />
				</ExternalIcon>

				<HiddenText> {texts.opensInNewTab}</HiddenText>
			</StyledLink>
		);
	}

	return (
		<StyledLink
			{...attributes}
			{...linkAs}
			href={href}
			rel={rel}
			aria-current={current ? 'page' : undefined}
			linkVariant={variant}
		>
			{children}
		</StyledLink>
	);
};
