// Visual regression of the pages of the starter application: orders, reports, the customer form (also with its
// errors), the palette editor and the 404 page in Portuguese. Chart canvases are masked, as in dashboard.test.ts. Update
// the baselines on purpose only (see gallery.test.ts).
import type { Locator, Page } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

const openPage = async (page: Page, path: string, heading: string): Promise<void> => {
	await page.goto(path);
	await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

	await page.evaluate(async (): Promise<void> => {
		await document.fonts.ready;
	});
};

const masks = (page: Page): Locator[] => [page.locator('canvas')];

test('the orders page matches its baseline', async ({ page }): Promise<void> => {
	await openPage(page, '/en-us/orders', 'Orders');
	await expect(page).toHaveScreenshot('orders.png', { fullPage: true });
});

test('the reports page matches its baseline', async ({ page }): Promise<void> => {
	await openPage(page, '/en-us/reports', 'Reports');

	// The charts below the first row draw when they come into view.
	for (const figure of await page.getByRole('figure').all()) {
		await figure.scrollIntoViewIfNeeded();
		await expect(figure.locator('canvas')).toBeVisible();
	}

	await page.evaluate((): void => {
		window.scrollTo(0, 0);
	});

	await expect(page).toHaveScreenshot('reports.png', { fullPage: true, mask: masks(page) });
});

test('the customer form and its errors match their baselines', async ({ page }): Promise<void> => {
	await openPage(page, '/en-us/customers/new', 'New customer');
	await expect(page).toHaveScreenshot('new-customer.png', { fullPage: true });

	await page.getByRole('button', { name: 'Register customer' }).click();
	await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');

	await expect(page).toHaveScreenshot('new-customer-errors.png', { fullPage: true });
});

test('the palette editor matches its baseline', async ({ page }): Promise<void> => {
	await openPage(page, '/en-us/settings/appearance', 'Appearance');
	await expect(page).toHaveScreenshot('appearance.png', { fullPage: true });
});

test.describe('a missing page', (): void => {
	// The browser reports the 404 status of the document itself.
	test.use({ expectedConsoleMessages: [/status of 404/] });

	test('in Portuguese matches its baseline', async ({ page }): Promise<void> => {
		await openPage(page, '/pt-br/nao/existe', 'Página não encontrada');
		await expect(page).toHaveScreenshot('not-found-pt-br.png');
	});
});
