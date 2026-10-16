// The icon browser: a search across every set, an icon shown in each size and intent, its code copied, and the
// attribution page, all audited by axe (contrast included). The icons arrive as inline SVG; no request fetches them.
import type { Locator, Request } from '@playwright/test';

import { expectNoAxeViolations } from '#test/support/accessibility.ts';
import { expect, test } from '#test/support/fixtures.ts';

test('searches every set and shows an icon with the code to use it', async ({
	page,
	context,
}): Promise<void> => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	const iconRequests: string[] = [];

	page.on('request', (request: Request): void => {
		if (/iconify|\.svg(\?|$)/.test(request.url())) iconRequests.push(request.url());
	});

	await page.goto('/en-us/icons');
	await page.getByLabel('Name', { exact: true }).fill('rocket');
	await page.getByLabel('Set', { exact: true }).selectOption('tabler');
	await page.getByRole('button', { name: 'Search' }).click();

	await expect(page).toHaveURL(/\?q=rocket&set=tabler/);
	const results: Locator = page.getByRole('region', { name: /\d+ icons?/ });
	await results.getByRole('link', { name: 'rocket', exact: true }).click();

	await expect(page.getByRole('heading', { level: 2, name: 'tabler:rocket' })).toBeVisible();
	await expect(page.getByRole('img', { name: 'Official' })).toBeVisible();
	await expectNoAxeViolations(page);

	await page.getByRole('button', { name: 'Copy the data code' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Code copied' })).toBeVisible();

	const copied: string = await page.evaluate(async (): Promise<string> => {
		return navigator.clipboard.readText();
	});

	expect(copied).toContain('export const rocketIcon: IconifyIconData = {');
	expect(iconRequests).toEqual([]);
});

test('credits the authors of the sets that require it', async ({ page }): Promise<void> => {
	await page.goto('/pt-br/icons/attribution');

	await expect(
		page.getByRole('heading', { level: 1, name: 'Atribuição dos ícones' }),
	).toBeVisible();

	await expect(page.getByRole('table', { name: /exigem atribuição/ })).toBeVisible();
	await expectNoAxeViolations(page);
});
