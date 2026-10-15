'use client';
// Data display: key figures, a table filtered, sorted and paged on the client, a list and the empty state.
import {
	Card,
	CardContent,
	CardHeader,
	DataTable,
	EmptyState,
	List,
	ListItem,
	StatCard,
} from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, SortValue } from '@midnight-indigo/ui/data-display';
import { SearchField } from '@midnight-indigo/ui/forms';
import { Grid, Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ChangeEvent, SubmitEvent, ReactElement } from 'react';

interface Invoice {
	id: string;
	customer: string;
	city: string;
	total: number;
}

const customers: readonly string[] = [
	'Ana Souza',
	'Bruno Lima',
	'Carla Dias',
	'Diego Rocha',
	'Elisa Melo',
];

const cities: readonly string[] = ['São Paulo', 'Recife', 'Belém', 'Curitiba'];

const currency: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
});

const invoices: Invoice[] = Array.from({ length: 42 }, (_: unknown, index: number): Invoice => {
	return {
		id: `INV-${String(1001 + index)}`,
		customer: customers[index % customers.length] ?? '',
		city: cities[index % cities.length] ?? '',
		total: ((index * 7919) % 5000) + 120,
	};
});

// A constant: the table indexes the searchable text once per list of columns and rows.
const columns: DataTableColumn<Invoice>[] = [
	{
		id: 'id',
		header: 'Invoice',
		rowHeader: true,
		cell: (invoice: Invoice): string => invoice.id,
		sortValue: (invoice: Invoice): SortValue => invoice.id,
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

export const DataDisplayShowcase = (): ReactElement => {
	const [filter, setFilter] = useState<string>('');

	return (
		<Card as='section'>
			<CardHeader
				title='Data display'
				subtitle='Key figures, a table sorted, filtered and paged on the client, a list and the empty state.'
				headingLevel={2}
			/>

			<CardContent>
				<Stack gap='6'>
					<Grid columns={{ compact: 1, medium: 3 }} gap='3'>
						<StatCard
							label='Revenue'
							value={currency.format(48_210)}
							change={{ value: '12%', trend: 'up' }}
							description='vs. last month'
						/>

						<StatCard
							label='Refunds'
							value={currency.format(1_340)}
							change={{ value: '4%', trend: 'up', sentiment: 'negative' }}
							description='vs. last month'
						/>

						<StatCard label='Active customers' value='1.284' loading />
					</Grid>

					<form
						role='search'
						aria-label='Invoices'
						onSubmit={(event: SubmitEvent<HTMLFormElement>): void => {
							event.preventDefault();
						}}
					>
						<SearchField
							label='Filter invoices'
							value={filter}
							onChange={(event: ChangeEvent<HTMLInputElement>): void => {
								setFilter(event.currentTarget.value);
							}}
						/>
					</form>

					<DataTable
						caption='Invoices'
						columns={columns}
						rows={invoices}
						getRowId={getInvoiceId}
						filter={filter}
						locale='pt-BR'
						pageSize={8}
						defaultSort={{ columnId: 'total', direction: 'descending' }}
					/>

					<List aria-label='Latest customers'>
						<ListItem
							title='Ana Souza'
							description='São Paulo · 12 invoices'
							trailing={currency.format(8_420)}
						/>

						<ListItem
							title='Bruno Lima'
							description='Recife · 9 invoices'
							trailing={currency.format(5_130)}
						/>
					</List>

					<EmptyState title='No disputes' description='Disputed invoices appear here.' />
				</Stack>
			</CardContent>
		</Card>
	);
};
