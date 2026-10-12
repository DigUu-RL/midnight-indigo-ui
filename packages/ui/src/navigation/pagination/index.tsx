'use client';
// Moves between the pages of a long list: previous and next, the first and last pages, and those around the current one.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react';

import {
	appearanceStyles,
	colorTransitionStyles,
	enabledSelector,
	focusRingStyles,
	interactionStyles,
} from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { breakpointMediaQuery } from '#src/tokens/index.ts';
import { useLinkAs } from '#src/navigation/navigation-provider/index.tsx';
import type { LinkComponent } from '#src/navigation/navigation-provider/index.tsx';

const { spacing, typography, fontWeight, radius, text, state }: typeof themeVariables =
	themeVariables;

/** A page number, or a gap of hidden pages. */
export type PaginationEntry = number | 'start-gap' | 'end-gap';

/** Texts of the pagination. Translate them with the rest of the interface. */
export interface PaginationLabels {
	/** Name of the navigation landmark. */
	navigation: string;
	previous: string;
	next: string;
	/** Name of a page button or link; it contains the visible number. */
	page: (page: number) => string;
	/** Shown instead of the page numbers on `compact` viewports. */
	status: (page: number, pageCount: number) => string;
}

export const defaultPaginationLabels: Readonly<PaginationLabels> = Object.freeze({
	navigation: 'Pagination',
	previous: 'Previous page',
	next: 'Next page',
	page: (page: number): string => `Page ${String(page)}`,
	status: (page: number, pageCount: number): string => {
		return `Page ${String(page)} of ${String(pageCount)}`;
	},
});

/** Buttons that call `onPageChange`, or links built by `getPageHref` (for pages with their own URL). */
type PaginationTargetProps =
	| { onPageChange: (page: number) => void; getPageHref?: never }
	| { getPageHref: (page: number) => string; onPageChange?: never };

export type PaginationProps = Omit<ComponentPropsWithRef<'nav'>, 'children'> &
	PaginationTargetProps & {
		/** The current page, from 1. */
		page: number;
		pageCount: number;
		/** Pages shown on each side of the current one. Defaults to 1. */
		siblingCount?: number;
		/** Pages always shown at each end. Defaults to 1. */
		boundaryCount?: number;
		/** Overrides some or all of `defaultPaginationLabels`. */
		labels?: Partial<PaginationLabels>;
	};

const range = (start: number, end: number): number[] => {
	return end < start
		? []
		: Array.from({ length: end - start + 1 }, (_: unknown, index: number): number => start + index);
};

/**
 * Pages to show for `page` of `pageCount`, with a gap where pages are hidden. A gap never hides a single page: that
 * page is shown instead, so the number of entries stays the same while moving.
 */
export const paginationRange = (
	page: number,
	pageCount: number,
	siblingCount: number = 1,
	boundaryCount: number = 1,
): PaginationEntry[] => {
	const startPages: number[] = range(1, Math.min(boundaryCount, pageCount));

	const endPages: number[] = range(
		Math.max(pageCount - boundaryCount + 1, boundaryCount + 1),
		pageCount,
	);

	const siblingsStart: number = Math.max(
		Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
		boundaryCount + 2,
	);

	const siblingsEnd: number = Math.min(
		Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
		(endPages[0] ?? pageCount + 1) - 2,
	);

	const startGap: PaginationEntry[] =
		siblingsStart > boundaryCount + 2
			? ['start-gap']
			: boundaryCount + 1 < pageCount - boundaryCount
				? [boundaryCount + 1]
				: [];

	const endGap: PaginationEntry[] =
		siblingsEnd < pageCount - boundaryCount - 1
			? ['end-gap']
			: pageCount - boundaryCount > boundaryCount
				? [pageCount - boundaryCount]
				: [];

	return [...startPages, ...startGap, ...range(siblingsStart, siblingsEnd), ...endGap, ...endPages];
};

const List = styled('ul')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[1],
	margin: 0,
	padding: 0,
	listStyle: 'none',
	...typography.label,
});

// Page numbers need room: on `compact` viewports the status text replaces them.
const NumberItem = styled('li')({
	display: 'none',
	[`@media ${breakpointMediaQuery('medium')}`]: { display: 'list-item' },
});

const StatusItem = styled('li')({
	paddingInline: spacing[2],
	color: text.secondary,
	[`@media ${breakpointMediaQuery('medium')}`]: { display: 'none' },
});

const Gap = styled('span')({
	display: 'inline-flex',
	justifyContent: 'center',
	minWidth: '2.5rem',
	color: text.muted,
});

// The current page is filled with the brand color and bolder; the others are ghost buttons. Both pairs are audited.
const controlStyles: CSSObject = {
	boxSizing: 'border-box',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: '2.5rem',
	minHeight: '2.5rem',
	margin: 0,
	paddingInline: spacing[2],
	borderWidth: '1px',
	borderStyle: 'solid',
	borderRadius: radius.medium,
	font: 'inherit',
	letterSpacing: 'inherit',
	textDecoration: 'none',
	cursor: 'pointer',
	...colorTransitionStyles,
	...appearanceStyles('default', 'ghost'),
	...interactionStyles('default', 'ghost'),
	'&[aria-current]': { ...appearanceStyles('official', 'solid'), fontWeight: fontWeight.semibold },
	[`&[aria-current]:hover${enabledSelector}`]: appearanceStyles('official', 'solid'),
	'&[aria-disabled="true"]': { color: state.disabledText, cursor: 'not-allowed' },
	// The chevrons point in the reading direction.
	'[dir="rtl"] & svg': { transform: 'scaleX(-1)' },
	...focusRingStyles,
};

const PageButton = styled('button')(controlStyles);

const PageAnchor = styled('a')(controlStyles);

interface ControlOptions {
	page: number;
	name: string;
	current: boolean;
	disabled: boolean;
	children: ReactNode;
}

/**
 * On the first and last pages, previous and next stay in place, marked `aria-disabled`: a button keeps its focus, and
 * a link loses its `href` (and with it the tab stop).
 */
export const Pagination = ({
	page: requestedPage,
	pageCount,
	onPageChange,
	getPageHref,
	siblingCount = 1,
	boundaryCount = 1,
	labels,
	...attributes
}: PaginationProps): ReactElement => {
	const texts: PaginationLabels = { ...defaultPaginationLabels, ...labels };
	const linkAs: { as?: LinkComponent } = useLinkAs();
	const lastPage: number = Math.max(1, pageCount);
	const page: number = Math.min(Math.max(1, requestedPage), lastPage);

	const renderControl = ({
		page: target,
		name,
		current,
		disabled,
		children,
	}: ControlOptions): ReactElement => {
		if (getPageHref !== undefined) {
			return disabled ? (
				<PageAnchor role='link' aria-disabled='true' aria-label={name}>
					{children}
				</PageAnchor>
			) : (
				<PageAnchor
					{...linkAs}
					href={getPageHref(target)}
					aria-label={name}
					aria-current={current ? 'page' : undefined}
				>
					{children}
				</PageAnchor>
			);
		}

		return (
			<PageButton
				type='button'
				aria-label={name}
				aria-current={current ? 'true' : undefined}
				aria-disabled={disabled ? 'true' : undefined}
				onClick={(event: MouseEvent<HTMLButtonElement>): void => {
					if (disabled || current) {
						event.preventDefault();
						return;
					}

					onPageChange(target);
				}}
			>
				{children}
			</PageButton>
		);
	};

	return (
		<nav aria-label={texts.navigation} {...attributes}>
			<List>
				<li>
					{renderControl({
						page: page - 1,
						name: texts.previous,
						current: false,
						disabled: page === 1,
						children: <Glyph name='chevronLeft' size='small' />,
					})}
				</li>
				{paginationRange(page, lastPage, siblingCount, boundaryCount).map(
					(entry: PaginationEntry): ReactElement => {
						return typeof entry === 'number' ? (
							<NumberItem key={entry}>
								{renderControl({
									page: entry,
									name: texts.page(entry),
									current: entry === page,
									disabled: false,
									children: entry,
								})}
							</NumberItem>
						) : (
							<NumberItem key={entry} aria-hidden='true'>
								<Gap>…</Gap>
							</NumberItem>
						);
					},
				)}
				<StatusItem>{texts.status(page, lastPage)}</StatusItem>
				<li>
					{renderControl({
						page: page + 1,
						name: texts.next,
						current: false,
						disabled: page === lastPage,
						children: <Glyph name='chevronRight' size='small' />,
					})}
				</li>
			</List>
		</nav>
	);
};
