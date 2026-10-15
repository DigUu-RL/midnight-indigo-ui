// Navigation: links go through next/link without reloading the page, the pagination moves the current page, and below
// 840 px the sidebar opens as a drawer from its menu button.
import type { Locator } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

test('a link navigates on the client, without reloading the page', async ({
	page,
}): Promise<void> => {
	await page.goto('/gallery');

	// A full reload would lose this marker; a client-side navigation keeps the same document.
	await page.evaluate((): void => {
		document.documentElement.dataset.sameDocument = 'true';
	});

	await page.getByRole('link', { name: 'getting started guide' }).click();
	await expect(page).toHaveURL('/gallery?view=guide');

	expect(
		await page.evaluate((): string | undefined => document.documentElement.dataset.sameDocument),
	).toBe('true');
});

test('the pagination moves the current page', async ({ page }): Promise<void> => {
	await page.goto('/gallery');

	const pagination: Locator = page.getByRole('navigation', { name: 'Pagination', exact: true });
	await pagination.getByRole('button', { name: 'Page 2' }).click();

	await expect(pagination.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
		'aria-current',
		'true',
	);

	await pagination.getByRole('button', { name: 'Next page' }).click();

	await expect(pagination.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
		'aria-current',
		'true',
	);
});

test.describe('on a phone', (): void => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

	test('the sidebar opens as a drawer and closes with Escape', async ({ page }): Promise<void> => {
		await page.goto('/gallery');

		const menuButton: Locator = page.getByRole('button', { name: 'Open navigation' });
		await menuButton.tap();

		const drawer: Locator = page.getByRole('dialog');
		await expect(drawer.getByRole('navigation', { name: 'Demo navigation' })).toBeVisible();

		await page.keyboard.press('Escape');

		await expect(drawer).toBeHidden();
		await expect(menuButton).toBeFocused();
	});
});
