'use client';
// Native table elements styled with the tokens: a caption that names the table, header cells with a scope and an
// optional sort button, and a container that scrolls sideways when the columns do not fit.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { createContext, use, useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, Context, ReactElement, ReactNode, RefObject } from 'react';

import {
	colorTransitionStyles,
	focusRingStyles,
	forwardAllBut,
	visuallyHiddenStyles,
} from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import type { GlyphName } from '#src/shared/glyphs/index.tsx';
import { scrollbarStyles } from '#src/theme/native-styles.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SortDirection } from '#src/data-display/row-processing/index.ts';

const {
	spacing,
	typography,
	fontWeight,
	radius,
	surface,
	border,
	text,
	intent,
	controlHeight,
}: typeof themeVariables = themeVariables;

/** `comfortable` (default) for reading; `compact` for dense tables that people scan. */
export type TableDensity = 'comfortable' | 'compact';

/** Horizontal alignment of a cell. Align numbers to the `end`, so that their digits line up. */
export type TableCellAlign = 'start' | 'center' | 'end';

export interface TableProps extends ComponentPropsWithRef<'table'> {
	/** Name of the table, rendered as its `<caption>`. Required: every table needs a name. */
	caption: ReactNode;
	/** Hides the caption visually; it still names the table for assistive technologies. Defaults to `false`. */
	hideCaption?: boolean;
	/** Defaults to `'comfortable'`. */
	density?: TableDensity;
}

export type TableSectionProps = ComponentPropsWithRef<'tbody'>;

export type TableRowProps = ComponentPropsWithRef<'tr'>;

export interface TableCellProps extends Omit<ComponentPropsWithRef<'td'>, 'align'> {
	/** Defaults to `'start'`. */
	align?: TableCellAlign;
}

export interface TableHeaderCellProps extends Omit<ComponentPropsWithRef<'th'>, 'align'> {
	/** `col` (default) for column headers; `row` for the cell that names a row, e.g. its first column. */
	scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
	/** Defaults to `'start'`. */
	align?: TableCellAlign;
	/** Makes the header a sort button. The parent updates `sortDirection`, and usually the rows, in response. */
	onSort?: () => void;
	/** Direction the table is sorted by this column, or `null` when it is sorted by another one. */
	sortDirection?: SortDirection | null;
}

interface DensityStyleProps {
	density: TableDensity;
}

interface AlignStyleProps {
	cellAlign: TableCellAlign;
}

const TableDensityContext: Context<TableDensity> = createContext<TableDensity>('comfortable');

const paddings: Record<TableDensity, string> = {
	comfortable: `${spacing[3]} ${spacing[4]}`,
	compact: `${spacing[2]} ${spacing[3]}`,
};

// The container scrolls sideways instead of the page. When it overflows it becomes a focusable region named by the
// caption, so that keyboard users can scroll it too (WCAG 2.1.1).
const ScrollContainer = styled('div')({
	boxSizing: 'border-box',
	maxWidth: '100%',
	overflowX: 'auto',
	...scrollbarStyles,
	border: `1px solid ${border.subtle}`,
	borderRadius: radius.card,
	backgroundColor: surface.raised,
	...focusRingStyles,
});

const StyledTable = styled('table')({
	width: '100%',
	borderCollapse: 'collapse',
	...typography.bodySmall,
	// Digits of the same width keep numbers aligned from row to row.
	fontVariantNumeric: 'tabular-nums',
	color: text.primary,
	'& > thead': { backgroundColor: surface.tableHeader },
	'& > tbody > tr + tr, & > tfoot > tr': { borderTop: `1px solid ${border.subtle}` },
	'& > tbody:first-of-type > tr:first-of-type, & > thead + tbody > tr:first-of-type': {
		borderTop: `1px solid ${border.default}`,
	},
});

const Caption = styled('caption', {
	shouldForwardProp: forwardAllBut('captionHidden'),
})<{ captionHidden: boolean }>(({ captionHidden }: { captionHidden: boolean }): CSSObject => {
	return captionHidden
		? visuallyHiddenStyles
		: {
				padding: paddings.comfortable,
				...typography.label,
				textAlign: 'start',
				color: text.primary,
			};
});

const cellStyles = (density: TableDensity, align: TableCellAlign): CSSObject => {
	return {
		boxSizing: 'border-box',
		padding: paddings[density],
		textAlign: align,
		verticalAlign: 'middle',
	};
};

const Cell = styled('td', {
	shouldForwardProp: forwardAllBut('density', 'cellAlign'),
})<DensityStyleProps & AlignStyleProps>(({
	density,
	cellAlign,
}: DensityStyleProps & AlignStyleProps): CSSObject => {
	return cellStyles(density, cellAlign);
});

const HeaderCell = styled('th', {
	shouldForwardProp: forwardAllBut('density', 'cellAlign', 'sortable'),
})<DensityStyleProps & AlignStyleProps & { sortable: boolean }>(({
	density,
	cellAlign,
	sortable,
}: DensityStyleProps & AlignStyleProps & { sortable: boolean }): CSSObject => {
	return {
		...cellStyles(density, cellAlign),
		...typography.label,
		fontWeight: fontWeight.semibold,
		color: text.secondary,
		// A sort button fills the cell, so that the whole header is its target.
		...(sortable ? { padding: 0 } : {}),
		'&[scope="row"]': {
			...typography.bodySmall,
			fontWeight: fontWeight.medium,
			color: text.primary,
		},
	};
});

const justifications: Record<TableCellAlign, string> = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
};

const SortButton = styled('button', {
	shouldForwardProp: forwardAllBut('density', 'cellAlign'),
})<DensityStyleProps & AlignStyleProps>(({
	density,
	cellAlign,
}: DensityStyleProps & AlignStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'flex',
		alignItems: 'center',
		justifyContent: justifications[cellAlign],
		gap: spacing[1],
		width: '100%',
		minHeight: controlHeight.medium,
		margin: 0,
		padding: paddings[density],
		border: 0,
		borderRadius: radius.controlSmall,
		background: 'none',
		font: 'inherit',
		letterSpacing: 'inherit',
		textAlign: 'inherit',
		color: 'inherit',
		cursor: 'pointer',
		...colorTransitionStyles,
		'&:hover': { color: text.primary },
		'& > svg': { flexShrink: 0, color: text.muted },
		'th[aria-sort] > & > svg': { color: intent.official.text },
		// The ring is drawn inside the cell, so that the scroll container does not clip it.
		'&:focus-visible': {
			outline: `${themeVariables.focus.width} solid ${themeVariables.focus.ring}`,
			outlineOffset: `calc(-1 * ${themeVariables.focus.width})`,
		},
	};
});

const sortGlyphs: Record<SortDirection | 'none', GlyphName> = {
	ascending: 'arrowUp',
	descending: 'arrowDown',
	none: 'sortable',
};

/** Whether the element is wider than its box, updated as either changes size. Always `false` on the server. */
const useHorizontalOverflow = (reference: RefObject<HTMLElement | null>): boolean => {
	const [overflowing, setOverflowing] = useState<boolean>(false);

	useEffect((): (() => void) | undefined => {
		const element: HTMLElement | null = reference.current;
		if (element === null || typeof ResizeObserver === 'undefined') return undefined;

		const measure = (): void => {
			setOverflowing(element.scrollWidth > element.clientWidth);
		};

		const observer: ResizeObserver = new ResizeObserver(measure);
		observer.observe(element);
		if (element.firstElementChild !== null) observer.observe(element.firstElementChild);
		measure();

		return (): void => {
			observer.disconnect();
		};
	}, [reference]);

	return overflowing;
};

/**
 * For data in rows and columns. Name every column with a `TableHeaderCell` in the `TableHead`, and each row with a
 * `TableHeaderCell scope="row"` when one of its cells identifies it. For layout, use `Grid` or `Stack` instead.
 */
export const Table = ({
	caption,
	hideCaption = false,
	density = 'comfortable',
	children,
	...attributes
}: TableProps): ReactElement => {
	const captionId: string = useId();
	const containerReference: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
	const overflowing: boolean = useHorizontalOverflow(containerReference);

	return (
		<TableDensityContext value={density}>
			<ScrollContainer
				ref={containerReference}
				role={overflowing ? 'region' : undefined}
				aria-labelledby={overflowing ? captionId : undefined}
				tabIndex={overflowing ? 0 : undefined}
			>
				<StyledTable {...attributes}>
					<Caption id={captionId} captionHidden={hideCaption}>
						{caption}
					</Caption>

					{children}
				</StyledTable>
			</ScrollContainer>
		</TableDensityContext>
	);
};

export const TableHead = (attributes: TableSectionProps): ReactElement => <thead {...attributes} />;

export const TableBody = (attributes: TableSectionProps): ReactElement => <tbody {...attributes} />;

export const TableFooter = (attributes: TableSectionProps): ReactElement => {
	return <tfoot {...attributes} />;
};

export const TableRow = (attributes: TableRowProps): ReactElement => <tr {...attributes} />;

export const TableCell = ({ align = 'start', ...attributes }: TableCellProps): ReactElement => {
	return <Cell {...attributes} density={use(TableDensityContext)} cellAlign={align} />;
};

/**
 * With `onSort`, the header holds a button named by the header text, and `aria-sort` tells which column orders the
 * rows. Only the sorted column has `aria-sort`; the arrow repeats the direction visually.
 */
export const TableHeaderCell = ({
	scope = 'col',
	align = 'start',
	onSort,
	sortDirection = null,
	children,
	...attributes
}: TableHeaderCellProps): ReactElement => {
	const density: TableDensity = use(TableDensityContext);
	const sortable: boolean = onSort !== undefined;

	return (
		<HeaderCell
			{...attributes}
			scope={scope}
			aria-sort={sortable && sortDirection !== null ? sortDirection : undefined}
			density={density}
			cellAlign={align}
			sortable={sortable}
		>
			{sortable ? (
				<SortButton type='button' density={density} cellAlign={align} onClick={onSort}>
					{children}
					<Glyph name={sortGlyphs[sortDirection ?? 'none']} size='small' />
				</SortButton>
			) : (
				children
			)}
		</HeaderCell>
	);
};
