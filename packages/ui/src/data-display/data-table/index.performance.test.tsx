// @vitest-environment jsdom
// The data table with large datasets: the DOM, the calls to the column functions and the renders of each interaction
// stay bounded by the page, not by the data. These are counts, not times: in jsdom, React and Emotion run their
// development builds, whose overhead hides the table's own cost. The browser suite (fixtures/browser) times the same
// scenarios on the production build, with layout and paint.
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { Profiler } from 'react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createInvoices } from '@/test/large-datasets';
import type { Invoice } from '@/test/large-datasets';
import { applyViewportStyles, resetViewport, setViewportWidth } from '@/test/viewport';
import { DataTable } from '@/src/data-display/data-table/index';
import type { DataTableColumn, DataTableProps } from '@/src/data-display/data-table/index';
import type { SortValue } from '@/src/data-display/row-processing/index';

interface WorkCounters {
	cells: number;
	sortValues: number;
	filterValues: number;
}

const pageSize: number = 25;

const createColumns = (counters: WorkCounters): DataTableColumn<Invoice>[] => {
	return [
		{
			id: 'customer',
			header: 'Customer',
			rowHeader: true,
			cell: (invoice: Invoice): string => {
				counters.cells += 1;
				return invoice.customer;
			},
			sortValue: (invoice: Invoice): SortValue => {
				counters.sortValues += 1;
				return invoice.customer;
			},
			filterValue: (invoice: Invoice): string => {
				counters.filterValues += 1;
				return invoice.customer;
			},
		},
		{
			id: 'city',
			header: 'City',
			cell: (invoice: Invoice): string => invoice.city,
			filterValue: (invoice: Invoice): string => invoice.city,
		},
		{
			id: 'total',
			header: 'Total',
			align: 'end',
			cell: (invoice: Invoice): string => String(invoice.total ?? '—'),
			sortValue: (invoice: Invoice): SortValue => invoice.total,
		},
	];
};

const createCounters = (): WorkCounters => ({ cells: 0, sortValues: 0, filterValues: 0 });
const getInvoiceId = (invoice: Invoice): string => invoice.id;

const createTable = (
	rows: readonly Invoice[],
	columns: readonly DataTableColumn<Invoice>[],
	props: Partial<DataTableProps<Invoice>> = {},
): ReactElement => {
	return (
		<DataTable
			caption='Invoices'
			columns={columns}
			rows={rows}
			getRowId={getInvoiceId}
			pageSize={pageSize}
			locale='pt-BR'
			{...props}
		/>
	);
};

const countElements = (container: Element): number => container.querySelectorAll('*').length;

const renderTable = (table: ReactElement): RenderResult => {
	const result: RenderResult = render(table);
	applyViewportStyles();
	return result;
};

// Page numbers are shown from the `medium` breakpoint on.
beforeEach((): void => {
	setViewportWidth(1024);
});

afterEach((): void => {
	cleanup();
	resetViewport();
});

describe('DataTable DOM with large datasets', (): void => {
	it('renders as many elements for 100 000 rows as for 1 000', (): void => {
		const small: RenderResult = renderTable(
			createTable(createInvoices(1_000), createColumns(createCounters())),
		);

		const smallElementCount: number = countElements(small.container);
		cleanup();

		const large: RenderResult = renderTable(
			createTable(createInvoices(100_000), createColumns(createCounters())),
		);

		expect(screen.getAllByRole('row')).toHaveLength(pageSize + 1);
		expect(countElements(large.container)).toBe(smallElementCount);
	});

	it('pages a billion rows on the server with as many page items as 10 pages', (): void => {
		const firstPage: Invoice[] = createInvoices(pageSize);
		const columns: DataTableColumn<Invoice>[] = createColumns(createCounters());

		const countPageItems = (rowCount: number): number => {
			const { container } = renderTable(
				createTable(firstPage, columns, { processing: 'server', rowCount }),
			);

			const count: number = container.querySelectorAll('nav li').length;
			cleanup();
			return count;
		};

		const tenPagesItemCount: number = countPageItems(pageSize * 10);

		renderTable(createTable(firstPage, columns, { processing: 'server', rowCount: 1_000_000_000 }));

		expect(screen.getAllByRole('row')).toHaveLength(pageSize + 1);
		expect(screen.getByRole('button', { name: 'Page 40000000' })).toBeDefined();
		cleanup();

		expect(countPageItems(1_000_000_000)).toBe(tenPagesItemCount);
	});
});

describe('DataTable work with 10 000 rows', (): void => {
	const invoices: Invoice[] = createInvoices(10_000);

	it('reads the searchable texts once, not again on sorting, paging or filtering', (): void => {
		const counters: WorkCounters = createCounters();
		const columns: DataTableColumn<Invoice>[] = createColumns(counters);
		const { rerender } = renderTable(createTable(invoices, columns));

		expect(counters.filterValues).toBe(invoices.length);

		fireEvent.click(screen.getByRole('button', { name: 'Customer' }));
		fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
		rerender(createTable(invoices, columns, { filter: 'recife' }));
		rerender(createTable(invoices, columns, { filter: 'recife 12' }));

		expect(counters.filterValues).toBe(invoices.length);
	});

	it('reads each sort value once per sort, and renders cells only for the page', (): void => {
		const counters: WorkCounters = createCounters();
		renderTable(createTable(invoices, createColumns(counters)));

		expect(counters.sortValues).toBe(0);
		expect(counters.cells).toBe(pageSize);

		counters.cells = 0;
		fireEvent.click(screen.getByRole('button', { name: 'Customer' }));

		expect(counters.sortValues).toBe(invoices.length);
		expect(counters.cells).toBeLessThanOrEqual(pageSize * 2);

		counters.cells = 0;
		counters.sortValues = 0;
		fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));

		expect(counters.sortValues).toBe(0);
		expect(counters.cells).toBeLessThanOrEqual(pageSize * 2);
	});
});

// Commits of React per interaction: one for each change, two for a filter (the input first, then the deferred rows).
// A cascade of renders would multiply the work of every interaction, whatever the size of the data.
describe('DataTable renders per interaction with 10 000 rows', (): void => {
	const invoices: Invoice[] = createInvoices(10_000);
	const columns: DataTableColumn<Invoice>[] = createColumns(createCounters());
	let commits: number = 0;

	const countCommit = (): void => {
		commits += 1;
	};

	const createProfiledTable = (props: Partial<DataTableProps<Invoice>> = {}): ReactElement => {
		return (
			<Profiler id='data-table' onRender={countCommit}>
				{createTable(invoices, columns, props)}
			</Profiler>
		);
	};

	const commitsOf = (interaction: () => void): number => {
		commits = 0;
		interaction();
		return commits;
	};

	it('commits once to mount, sort and change pages', (): void => {
		expect(
			commitsOf((): void => {
				renderTable(createProfiledTable());
			}),
		).toBe(1);

		expect(
			commitsOf((): void => {
				fireEvent.click(screen.getByRole('button', { name: 'Customer' }));
			}),
		).toBe(1);

		expect(
			commitsOf((): void => {
				fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
			}),
		).toBe(1);
	});

	it('commits at most twice for a new filter, and once when the parent renders again', (): void => {
		const { rerender } = renderTable(createProfiledTable());

		expect(
			commitsOf((): void => {
				act((): void => {
					rerender(createProfiledTable({ filter: 'recife' }));
				});
			}),
		).toBeLessThanOrEqual(2);

		expect(
			commitsOf((): void => {
				rerender(createProfiledTable({ filter: 'recife' }));
			}),
		).toBe(1);
	});
});
