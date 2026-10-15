// The invoices table of the starter: filtering, sorting and paging on the client, each announced to screen readers.
import type { Locator } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

const cityColumn: number = 2;

test('filters, sorts and pages the invoices, announcing each change', async ({
	page,
}): Promise<void> => {
	await page.goto('/gallery');

	const table: Locator = page.getByRole('table', { name: 'Invoices' });
	const status: Locator = page.getByRole('status').filter({ hasText: /rows?|Rows|Sorted/ });

	await page.getByRole('searchbox', { name: 'Filter invoices' }).fill('recife');

	await expect(status).toHaveText(/^\d+ rows$/);

	const cities: string[] = await table
		.getByRole('row')
		.filter({ has: page.getByRole('cell') })
		.evaluateAll((rows: Element[], column: number): string[] => {
			return rows.map((row: Element): string => row.children[column]?.textContent ?? '');
		}, cityColumn);

	expect(cities.length).toBeGreaterThan(0);
	expect(new Set(cities)).toEqual(new Set(['Recife']));

	await page.getByRole('searchbox', { name: 'Filter invoices' }).fill('');
	await table.getByRole('button', { name: 'Customer' }).click();

	await expect(table.getByRole('columnheader', { name: 'Customer' })).toHaveAttribute(
		'aria-sort',
		'ascending',
	);

	await expect(status).toHaveText('Sorted by Customer, ascending');

	await page
		.getByRole('navigation', { name: 'Pages of Invoices' })
		.getByRole('button', { name: 'Page 2' })
		.click();

	await expect(status).toHaveText('Rows 9 to 16 of 42');
});
