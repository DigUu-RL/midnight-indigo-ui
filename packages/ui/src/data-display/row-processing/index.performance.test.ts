// Budgets of client-side processing (docs/en-us/data-display.md, "Large datasets"). Each budget is about four times the time
// measured on a development laptop: loose enough for a shared CI runner, tight enough to catch a change of complexity.
// 10 000 rows is the size supported on the client; 100 000 and 1 000 000 rows cover `sortRows` and `filterRows` used
// by a server written in TypeScript.
import { describe, expect, it } from 'vitest';

import { createInvoices } from '@/test/large-datasets';
import type { Invoice } from '@/test/large-datasets';
import { budget, fastestRun } from '@/test/performance';
import {
	createRowCollator,
	createSearchIndex,
	filterRows,
	pageRows,
	sortRows,
} from '@/src/data-display/row-processing/index';
import type { SortValue } from '@/src/data-display/row-processing/index';

const collator: Intl.Collator = createRowCollator('pt-BR');
const byCustomer = (invoice: Invoice): SortValue => invoice.customer;
const byTotal = (invoice: Invoice): SortValue => invoice.total;
const searchableTexts = (invoice: Invoice): string[] => [invoice.customer, invoice.city];

describe('row processing, 10 000 rows (supported on the client)', (): void => {
	const invoices: Invoice[] = createInvoices(10_000);
	const searchIndex: string[] = createSearchIndex(invoices, searchableTexts);

	it('sorts by text in less than 250 ms', (): void => {
		const elapsed: number = fastestRun((): void => {
			sortRows(invoices, byCustomer, 'ascending', collator);
		});

		expect(elapsed).toBeLessThan(budget(250));
	});

	it('filters with the index already built in less than 25 ms per query', (): void => {
		const elapsed: number = fastestRun((): void => {
			filterRows(invoices, searchIndex, 'curitiba 12');
		});

		expect(elapsed).toBeLessThan(budget(25));
	});
});

describe('row processing, 100 000 rows', (): void => {
	const invoices: Invoice[] = createInvoices(100_000);

	it('sorts by text in less than 3 s', (): void => {
		const elapsed: number = fastestRun((): void => {
			sortRows(invoices, byCustomer, 'ascending', collator);
		}, 2);

		expect(elapsed).toBeLessThan(budget(3000));
	});

	it('sorts by number in less than 400 ms', (): void => {
		const elapsed: number = fastestRun((): void => {
			sortRows(invoices, byTotal, 'descending', collator);
		});

		expect(elapsed).toBeLessThan(budget(400));
	});

	it('builds the search index in less than 400 ms and filters in less than 100 ms', (): void => {
		const indexing: number = fastestRun((): void => {
			createSearchIndex(invoices, searchableTexts);
		});

		const searchIndex: string[] = createSearchIndex(invoices, searchableTexts);

		const filtering: number = fastestRun((): void => {
			filterRows(invoices, searchIndex, 'curitiba 12');
		});

		expect(indexing).toBeLessThan(budget(400));
		expect(filtering).toBeLessThan(budget(100));
	});
});

describe('row processing, 1 000 000 rows', (): void => {
	const invoices: Invoice[] = createInvoices(1_000_000);

	it('sorts by number in less than 4 s', (): void => {
		const elapsed: number = fastestRun((): void => {
			sortRows(invoices, byTotal, 'ascending', collator);
		}, 2);

		expect(elapsed).toBeLessThan(budget(4000));
	});

	it('filters with the index already built in less than 400 ms', (): void => {
		const searchIndex: string[] = createSearchIndex(invoices, searchableTexts);

		const elapsed: number = fastestRun((): void => {
			filterRows(invoices, searchIndex, 'curitiba 12');
		});

		expect(elapsed).toBeLessThan(budget(400));
	});

	it('slices a page in constant time, whatever the page', (): void => {
		const elapsed: number = fastestRun((): void => {
			pageRows(invoices, 39_999, 25);
		});

		expect(pageRows(invoices, 40_000, 25)).toHaveLength(25);
		expect(elapsed).toBeLessThan(budget(1));
	});
});

describe('row processing work', (): void => {
	it('reads each sort value once, whatever the number of comparisons', (): void => {
		const invoices: Invoice[] = createInvoices(50_000);
		let reads: number = 0;

		sortRows(
			invoices,
			(invoice: Invoice): SortValue => {
				reads += 1;
				return invoice.customer;
			},
			'ascending',
			collator,
		);

		expect(reads).toBe(invoices.length);
	});

	it('reads the searchable texts of each row once, when the index is built', (): void => {
		const invoices: Invoice[] = createInvoices(50_000);
		let reads: number = 0;

		const searchIndex: string[] = createSearchIndex(invoices, (invoice: Invoice): string[] => {
			reads += 1;
			return searchableTexts(invoice);
		});

		filterRows(invoices, searchIndex, 'recife');
		filterRows(invoices, searchIndex, 'recife 1');
		filterRows(invoices, searchIndex, 'recife 12');

		expect(reads).toBe(invoices.length);
	});
});
