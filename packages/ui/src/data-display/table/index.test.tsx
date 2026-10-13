// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { declarationsOf, expectNoAxeViolations } from '#test/component-harness.ts';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '#src/data-display/table/index.tsx';
import type { TableProps } from '#src/data-display/table/index.tsx';

afterEach((): void => {
	cleanup();
	vi.unstubAllGlobals();
});

const OrdersTable = (props: Partial<TableProps>): ReactElement => {
	return (
		<Table caption='Orders' {...props}>
			<TableHead>
				<TableRow>
					<TableHeaderCell>Customer</TableHeaderCell>
					<TableHeaderCell align='end'>Total</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				<TableRow>
					<TableHeaderCell scope='row'>Ana</TableHeaderCell>
					<TableCell align='end'>R$ 120,00</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};

describe('Table', (): void => {
	it('is named by its caption and associates every cell with its headers', async (): Promise<void> => {
		const { container } = render(<OrdersTable />);
		const table: HTMLElement = screen.getByRole('table', { name: 'Orders' });

		expect(
			within(table)
				.getAllByRole('columnheader')
				.map((cell: HTMLElement) => cell.textContent),
		).toEqual(['Customer', 'Total']);

		expect(within(table).getByRole('rowheader', { name: 'Ana' }).getAttribute('scope')).toBe('row');

		expect(within(table).getByRole('columnheader', { name: 'Total' }).getAttribute('scope')).toBe(
			'col',
		);

		await expectNoAxeViolations(container);
	});

	it('can hide the caption visually and keep the name', (): void => {
		render(<OrdersTable hideCaption />);
		const caption: HTMLElement = screen.getByText('Orders');

		expect(screen.getByRole('table', { name: 'Orders' })).toBeDefined();
		expect(declarationsOf(caption, '&')).toContain('clip:rect(0 0 0 0);');
	});

	it('aligns cells and lines up digits', (): void => {
		render(<OrdersTable density='compact' />);

		expect(declarationsOf(screen.getByText('R$ 120,00'), '&')).toContain('text-align:end;');

		expect(declarationsOf(screen.getByText('R$ 120,00'), '&')).toContain(
			'padding:var(--mi-spacing-2) var(--mi-spacing-3);',
		);

		expect(declarationsOf(screen.getByRole('table'), '&')).toContain(
			'font-variant-numeric:tabular-nums;',
		);
	});

	it('becomes a focusable region named by the caption only while it overflows', (): void => {
		let notify: () => void = (): void => undefined;

		vi.stubGlobal(
			'ResizeObserver',
			class {
				public constructor(callback: () => void) {
					notify = callback;
				}

				public observe(): void {
					return undefined;
				}

				public disconnect(): void {
					return undefined;
				}
			},
		);

		render(<OrdersTable />);
		const container: HTMLElement = screen.getByRole('table').parentElement ?? document.body;

		expect(container.getAttribute('tabindex')).toBeNull();
		expect(screen.queryByRole('region')).toBeNull();
		Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 900 });
		Object.defineProperty(container, 'clientWidth', { configurable: true, value: 400 });

		act((): void => {
			notify();
		});

		expect(screen.getByRole('region', { name: 'Orders' }).getAttribute('tabindex')).toBe('0');
	});
});

describe('TableHeaderCell sorting', (): void => {
	it('holds a sort button named by the header, and only the sorted column has aria-sort', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleSort = vi.fn();

		const { container } = render(
			<Table caption='Orders'>
				<TableHead>
					<TableRow>
						<TableHeaderCell sortDirection='descending' onSort={handleSort}>
							Customer
						</TableHeaderCell>

						<TableHeaderCell sortDirection={null} onSort={handleSort}>
							Total
						</TableHeaderCell>

						<TableHeaderCell>Notes</TableHeaderCell>
					</TableRow>
				</TableHead>

				<TableBody>
					<TableRow>
						<TableCell>Ana</TableCell>
						<TableCell>10</TableCell>
						<TableCell>—</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);

		const [customer, total, notes] = screen.getAllByRole('columnheader');

		expect(customer?.getAttribute('aria-sort')).toBe('descending');
		expect(total?.hasAttribute('aria-sort')).toBe(false);
		expect(notes?.querySelector('button')).toBeNull();

		await user.click(screen.getByRole('button', { name: 'Total' }));
		expect(handleSort).toHaveBeenCalledOnce();
		await expectNoAxeViolations(container);
	});
});
