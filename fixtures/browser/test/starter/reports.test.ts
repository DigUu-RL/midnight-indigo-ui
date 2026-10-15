// The reports page: one chart of each factory, each named by its panel and read by its summary; the charts below the
// first row load the engine only when they come into view.
import type { Locator } from '@playwright/test';

import { expectNoAxeViolations } from '#test/support/accessibility.ts';
import { expect, test } from '#test/support/fixtures.ts';

const chartNames: readonly string[] = [
	'Orders by status',
	'Revenue and average ticket',
	'Revenue by store',
	'Share of each status',
	'Monthly goal',
];

test('every chart is drawn once in view, with a name and a summary', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/reports');

	for (const name of chartNames) {
		const figure: Locator = page.getByRole('figure', { name });

		await figure.scrollIntoViewIfNeeded();
		await expect(figure.locator('canvas')).toBeVisible();
	}

	await expect(page.getByRole('figure', { name: 'Monthly goal' })).toContainText(
		/Revenue of September: R\$[\d,]+, \d+% of the goal of R\$850,000\./,
	);

	await expectNoAxeViolations(page);
});

test('a chart shows its data as a table', async ({ page }): Promise<void> => {
	await page.goto('/en-us/reports');
	const figure: Locator = page.getByRole('figure', { name: 'Revenue by store' });

	await figure.scrollIntoViewIfNeeded();
	await figure.getByRole('button', { name: /table/i }).click();

	await expect(figure.getByRole('table')).toContainText('São Paulo Pinheiros');
});
