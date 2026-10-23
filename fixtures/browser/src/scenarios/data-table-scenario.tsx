// A data table over `rows` invoices: sorted, filtered and paged on the client, or a page at a time from a simulated
// server that knows how many rows match.
import { DataTable } from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, SortValue } from '@midnight-indigo/ui/data-display';
import { SearchField } from '@midnight-indigo/ui/forms';
import { useMemo, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import { createInvoices } from '@/src/datasets';
import type { Invoice } from '@/src/datasets';

interface DataTableScenarioProps {
	rowCount: number;
	processing: 'client' | 'server';
}

const pageSize: number = 25;

const currency: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
});

const columns: DataTableColumn<Invoice>[] = [
	{
		id: 'id',
		header: 'Invoice',
		rowHeader: true,
		cell: (invoice: Invoice): string => invoice.id,
		filterValue: (invoice: Invoice): string => invoice.id,
	},
	{
		id: 'customer',
		header: 'Customer',
		cell: (invoice: Invoice): string => invoice.customer,
		sortValue: (invoice: Invoice): SortValue => invoice.customer,
		filterValue: (invoice: Invoice): string => invoice.customer,
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
		cell: (invoice: Invoice): string => currency.format(invoice.total),
		sortValue: (invoice: Invoice): SortValue => invoice.total,
	},
];

const getInvoiceId = (invoice: Invoice): string => invoice.id;

const ClientTable = ({ rowCount }: { rowCount: number }): ReactElement => {
	const [filter, setFilter] = useState<string>('');
	const invoices: Invoice[] = useMemo((): Invoice[] => createInvoices(rowCount), [rowCount]);

	return (
		<>
			<SearchField
				label='Filter invoices'
				value={filter}
				onChange={(event: ChangeEvent<HTMLInputElement>): void => {
					setFilter(event.currentTarget.value);
				}}
			/>

			<DataTable
				caption='Invoices'
				columns={columns}
				rows={invoices}
				getRowId={getInvoiceId}
				filter={filter}
				locale='pt-BR'
				pageSize={pageSize}
			/>
		</>
	);
};

const ServerTable = ({ rowCount }: { rowCount: number }): ReactElement => {
	const [page, setPage] = useState<number>(1);

	// The simulated server answers with the rows of the requested page only.
	const pageOfInvoices: Invoice[] = useMemo((): Invoice[] => {
		return createInvoices(
			Math.min(pageSize, rowCount - (page - 1) * pageSize),
			(page - 1) * pageSize,
		);
	}, [page, rowCount]);

	return (
		<DataTable
			caption='Invoices'
			columns={columns}
			rows={pageOfInvoices}
			getRowId={getInvoiceId}
			processing='server'
			rowCount={rowCount}
			page={page}
			onPageChange={setPage}
			pageSize={pageSize}
		/>
	);
};

export const DataTableScenario = ({
	rowCount,
	processing,
}: DataTableScenarioProps): ReactElement => {
	return processing === 'server' ? (
		<ServerTable rowCount={rowCount} />
	) : (
		<ClientTable rowCount={rowCount} />
	);
};
