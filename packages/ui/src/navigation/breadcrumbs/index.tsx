'use client';
// Path from the root of the site to the current page (WAI-ARIA breadcrumb pattern).
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, RefObject } from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { colorTransitionStyles, focusRingStyles } from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { useLinkAs } from '#src/navigation/navigation-provider/index.tsx';
import type { LinkComponent } from '#src/navigation/navigation-provider/index.tsx';

const { spacing, typography, fontWeight, radius, text, accent, state }: typeof themeVariables =
	themeVariables;

export interface BreadcrumbItem {
	/** Unique within the trail; used as the React key. */
	id: string;
	label: string;
	/** Leave it out of the current page, which needs no link. */
	href?: string | undefined;
}

/** Texts of the breadcrumbs. Translate them with the rest of the interface. */
export interface BreadcrumbsLabels {
	/** Name of the navigation landmark. */
	navigation: string;
	/** Name of the button that shows the levels hidden by `maxItems`. */
	expand: (hiddenCount: number) => string;
}

export const defaultBreadcrumbsLabels: Readonly<BreadcrumbsLabels> = Object.freeze({
	navigation: 'Breadcrumb',
	expand: (hiddenCount: number): string => {
		return hiddenCount === 1 ? 'Show 1 more level' : `Show ${String(hiddenCount)} more levels`;
	},
});

export interface BreadcrumbsProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
	/** From the root to the current page, which is the last item. */
	items: readonly BreadcrumbItem[];
	/**
	 * Most items shown at once (at least 2): beyond it, the levels after the first collapse into a button that shows
	 * them, e.g. on a narrow viewport. Defaults to showing every item.
	 */
	maxItems?: number;
	/** Overrides some or all of `defaultBreadcrumbsLabels`. */
	labels?: Partial<BreadcrumbsLabels>;
}

const List = styled('ol')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[1],
	margin: 0,
	padding: 0,
	listStyle: 'none',
	...typography.bodySmall,
	color: text.secondary,
});

const Item = styled('li')({
	display: 'inline-flex',
	alignItems: 'center',
	gap: spacing[1],
	minWidth: 0,
	overflowWrap: 'anywhere',
});

const Separator = styled('span')({
	display: 'inline-flex',
	color: text.muted,
	// The chevrons point in the reading direction.
	'[dir="rtl"] & svg': { transform: 'scaleX(-1)' },
});

const interactiveStyles: CSSObject = {
	borderRadius: radius.small,
	...colorTransitionStyles,
	...focusRingStyles,
};

const Anchor = styled('a')({
	...interactiveStyles,
	color: accent.link,
	textDecorationLine: 'underline',
	textUnderlineOffset: '0.2em',
	'&:hover': { color: accent.linkHover },
	'&[aria-current="page"]': { color: text.primary, fontWeight: fontWeight.medium },
});

const Current = styled('span')({ color: text.primary, fontWeight: fontWeight.medium });

const ExpandButton = styled('button')({
	...interactiveStyles,
	minWidth: '1.5rem',
	minHeight: '1.5rem',
	margin: 0,
	paddingInline: spacing[1],
	border: 0,
	background: 'none',
	color: text.secondary,
	font: 'inherit',
	cursor: 'pointer',
	'&:hover': { backgroundColor: state.hover, color: text.primary },
});

/**
 * A `nav` landmark named by `labels.navigation` holding an ordered list. The current page is the last item, marked
 * `aria-current="page"`; separators are decorative. The trail wraps onto new lines instead of overflowing.
 */
export const Breadcrumbs = ({
	items,
	maxItems,
	labels,
	...attributes
}: BreadcrumbsProps): ReactElement => {
	const texts: BreadcrumbsLabels = useComponentLabels(
		'breadcrumbs',
		defaultBreadcrumbsLabels,
		labels,
	);

	const linkAs: { as?: LinkComponent } = useLinkAs();
	const [expanded, setExpanded] = useState<boolean>(false);
	const expanderKey: string = useId();
	const firstRevealed: RefObject<HTMLAnchorElement | null> = useRef<HTMLAnchorElement>(null);
	const limit: number | undefined = maxItems === undefined ? undefined : Math.max(2, maxItems);
	const collapsed: boolean = !expanded && limit !== undefined && items.length > limit;
	const hiddenCount: number = collapsed ? items.length - (limit ?? items.length) : 0;

	// The expand button disappears once used: focus moves to the first level it revealed instead of being lost.
	useEffect((): void => {
		if (expanded) firstRevealed.current?.focus();
	}, [expanded]);

	const renderItem = (item: BreadcrumbItem): ReactElement => {
		const current: 'page' | undefined = item === items.at(-1) ? 'page' : undefined;

		return item.href === undefined ? (
			<Current aria-current={current}>{item.label}</Current>
		) : (
			<Anchor
				{...linkAs}
				ref={item === items[1] ? firstRevealed : undefined}
				href={item.href}
				aria-current={current}
			>
				{item.label}
			</Anchor>
		);
	};

	const expander: ReactElement = (
		<ExpandButton
			type='button'
			aria-label={texts.expand(hiddenCount)}
			onClick={(): void => {
				setExpanded(true);
			}}
		>
			…
		</ExpandButton>
	);

	const entries: [string, ReactElement][] = items.map(
		(item: BreadcrumbItem): [string, ReactElement] => [item.id, renderItem(item)],
	);

	const visibleEntries: [string, ReactElement][] = collapsed
		? [...entries.slice(0, 1), [expanderKey, expander], ...entries.slice(1 + hiddenCount)]
		: entries;

	return (
		<nav aria-label={texts.navigation} {...attributes}>
			<List>
				{visibleEntries.map(
					([key, content]: [string, ReactElement], position: number): ReactElement => {
						return (
							<Item key={key}>
								{position === 0 ? null : (
									<Separator aria-hidden='true'>
										<Glyph name='chevronRight' />
									</Separator>
								)}

								{content}
							</Item>
						);
					},
				)}
			</List>
		</nav>
	);
};
