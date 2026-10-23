// The sales overview over its mock API: the shell by keyboard on desktop and as a drawer on a phone, the filters, and
// the loading, empty and error states, each with an accessibility audit (contrast included).
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '@/test/support/accessibility';
import { expect, test } from '@/test/support/fixtures';

// The mock API answers after 600 ms; the figures are ready once the first card has a value.
const openDashboard = async (page: Page, path: string = '/en-us'): Promise<void> => {
	await page.goto(path);
	await expect(page.getByRole('main')).toBeVisible();
};

const waitForFigures = async (page: Page): Promise<void> => {
	await expect(page.getByRole('group', { name: 'Revenue', exact: true })).not.toHaveAttribute(
		'aria-busy',
	);
};

const scenarios = (page: Page): Locator => page.getByRole('navigation', { name: 'Data scenario' });

test('the shell has its landmarks and the figures load from the mock API', async ({
	page,
}): Promise<void> => {
	await openDashboard(page);

	await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

	await expect(
		page.getByRole('banner').getByRole('button', { name: 'Notifications' }),
	).toBeVisible();

	await expect(page.getByRole('heading', { level: 1, name: 'Sales overview' })).toBeVisible();
	await expect(page.getByRole('search', { name: 'Filters' })).toBeVisible();
	await waitForFigures(page);

	await expect(page.getByRole('group', { name: 'Revenue', exact: true })).toContainText('R$4.33M');

	await expect(
		page.getByRole('region', { name: 'Revenue by month' }).locator('canvas'),
	).toBeVisible();

	await expect(page.getByRole('table', { name: 'Orders' }).getByRole('row')).toHaveCount(9);
	await expectNoAxeViolations(page);
});

test('the skip link is the first stop and moves the focus to the main content', async ({
	page,
}): Promise<void> => {
	await openDashboard(page);
	await page.keyboard.press('Tab');

	const skipLink: Locator = page.getByRole('link', { name: 'Skip to main content' });

	await expect(skipLink).toBeFocused();
	await expect(skipLink).toBeInViewport();
	await page.keyboard.press('Enter');

	await expect(page.getByRole('main')).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByRole('main').getByRole('button', { name: 'Refresh data' })).toBeFocused();
});

test('the sidebar is reached by keyboard and collapses to a rail', async ({
	page,
}): Promise<void> => {
	await openDashboard(page);
	const navigation: Locator = page.getByRole('navigation', { name: 'Main navigation' });

	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await expect(navigation.getByRole('link', { name: 'Sales overview' })).toBeFocused();
	await page.getByRole('button', { name: 'Collapse navigation' }).click();

	await expect(page.getByRole('button', { name: 'Expand navigation' })).toBeVisible();
	// The first brand is the sidebar's; the second, in the top bar, is only shown on narrow viewports.
	await expect(page.getByText('Aurora Retail').first()).toBeHidden();
	await expect(navigation.getByRole('link', { name: 'Orders' })).toBeVisible();
});

test('the filters narrow the figures, the chart and the orders', async ({
	page,
}): Promise<void> => {
	await openDashboard(page);
	await waitForFigures(page);
	const revenue: Locator = page.getByRole('group', { name: 'Revenue', exact: true });

	await page.getByLabel('Region').selectOption('northeast');
	await expect(revenue).toContainText('R$');
	await expect(revenue).not.toContainText('R$4.33M');
	const chart: Locator = page.getByRole('region', { name: 'Revenue by month' });

	// One series left, so the chart drops its legend.
	await expect(chart.getByRole('button', { name: 'South', exact: true })).toHaveCount(0);

	await expect(page.getByRole('table', { name: 'Orders' }).getByRole('row').nth(1)).toContainText(
		/Recife|Salvador/,
	);

	await page.getByRole('button', { name: 'Clear filters' }).click();
	await expect(page.getByLabel('Region')).toHaveValue('all');
	await expect(revenue).toContainText('R$4.33M');
});

test('a scenario chosen in its navigation loads on the client', async ({ page }): Promise<void> => {
	await openDashboard(page);

	await page.evaluate((): void => {
		document.documentElement.dataset.sameDocument = 'true';
	});

	await scenarios(page).getByRole('link', { name: 'No data' }).click();
	await expect(page).toHaveURL('/en-us?state=empty');

	await expect(scenarios(page).getByRole('link', { name: 'No data' })).toHaveAttribute(
		'aria-current',
		'page',
	);

	expect(
		await page.evaluate((): string | undefined => document.documentElement.dataset.sameDocument),
	).toBe('true');
});

test('the loading state marks the figures busy and shows placeholders', async ({
	page,
}): Promise<void> => {
	await openDashboard(page, '/en-us?state=loading');

	await expect(page.getByRole('group', { name: 'Revenue', exact: true })).toHaveAttribute(
		'aria-busy',
		'true',
	);

	await expect(page.getByRole('table', { name: 'Orders' })).toHaveAttribute('aria-busy', 'true');
	await expectNoAxeViolations(page);
});

test('the empty state explains that there is nothing in the period', async ({
	page,
}): Promise<void> => {
	await openDashboard(page, '/en-us?state=empty');

	await expect(page.getByText('No revenue in this period')).toBeVisible();
	await expect(page.getByText('No orders in this period')).toBeVisible();
	await expect(page.getByRole('group', { name: 'Orders', exact: true })).toContainText('0');
	await expectNoAxeViolations(page);
});

test('the error state is announced and offers to try again', async ({ page }): Promise<void> => {
	await openDashboard(page, '/en-us?state=error');
	// Scoped to the page: the route announcer of Next.js is an alert too.
	const alert: Locator = page.getByRole('main').getByRole('alert');

	await expect(alert).toContainText('The sales data could not be loaded');
	await expectNoAxeViolations(page);
	await alert.getByRole('button', { name: 'Try again' }).click();

	await expect(page.getByRole('button', { name: 'Refresh data' })).toHaveAttribute(
		'aria-busy',
		'true',
	);

	await expect(alert).toContainText('The sales data could not be loaded');
});

test.describe('on a phone', (): void => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

	test('the navigation opens as a drawer from the top bar and closes after a choice', async ({
		page,
	}): Promise<void> => {
		await openDashboard(page);
		await waitForFigures(page);
		const banner: Locator = page.getByRole('banner');

		await expect(banner.getByText('Aurora Retail')).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
		await expectNoAxeViolations(page);
		await banner.getByRole('button', { name: 'Open navigation' }).tap();
		const drawer: Locator = page.getByRole('dialog', { name: 'Main navigation' });

		await expect(drawer).toBeVisible();
		await expectNoAxeViolations(page);
		await drawer.getByRole('link', { name: 'Orders' }).tap();

		await expect(drawer).toBeHidden();
		await expect(page).toHaveURL('/en-us/orders');
		await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
	});

	test('the page fits the viewport without a horizontal scroll', async ({
		page,
	}): Promise<void> => {
		await openDashboard(page);
		await waitForFigures(page);

		expect(
			await page.evaluate((): number => document.documentElement.scrollWidth),
		).toBeLessThanOrEqual(390);
	});
});
