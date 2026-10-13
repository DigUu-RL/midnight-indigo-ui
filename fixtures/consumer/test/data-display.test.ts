// Renders the compiled data display components on the server, as a consumer's SSR framework would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	DataTable,
	EmptyState,
	ErrorState,
	List,
	ListItem,
	SkeletonText,
	sortRows,
	StatCard,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, DataTableProps, SortValue } from '@midnight-indigo/ui/data-display';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

interface Invoice {
	id: string;
	customer: string;
	total: number;
}

// Without a style cache, Emotion writes each `<style>` right before its element: markup is checked without them.
const withoutStyles = (html: string): string => html.replaceAll(/<style[^>]*>.*?<\/style>/gs, '');

const invoices: Invoice[] = Array.from({ length: 12 }, (_: unknown, index: number): Invoice => {
	return { id: String(index + 1), customer: `Customer ${String(index + 1)}`, total: index * 10 };
});

const columns: DataTableColumn<Invoice>[] = [
	{
		id: 'customer',
		header: 'Customer',
		rowHeader: true,
		cell: (invoice: Invoice): string => invoice.customer,
		sortValue: (invoice: Invoice): SortValue => invoice.customer,
	},
	{
		id: 'total',
		header: 'Total',
		align: 'end',
		cell: (invoice: Invoice): string => String(invoice.total),
		sortValue: (invoice: Invoice): SortValue => invoice.total,
	},
];

test('the compiled data table renders a sorted first page with headers and pagination on the server', (): void => {
	const props: DataTableProps<Invoice> = {
		caption: 'Invoices',
		columns,
		rows: invoices,
		getRowId: (invoice: Invoice): string => invoice.id,
		pageSize: 5,
		defaultSort: { columnId: 'total', direction: 'descending' },
	};

	const html: string = withoutStyles(renderToString(createElement(DataTable<Invoice>, props)));

	assert.match(
		html,
		/<table[^>]*aria-rowcount="13"[^>]*><caption id="[^"]+"[^>]*>Invoices<\/caption>/,
	);

	assert.match(
		html,
		/<th scope="col" aria-sort="descending"[^>]*><button type="button"[^>]*>Total/,
	);

	assert.match(html, /<th scope="row"[^>]*>Customer 12<\/th>/);
	assert.equal(html.match(/<tr aria-rowindex/g)?.length, 6);
	assert.match(html, /<nav aria-label="Pages of Invoices">/);
	assert.match(html, /role="status"/);
});

test('the compiled table primitives, list, stat card and states render on the server', (): void => {
	const page: ReactElement = createElement(
		'main',
		null,
		createElement(
			Table,
			{ caption: 'Plans' },
			createElement(
				TableHead,
				null,
				createElement(TableRow, null, createElement(TableHeaderCell, null, 'Plan')),
			),
			createElement(
				TableBody,
				null,
				createElement(TableRow, null, createElement(TableCell, null, 'Pro')),
			),
		),
		createElement(
			List,
			{ 'aria-label': 'Team' },
			createElement(ListItem, { title: 'Ana', description: 'Designer' }),
		),
		createElement(StatCard, {
			label: 'Revenue',
			value: 'R$ 12.400',
			change: { value: '12%', trend: 'up' },
		}),
		createElement(EmptyState, { title: 'No reports yet' }),
		createElement(ErrorState, { title: 'Could not load', announce: false }),
		createElement(SkeletonText, { label: 'Loading the report' }),
	);

	const html: string = withoutStyles(renderToString(page));

	assert.match(html, /<th scope="col"[^>]*>Plan<\/th>/);
	assert.match(html, /<ul aria-label="Team"[^>]*><li/);
	assert.match(html, /role="group" aria-labelledby="([^"]+)"[^>]*>.*?<p id="\1"[^>]*>Revenue<\/p>/);
	assert.match(html, /Up <\/span>12%/);
	assert.match(html, /No reports yet/);
	assert.doesNotMatch(html, /role="alert"/);
	assert.match(html, /role="status"[^>]*><span[^>]*>Loading the report<\/span>/);
});

test('the row processing helpers are exported for server-side use', (): void => {
	const sorted: Invoice[] = sortRows(
		invoices,
		(invoice: Invoice): SortValue => invoice.total,
		'descending',
	);

	assert.equal(sorted[0]?.id, '12');
});
