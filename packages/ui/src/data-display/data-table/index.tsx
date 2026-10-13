'use client';
// Table of records with sorting, a text filter and pagination, done on the client or by the server, and the loading,
// empty and error states.
import { styled } from '@mui/material/styles';
import { useDeferredValue, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { visuallyHiddenStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { Pagination } from '#src/navigation/pagination/index.tsx';
import type { PaginationLabels } from '#src/navigation/pagination/index.tsx';
import { EmptyState } from '#src/data-display/empty-state/index.tsx';
import { ErrorState } from '#src/data-display/error-state/index.tsx';
import {
	createRowCollator,
	createSearchIndex,
	filterRows,
	pageCountOf,
	pageRows,
	sortRows,
} from '#src/data-display/row-processing/index.ts';
import type {
	SortDirection,
	SortState,
	SortValue,
} from '#src/data-display/row-processing/index.ts';
import { Skeleton } from '#src/data-display/skeleton/index.tsx';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '#src/data-display/table/index.tsx';
import type { TableCellAlign, TableDensity } from '#src/data-display/table/index.tsx';

export interface DataTableColumn<Row> {
	/** Stable identifier, used by `SortState`. */
	id: string;
	/** Text of the column header; it also names the column in announcements. */
	header: string;
	/** Content of the cell of `row`. */
	cell: (row: Row) => ReactNode;
	/** Value the column sorts by on the client. Giving it makes the column sortable. */
	sortValue?: (row: Row) => SortValue;
	/** Makes the header a sort button. Defaults to whether `sortValue` is given; set it for server sorting. */
	sortable?: boolean;
	/** Text of the cell that the filter searches. Columns without it are not searched. */
	filterValue?: (row: Row) => string;
	/** Defaults to `'start'`. Use `'end'` for numbers. */
	align?: TableCellAlign;
	/** Renders the cells as row headers (`<th scope="row">`): the column that identifies each row. */
	rowHeader?: boolean;
	/** CSS width of the column. */
	width?: string;
}

/** `ready` shows the rows (or the empty state), `loading` placeholders and `error` the error state. */
export type DataTableStatus = 'ready' | 'loading' | 'error';

/** Texts of the data table. Translate them with the rest of the interface. */
export interface DataTableLabels {
	/** Announced while the rows load. */
	loading: string;
	/** Title of the empty state when there are no rows at all. */
	empty: string;
	/** Title of the empty state when the filter matches no row. */
	noResults: string;
	/** Title of the error state. */
	error: string;
	/** Text of the retry button of the error state. */
	retry: string;
	/** Announced after sorting. */
	sorted: (column: string, direction: SortDirection) => string;
	/** Announced after changing pages; `first` and `last` count from 1. */
	rowRange: (first: number, last: number, total: number) => string;
	/** Announced after the filter changes. */
	resultCount: (count: number) => string;
	/** Name of the pagination landmark, from the caption. */
	pagination: (caption: string) => string;
}

export const defaultDataTableLabels: Readonly<DataTableLabels> = Object.freeze({
	loading: 'Loading rows',
	empty: 'No rows yet',
	noResults: 'No rows match the filter',
	error: 'The rows could not be loaded',
	retry: 'Try again',
	sorted: (column: string, direction: SortDirection): string => `Sorted by ${column}, ${direction}`,
	rowRange: (first: number, last: number, total: number): string => {
		return `Rows ${String(first)} to ${String(last)} of ${String(total)}`;
	},
	resultCount: (count: number): string => {
		return count === 0 ? 'No rows' : count === 1 ? '1 row' : `${String(count)} rows`;
	},
	pagination: (caption: string): string => `Pages of ${caption}`,
});

/**
 * `client` (default): `rows` holds every row, and the table sorts, filters and pages them. `server`: `rows` holds only
 * the current page, already sorted and filtered, and `rowCount` the number of rows that match; the table only reports
 * the changes through `onSortChange` and `onPageChange`.
 */
type DataTableProcessingProps =
	{ processing?: 'client'; rowCount?: never } | { processing: 'server'; rowCount: number };

export type DataTableProps<Row> = Omit<ComponentPropsWithRef<'div'>, 'children'> &
	DataTableProcessingProps & {
		/** Name of the table. Required: it also names the scroll region and the pagination. */
		caption: string;
		/** Hides the caption visually, e.g. under a heading that says the same. Defaults to `false`. */
		hideCaption?: boolean;
		/** Defaults to `'comfortable'`. */
		density?: TableDensity;
		/** Keep the same array between renders (a constant or `useMemo`): the search index depends on it. */
		columns: readonly DataTableColumn<Row>[];
		rows: readonly Row[];
		/** Stable key of each row. */
		getRowId: (row: Row) => string;
		/** Defaults to `'ready'`. */
		status?: DataTableStatus;
		/** Explanation under the title of the error state. */
		errorDescription?: ReactNode;
		/** Shows a retry button in the error state. */
		onRetry?: () => void;
		/** Replaces the default empty state, e.g. with an `EmptyState` that has an action. */
		emptyState?: ReactNode;
		/** The sorting, when the parent controls it; `null` for the order of `rows`. */
		sort?: SortState | null;
		/** Initial sorting when uncontrolled. Defaults to `null`. */
		defaultSort?: SortState | null;
		/** Called with the new sorting. Each header toggles between ascending and descending. */
		onSortChange?: (sort: SortState) => void;
		/** The current page (from 1), when the parent controls it. */
		page?: number;
		/** Initial page when uncontrolled. Defaults to 1. */
		defaultPage?: number;
		/** Called with the new page, also when sorting or filtering returns to the first page. */
		onPageChange?: (page: number) => void;
		/** Rows per page. Defaults to 10. */
		pageSize?: number;
		/** Text filter: the rows whose `filterValue` contain every word, ignoring case and accents. */
		filter?: string;
		/** Locale of sorting and filtering. Defaults to the runtime locale. */
		locale?: string;
		/** Overrides some or all of `defaultDataTableLabels`. */
		labels?: Partial<DataTableLabels>;
		/** Overrides texts of the pagination. */
		paginationLabels?: Partial<PaginationLabels>;
	};

type Announcement = 'sort' | 'page' | 'results';

const loadingRowCount: number = 5;

const Root = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'stretch',
	gap: themeVariables.spacing[3],
	minWidth: 0,
	'& > nav': { alignSelf: 'flex-end' },
});

const LiveRegion = styled('div')(visuallyHiddenStyles);

const clampPage = (page: number, pageCount: number): number => {
	return Math.min(Math.max(1, Math.floor(page)), pageCount);
};

const isSortable = <Row,>(column: DataTableColumn<Row>): boolean => {
	return column.sortable ?? column.sortValue !== undefined;
};

/**
 * Sortable headers are buttons with `aria-sort`, pages are the `Pagination` buttons, and a polite status message
 * announces the order, the visible rows or the number of results after each change. On the client it handles
 * thousands of rows (see "Large datasets" in the docs); beyond that, use `processing="server"`.
 */
export const DataTable = <Row,>({
	caption,
	hideCaption = false,
	density = 'comfortable',
	columns,
	rows,
	getRowId,
	processing = 'client',
	rowCount,
	status = 'ready',
	errorDescription,
	onRetry,
	emptyState,
	sort,
	defaultSort = null,
	onSortChange,
	page,
	defaultPage = 1,
	onPageChange,
	pageSize: requestedPageSize = 10,
	filter = '',
	locale,
	labels,
	paginationLabels,
	...attributes
}: DataTableProps<Row>): ReactElement => {
	const texts: DataTableLabels = { ...defaultDataTableLabels, ...labels };
	const server: boolean = processing === 'server';
	const pageSize: number = Math.max(1, Math.floor(requestedPageSize));
	const [uncontrolledSort, setUncontrolledSort] = useState<SortState | null>(defaultSort);
	const [uncontrolledPage, setUncontrolledPage] = useState<number>(defaultPage);
	const [announcement, setAnnouncement] = useState<Announcement | null>(null);
	const [previousFilter, setPreviousFilter] = useState<string>(filter);
	const currentSort: SortState | null = sort === undefined ? uncontrolledSort : sort;

	// Typing stays responsive: the rows follow the filter at a lower priority than the input.
	const deferredFilter: string = useDeferredValue(filter);

	// A new filter starts again from the first page, and its number of results is announced.
	if (filter !== previousFilter) {
		setPreviousFilter(filter);
		setUncontrolledPage(1);
		setAnnouncement('results');
	}

	const collator: Intl.Collator = useMemo((): Intl.Collator => createRowCollator(locale), [locale]);

	const searchIndex: string[] = useMemo((): string[] => {
		if (server) return [];

		return createSearchIndex(
			rows,
			(row: Row): string[] => {
				return columns.flatMap((column: DataTableColumn<Row>): string[] => {
					return column.filterValue === undefined ? [] : [column.filterValue(row)];
				});
			},
			locale,
		);
	}, [server, rows, columns, locale]);

	const sortColumn: DataTableColumn<Row> | undefined = columns.find(
		(column: DataTableColumn<Row>): boolean => column.id === currentSort?.columnId,
	);

	const processedRows: readonly Row[] = useMemo((): readonly Row[] => {
		if (server) return rows;

		const filtered: Row[] = filterRows(rows, searchIndex, deferredFilter, locale);
		const getValue: ((row: Row) => SortValue) | undefined = sortColumn?.sortValue;

		if (getValue === undefined || currentSort === null) return filtered;

		return sortRows(filtered, getValue, currentSort.direction, collator);
	}, [server, rows, searchIndex, deferredFilter, locale, sortColumn, currentSort, collator]);

	const total: number = server ? (rowCount ?? rows.length) : processedRows.length;
	const pageCount: number = pageCountOf(total, pageSize);
	const currentPage: number = clampPage(page ?? uncontrolledPage, pageCount);

	const visibleRows: readonly Row[] = server
		? rows
		: pageRows(processedRows, currentPage, pageSize);

	const firstRow: number = (currentPage - 1) * pageSize + 1;
	const paginated: boolean = pageCount > 1 && status === 'ready';

	const changePage = (target: number): void => {
		if (page === undefined) setUncontrolledPage(target);
		onPageChange?.(target);
	};

	const handleSort = (column: DataTableColumn<Row>): void => {
		const sortedAscending: boolean =
			currentSort?.columnId === column.id && currentSort.direction === 'ascending';

		const next: SortState = {
			columnId: column.id,
			direction: sortedAscending ? 'descending' : 'ascending',
		};

		if (sort === undefined) setUncontrolledSort(next);
		onSortChange?.(next);
		if (currentPage !== 1) changePage(1);
		setAnnouncement('sort');
	};

	const handlePageChange = (target: number): void => {
		changePage(target);
		setAnnouncement('page');
	};

	const announcements: Record<Announcement, () => string> = {
		sort: (): string => {
			return sortColumn === undefined || currentSort === null
				? ''
				: texts.sorted(sortColumn.header, currentSort.direction);
		},
		page: (): string => {
			return texts.rowRange(firstRow, Math.min(firstRow + pageSize - 1, total), total);
		},
		results: (): string => texts.resultCount(total),
	};

	const message: string =
		status === 'loading'
			? texts.loading
			: status === 'ready' && announcement !== null
				? announcements[announcement]()
				: '';

	const renderBody = (): ReactNode => {
		if (status === 'loading') {
			return Array.from(
				{ length: Math.min(pageSize, loadingRowCount) },
				(_: unknown, index: number): ReactElement => {
					return (
						<TableRow key={index} aria-hidden='true'>
							{columns.map((column: DataTableColumn<Row>): ReactElement => {
								return (
									<TableCell key={column.id}>
										<Skeleton />
									</TableCell>
								);
							})}
						</TableRow>
					);
				},
			);
		}

		if (status === 'error' || visibleRows.length === 0) {
			const filtered: boolean = deferredFilter.trim() !== '';

			return (
				<TableRow>
					<TableCell colSpan={columns.length}>
						{status === 'error' ? (
							<ErrorState
								title={texts.error}
								description={errorDescription}
								labels={{ retry: texts.retry }}
								{...(onRetry === undefined ? {} : { onRetry })}
							/>
						) : (
							(emptyState ?? <EmptyState title={filtered ? texts.noResults : texts.empty} />)
						)}
					</TableCell>
				</TableRow>
			);
		}

		return visibleRows.map((row: Row, index: number): ReactElement => {
			return (
				<TableRow key={getRowId(row)} aria-rowindex={paginated ? firstRow + index + 1 : undefined}>
					{columns.map((column: DataTableColumn<Row>): ReactElement => {
						const content: ReactNode = column.cell(row);
						const align: TableCellAlign = column.align ?? 'start';

						return column.rowHeader === true ? (
							<TableHeaderCell key={column.id} scope='row' align={align}>
								{content}
							</TableHeaderCell>
						) : (
							<TableCell key={column.id} align={align}>
								{content}
							</TableCell>
						);
					})}
				</TableRow>
			);
		});
	};

	return (
		<Root {...attributes}>
			<Table
				caption={caption}
				hideCaption={hideCaption}
				density={density}
				aria-busy={status === 'loading' ? 'true' : undefined}
				aria-rowcount={paginated ? total + 1 : undefined}
			>
				<TableHead>
					<TableRow aria-rowindex={paginated ? 1 : undefined}>
						{columns.map((column: DataTableColumn<Row>): ReactElement => {
							return (
								<TableHeaderCell
									key={column.id}
									align={column.align ?? 'start'}
									style={column.width === undefined ? undefined : { width: column.width }}
									sortDirection={currentSort?.columnId === column.id ? currentSort.direction : null}
									{...(isSortable(column)
										? {
												onSort: (): void => {
													handleSort(column);
												},
											}
										: {})}
								>
									{column.header}
								</TableHeaderCell>
							);
						})}
					</TableRow>
				</TableHead>

				<TableBody>{renderBody()}</TableBody>
			</Table>

			{paginated ? (
				<Pagination
					page={currentPage}
					pageCount={pageCount}
					onPageChange={handlePageChange}
					labels={{ navigation: texts.pagination(caption), ...paginationLabels }}
				/>
			) : null}

			<LiveRegion role='status'>{message}</LiveRegion>
		</Root>
	);
};
