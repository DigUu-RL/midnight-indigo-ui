// The orders page: every order in a table that filters by status, region and text, sorts and pages on the client, and
// shows an empty state with a way out when nothing matches.
import type { Locator, Page } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

const table = (page: Page): Locator => page.getByRole('table', { name: 'All orders' });

test('the selects narrow the orders and the empty state clears the filters', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/orders');
	await expect(table(page).getByRole('row')).toHaveCount(11);

	await page.getByLabel('Status').selectOption('refunded');
	await expect(table(page).getByRole('row').nth(1)).toContainText('Refunded');
	await expect(table(page).getByRole('cell', { name: 'Paid', exact: true })).toHaveCount(0);

	await page.getByLabel('Region').selectOption('northeast');
	await expect(table(page).getByRole('row').nth(1)).toContainText(/Recife|Salvador/);

	await page.getByRole('searchbox', { name: 'Search' }).fill('no customer has this name');
	const empty: Locator = page.getByRole('heading', { name: 'No order matches the filters' });

	await expect(empty).toBeVisible();
	await page.getByRole('main').getByRole('button', { name: 'Clear filters' }).last().click();

	await expect(empty).toBeHidden();
	await expect(page.getByLabel('Status')).toHaveValue('all');
	await expect(table(page).getByRole('row')).toHaveCount(11);
});

test('a column sorts the orders and the pages move through them', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/orders');
	await table(page).getByRole('button', { name: 'Total' }).click();

	await expect(table(page).getByRole('columnheader', { name: 'Total' })).toHaveAttribute(
		'aria-sort',
		'ascending',
	);

	await expect(table(page).getByRole('row').nth(1)).toContainText('R$89.90');

	await page
		.getByRole('navigation', { name: 'Pages of All orders' })
		.getByRole('button', { name: 'Page 2', exact: true })
		.click();

	await expect(
		page
			.getByRole('navigation', { name: 'Pages of All orders' })
			.getByRole('button', { name: 'Page 2', exact: true }),
	).toHaveAttribute('aria-current', 'true');
});
