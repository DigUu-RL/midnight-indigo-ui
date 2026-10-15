// Visual regression of the sales overview: the shell with the figures loaded, the rail, the error state and the phone
// layout with its drawer. The chart canvas is masked: the chart engine has its own suite, and a difference there would
// hide one in the shell. Update the baselines on purpose only (see starter.test.ts).
import type { Locator, Page } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

const openDashboard = async (page: Page, path: string = '/en-us'): Promise<void> => {
	await page.goto(path);
	await expect(page.getByRole('main')).toBeVisible();

	await page.evaluate(async (): Promise<void> => {
		await document.fonts.ready;
	});
};

const waitForFigures = async (page: Page): Promise<void> => {
	await expect(page.getByRole('group', { name: 'Revenue', exact: true })).not.toHaveAttribute(
		'aria-busy',
	);

	await expect(
		page.getByRole('region', { name: 'Revenue by month' }).locator('canvas'),
	).toBeVisible();
};

const masks = (page: Page): Locator[] => [page.locator('canvas')];

test('the dashboard matches its baseline', async ({ page }): Promise<void> => {
	await openDashboard(page);
	await waitForFigures(page);

	await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true, mask: masks(page) });
});

test('the dashboard with the sidebar as a rail matches its baseline', async ({
	page,
}): Promise<void> => {
	await openDashboard(page);
	await waitForFigures(page);
	await page.getByRole('button', { name: 'Collapse navigation' }).click();
	await expect(page.getByRole('button', { name: 'Expand navigation' })).toBeVisible();

	await expect(page).toHaveScreenshot('dashboard-rail.png', { mask: masks(page) });
});

test('the error state of the dashboard matches its baseline', async ({ page }): Promise<void> => {
	await openDashboard(page, '/en-us?state=error');
	await expect(page.getByRole('main').getByRole('alert')).toBeVisible();

	await expect(page).toHaveScreenshot('dashboard-error.png');
});

test.describe('on a phone', (): void => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('the dashboard and its navigation drawer match their baselines', async ({
		page,
	}): Promise<void> => {
		await openDashboard(page);
		await waitForFigures(page);
		await expect(page).toHaveScreenshot('dashboard-phone.png', { mask: masks(page) });

		await page.getByRole('button', { name: 'Open navigation' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await expect(page).toHaveScreenshot('dashboard-phone-navigation-open.png', {
			mask: masks(page),
		});
	});
});
