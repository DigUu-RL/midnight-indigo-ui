'use client';
// Links to the sections of a long page, marking the one being read as the page scrolls (scrollspy).
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode, RefObject } from 'react';

import { colorTransitionStyles, focusRingStyles, forwardAllBut } from '@/src/shared/appearance';
import { useComponentLabels } from '@/src/shared/component-labels/index';
import { themeVariables } from '@/src/theme/theme-variables';

const { spacing, typography, radius, text, state, intent }: typeof themeVariables = themeVariables;

/** Texts of the table of contents. Translate them with the rest of the interface. */
export interface TableOfContentsLabels {
	/** Visible title and accessible name of the navigation. */
	title: string;
}

export const defaultTableOfContentsLabels: Readonly<TableOfContentsLabels> = Object.freeze({
	title: 'On this page',
});

/** Depth of a section: `1` for the sections of the page, `2` and `3` for the ones inside them. */
export type TableOfContentsLevel = 1 | 2 | 3;

export interface TableOfContentsItem {
	/** `id` of the element that starts the section, usually its heading. */
	id: string;
	label: ReactNode;
	/** Defaults to `1`. */
	level?: TableOfContentsLevel;
}

export interface TableOfContentsProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
	items: readonly TableOfContentsItem[];
	/** `id` of the current section, to control it; without it, the scroll position decides. */
	activeId?: string;
	/** Called when the current section changes, by scrolling or by following a link. */
	onActiveIdChange?: (id: string) => void;
	/**
	 * Distance from the top of the viewport, in pixels, of the line that a section crosses to become current. Make it
	 * the height of a sticky header plus some room. Defaults to `96`.
	 */
	scrollOffset?: number;
	/** Overrides some or all of `defaultTableOfContentsLabels`. */
	labels?: Partial<TableOfContentsLabels>;
}

interface EntryStyleProps {
	level: TableOfContentsLevel;
}

const Title = styled('p')({
	margin: 0,
	marginBlockEnd: spacing[2],
	color: text.muted,
	...typography.overline,
});

const List = styled('ol')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	margin: 0,
	padding: 0,
	listStyle: 'none',
});

const indentation: Readonly<Record<TableOfContentsLevel, string>> = {
	1: spacing[3],
	2: spacing[6],
	3: spacing[8],
};

// The current section has primary text and a 2 px bar in `intent.brand.border` at its start, a shape besides the
// color, as the selected tab.
const EntryLink = styled('a', { shouldForwardProp: forwardAllBut('level') })<EntryStyleProps>(({
	level,
}: EntryStyleProps): CSSObject => {
	return {
		position: 'relative',
		display: 'block',
		paddingBlock: spacing[1],
		paddingInlineStart: indentation[level],
		paddingInlineEnd: spacing[2],
		borderRadius: radius.controlSmall,
		color: text.secondary,
		...typography.bodySmall,
		textDecoration: 'none',
		overflowWrap: 'anywhere',
		...colorTransitionStyles,
		'&::before': {
			content: '""',
			position: 'absolute',
			insetBlock: spacing[1],
			insetInlineStart: 0,
			width: '2px',
			borderRadius: radius.pill,
			backgroundColor: 'transparent',
		},
		'&:hover': { backgroundColor: state.hover, color: text.primary },
		'&[aria-current="location"]': {
			color: text.primary,
			'&::before': { backgroundColor: intent.brand.border },
		},
		...focusRingStyles,
	};
});

/** Distance below the line within which a section still counts as reached, e.g. after following its link. */
const arrivalTolerance: number = 8;

/**
 * The last section whose start is above the line at `scrollOffset`, or the first section. At the end of the scroll the
 * last section is current, even when it is too short to reach the line.
 */
export const findCurrentSection = (
	ids: readonly string[],
	scrollOffset: number,
	scrolledToEnd: boolean,
): string | undefined => {
	if (scrolledToEnd && ids.length > 0) return ids.at(-1);

	return ids.reduce<string | undefined>((current: string | undefined, id: string) => {
		const element: HTMLElement | null = document.getElementById(id);
		if (element === null) return current;
		return element.getBoundingClientRect().top <= scrollOffset + arrivalTolerance ? id : current;
	}, ids[0]);
};

const isScrolledToEnd = (target: EventTarget | null): boolean => {
	// Some environments have no `scrollingElement`, although the type says otherwise.
	const pageScroller: Element | undefined =
		(document.scrollingElement as Element | null | undefined) ?? undefined;

	const scroller: Element =
		target instanceof Element ? target : (pageScroller ?? document.documentElement);

	if (scroller.scrollHeight <= scroller.clientHeight) return false;
	return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
};

// Keys and gestures that scroll the page on purpose, after which the scroll position decides again.
const userScrollEvents: readonly string[] = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

/**
 * A `<nav>` with a list of links to the sections (`#id`); the current one has `aria-current="location"`. The scroll
 * of the page and of any scrolling container inside it is followed, at most once per frame. A followed link stays
 * current until the user scrolls, even when its section cannot reach the line, e.g. near the end of the page.
 */
export const TableOfContents = ({
	items,
	activeId,
	onActiveIdChange,
	scrollOffset = 96,
	labels,
	...attributes
}: TableOfContentsProps): ReactElement => {
	const texts: TableOfContentsLabels = useComponentLabels(
		'tableOfContents',
		defaultTableOfContentsLabels,
		labels,
	);

	const titleId: string = useId();
	const [scrolledId, setScrolledId] = useState<string | undefined>(items[0]?.id);
	const followedId: RefObject<string | undefined> = useRef<string | undefined>(undefined);
	const reportedId: RefObject<string | undefined> = useRef<string | undefined>(undefined);
	const onChange: RefObject<((id: string) => void) | undefined> = useRef(onActiveIdChange);
	const currentId: string | undefined = activeId ?? scrolledId;
	const idList: string = items.map((item: TableOfContentsItem): string => item.id).join('\n');

	useEffect((): void => {
		onChange.current = onActiveIdChange;
	}, [onActiveIdChange]);

	useEffect((): (() => void) => {
		const ids: string[] = idList === '' ? [] : idList.split('\n');
		let frame: number | undefined;

		const update = (target: EventTarget | null): void => {
			frame = undefined;
			if (followedId.current !== undefined) return;

			const found: string | undefined = findCurrentSection(
				ids,
				scrollOffset,
				isScrolledToEnd(target),
			);

			if (found === undefined || found === reportedId.current) return;
			reportedId.current = found;
			setScrolledId(found);
			onChange.current?.(found);
		};

		const handleScroll = (event: Event): void => {
			frame ??= window.requestAnimationFrame((): void => {
				update(event.target === document ? null : event.target);
			});
		};

		const release = (): void => {
			followedId.current = undefined;
		};

		update(null);
		document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

		userScrollEvents.forEach((type: string): void => {
			window.addEventListener(type, release, { capture: true, passive: true });
		});

		return (): void => {
			if (frame !== undefined) window.cancelAnimationFrame(frame);
			document.removeEventListener('scroll', handleScroll, { capture: true });

			userScrollEvents.forEach((type: string): void => {
				window.removeEventListener(type, release, { capture: true });
			});
		};
	}, [idList, scrollOffset]);

	// The `pointerdown` or `keydown` that starts a click releases the previous link before this one is kept.
	const follow = (id: string): void => {
		followedId.current = id;
		if (id === reportedId.current) return;
		reportedId.current = id;
		setScrolledId(id);
		onActiveIdChange?.(id);
	};

	return (
		<nav aria-labelledby={titleId} {...attributes}>
			<Title id={titleId}>{texts.title}</Title>

			<List>
				{items.map((item: TableOfContentsItem): ReactElement => {
					return (
						<li key={item.id}>
							<EntryLink
								href={`#${item.id}`}
								level={item.level ?? 1}
								aria-current={item.id === currentId ? 'location' : undefined}
								onClick={(): void => {
									follow(item.id);
								}}
							>
								{item.label}
							</EntryLink>
						</li>
					);
				})}
			</List>
		</nav>
	);
};
