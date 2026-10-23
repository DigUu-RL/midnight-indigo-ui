// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { applyViewportStyles, resetViewport, setViewportWidth } from '@/test/viewport';
import { DataTable } from '@/src/data-display/data-table/index';
import type { DataTableColumn, DataTableProps } from '@/src/data-display/data-table/index';
import type { SortState, SortValue } from '@/src/data-display/row-processing/index';

interface Order {
	id: string;
	customer: string;
	city: string;
	total: number;
}

const customers: readonly string[] = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio'];
const cities: readonly string[] = ['São Paulo', 'Recife', 'Belém'];

const orders: Order[] = Array.from({ length: 25 }, (_: unknown, index: number): Order => {
	return {
		id: `order-${String(index + 1)}`,
		customer: `${customers[index % customers.length] ?? ''} ${String(index + 1)}`,
		city: cities[index % cities.length] ?? '',
		total: ((index * 37) % 25) * 10,
	};
});

const columns: DataTableColumn<Order>[] = [
	{
		id: 'customer',
		header: 'Customer',
		rowHeader: true,
		cell: (order: Order): string => order.customer,
		sortValue: (order: Order): SortValue => order.customer,
		filterValue: (order: Order): string => order.customer,
	},
	{
		id: 'city',
		header: 'City',
		cell: (order: Order): string => order.city,
		filterValue: (order: Order): string => order.city,
	},
	{
		id: 'total',
		header: 'Total',
		align: 'end',
		cell: (order: Order): string => `R$ ${String(order.total)}`,
		sortValue: (order: Order): SortValue => order.total,
	},
];

const getOrderId = (order: Order): string => order.id;

// Page numbers are shown from the `medium` breakpoint on; below it the pagination shows only its status text.
beforeEach((): void => {
	setViewportWidth(1024);
});

afterEach((): void => {
	cleanup();
	resetViewport();
});

const renderTable = (table: ReactElement): RenderResult => {
	const result: RenderResult = render(table);
	applyViewportStyles();
	return result;
};

const renderOrders = (props: Partial<DataTableProps<Order>> = {}): void => {
	renderTable(
		<DataTable caption='Orders' columns={columns} rows={orders} getRowId={getOrderId} {...props} />,
	);
};

const firstColumn = (): (string | null)[] => {
	return screen
		.getAllByRole('rowheader')
		.map((cell: HTMLElement): string | null => cell.textContent);
};

const status = (): string => screen.getByRole('status').textContent;

describe('DataTable structure', (): void => {
	it('renders the first page with named headers, row headers and no axe violations', async (): Promise<void> => {
		const { container } = renderTable(
			<DataTable caption='Orders' columns={columns} rows={orders} getRowId={getOrderId} />,
		);

		const table: HTMLElement = screen.getByRole('table', { name: 'Orders' });

		expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
		expect(firstColumn()).toHaveLength(10);
		expect(firstColumn()[0]).toBe('Ana 1');
		expect(screen.getByRole('navigation', { name: 'Pages of Orders' })).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('tells assistive technologies the size of the whole table and the position of each row', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderOrders();
		const table: HTMLElement = screen.getByRole('table');

		expect(table.getAttribute('aria-rowcount')).toBe('26');

		await user.click(screen.getByRole('button', { name: 'Page 2' }));
		const [, firstRow] = within(table).getAllByRole('row');

		expect(firstRow?.getAttribute('aria-rowindex')).toBe('12');
	});

	it('has no pagination nor row count when every row fits in one page', (): void => {
		renderOrders({ pageSize: 50 });

		expect(screen.queryByRole('navigation')).toBeNull();
		expect(screen.getByRole('table').hasAttribute('aria-rowcount')).toBe(false);
		expect(firstColumn()).toHaveLength(25);
	});
});

describe('DataTable sorting', (): void => {
	it('sorts by a column, toggles the direction and announces the order', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderOrders({ pageSize: 30 });
		const totalButton: HTMLElement = screen.getByRole('button', { name: 'Total' });

		expect(screen.queryByRole('button', { name: 'City' })).toBeNull();

		await user.click(totalButton);

		const totals: number[] = screen
			.getAllByRole('row')
			.slice(1)
			.map((row: HTMLElement): number => {
				return Number(within(row).getAllByRole('cell')[1]?.textContent.replace('R$ ', ''));
			});

		expect(totals).toEqual(totals.toSorted((left: number, right: number): number => left - right));

		expect(screen.getByRole('columnheader', { name: 'Total' }).getAttribute('aria-sort')).toBe(
			'ascending',
		);

		expect(status()).toBe('Sorted by Total, ascending');

		await user.click(totalButton);

		expect(screen.getByRole('columnheader', { name: 'Total' }).getAttribute('aria-sort')).toBe(
			'descending',
		);

		expect(status()).toBe('Sorted by Total, descending');
		expect(document.activeElement).toBe(totalButton);
	});

	it('returns to the first page when sorting', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handlePageChange = vi.fn();
		renderOrders({ defaultPage: 3, onPageChange: handlePageChange });

		await user.click(screen.getByRole('button', { name: 'Customer' }));

		expect(handlePageChange).toHaveBeenCalledWith(1);

		expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe(
			'true',
		);
	});

	it('can be controlled by the parent', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleSortChange = vi.fn();

		const ControlledTable = (): ReactElement => {
			const [sort, setSort] = useState<SortState | null>({
				columnId: 'customer',
				direction: 'descending',
			});

			return (
				<DataTable
					caption='Orders'
					columns={columns}
					rows={orders}
					getRowId={getOrderId}
					sort={sort}
					onSortChange={(next: SortState): void => {
						handleSortChange(next);
						setSort(next);
					}}
				/>
			);
		};

		renderTable(<ControlledTable />);
		expect(firstColumn()[0]).toBe('Fábio 24');

		await user.click(screen.getByRole('button', { name: 'Customer' }));
		expect(handleSortChange).toHaveBeenCalledWith({ columnId: 'customer', direction: 'ascending' });
		expect(firstColumn()[0]).toBe('Ana 1');
	});
});

describe('DataTable filtering and pagination', (): void => {
	it('filters by the searchable columns, ignoring accents, and announces the number of results', (): void => {
		const { rerender } = renderTable(
			<DataTable
				caption='Orders'
				columns={columns}
				rows={orders}
				getRowId={getOrderId}
				filter=''
			/>,
		);

		rerender(
			<DataTable
				caption='Orders'
				columns={columns}
				rows={orders}
				getRowId={getOrderId}
				filter='belem fabio'
			/>,
		);

		expect(firstColumn()).toEqual(['Fábio 6', 'Fábio 12', 'Fábio 18', 'Fábio 24']);
		expect(status()).toBe('4 rows');
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	it('shows the no results state when the filter matches nothing, and the empty state without rows', (): void => {
		const { rerender } = renderTable(
			<DataTable
				caption='Orders'
				columns={columns}
				rows={orders}
				getRowId={getOrderId}
				filter='Manaus'
			/>,
		);

		expect(screen.getByText('No rows match the filter')).toBeDefined();

		rerender(<DataTable caption='Orders' columns={columns} rows={[]} getRowId={getOrderId} />);
		expect(screen.getByText('No rows yet')).toBeDefined();
		expect(screen.getByRole('table', { name: 'Orders' })).toBeDefined();
	});

	it('changes pages and announces the visible rows', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderOrders();

		await user.click(screen.getByRole('button', { name: 'Page 3' }));

		expect(firstColumn()).toEqual(['Carla 21', 'Diego 22', 'Elisa 23', 'Fábio 24', 'Ana 25']);
		expect(status()).toBe('Rows 21 to 25 of 25');

		expect(screen.getByRole('button', { name: 'Page 3' }).getAttribute('aria-current')).toBe(
			'true',
		);
	});

	it('returns to the first page when the filter changes', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const { rerender } = renderTable(
			<DataTable
				caption='Orders'
				columns={columns}
				rows={orders}
				getRowId={getOrderId}
				filter=''
			/>,
		);

		await user.click(screen.getByRole('button', { name: 'Page 2' }));

		rerender(
			<DataTable
				caption='Orders'
				columns={columns}
				rows={orders}
				getRowId={getOrderId}
				filter='a'
			/>,
		);

		expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe(
			'true',
		);
	});
});

describe('DataTable states', (): void => {
	it('shows placeholder rows while loading, marks the table busy and announces it', (): void => {
		renderOrders({ status: 'loading' });
		const table: HTMLElement = screen.getByRole('table', { name: 'Orders' });

		expect(table.getAttribute('aria-busy')).toBe('true');
		expect(within(table).getAllByRole('row')).toHaveLength(1);
		expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
		expect(status()).toBe('Loading rows');
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	it('shows an announced error with a retry button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleRetry = vi.fn();

		renderOrders({
			status: 'error',
			errorDescription: 'Check your connection.',
			onRetry: handleRetry,
		});

		const alert: HTMLElement = screen.getByRole('alert');

		expect(alert.textContent).toContain('The rows could not be loaded');
		expect(alert.textContent).toContain('Check your connection.');

		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(handleRetry).toHaveBeenCalledOnce();
	});

	it('takes every text from labels, for translation', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		renderOrders({
			labels: {
				sorted: (column: string, direction: string): string => {
					return `Ordenado por ${column}, ${direction === 'ascending' ? 'crescente' : 'decrescente'}`;
				},
				pagination: (caption: string): string => `Páginas de ${caption}`,
			},
			paginationLabels: { page: (page: number): string => `Página ${String(page)}` },
		});

		expect(screen.getByRole('navigation', { name: 'Páginas de Orders' })).toBeDefined();
		await user.click(screen.getByRole('button', { name: 'Customer' }));
		expect(status()).toBe('Ordenado por Customer, crescente');
		expect(screen.getByRole('button', { name: 'Página 2' })).toBeDefined();
	});
});

describe('DataTable with server processing', (): void => {
	it('renders the given page as is and reports sorting and pages', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleSortChange = vi.fn();
		const handlePageChange = vi.fn();
		const pageOfRows: Order[] = orders.slice(10, 20).toReversed();

		renderTable(
			<DataTable
				caption='Orders'
				processing='server'
				rowCount={250}
				columns={columns.map((column: DataTableColumn<Order>): DataTableColumn<Order> => {
					return column.id === 'city' ? { ...column, sortable: true } : column;
				})}
				rows={pageOfRows}
				getRowId={getOrderId}
				page={2}
				filter='ignored by the table'
				onSortChange={handleSortChange}
				onPageChange={handlePageChange}
			/>,
		);

		expect(firstColumn()[0]).toBe(pageOfRows[0]?.customer);
		expect(screen.getByRole('table').getAttribute('aria-rowcount')).toBe('251');
		expect(screen.getByRole('button', { name: 'Page 25' })).toBeDefined();

		await user.click(screen.getByRole('button', { name: 'City' }));
		expect(handleSortChange).toHaveBeenCalledWith({ columnId: 'city', direction: 'ascending' });
		expect(handlePageChange).toHaveBeenCalledWith(1);
		expect(firstColumn()[0]).toBe(pageOfRows[0]?.customer);
	});
});

describe('DataTable with many rows', (): void => {
	it('renders only the rows of the current page', (): void => {
		const manyOrders: Order[] = Array.from(
			{ length: 10_000 },
			(_: unknown, index: number): Order => {
				return {
					id: String(index),
					customer: `Customer ${String(index)}`,
					city: 'Recife',
					total: index,
				};
			},
		);

		renderTable(
			<DataTable
				caption='Orders'
				columns={columns}
				rows={manyOrders}
				getRowId={getOrderId}
				pageSize={25}
			/>,
		);

		expect(screen.getAllByRole('row')).toHaveLength(26);
		expect(screen.getByRole('button', { name: 'Page 400' })).toBeDefined();
	});
});
