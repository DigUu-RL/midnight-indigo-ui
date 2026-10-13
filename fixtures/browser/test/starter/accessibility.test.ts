// axe-core on the rendered starter, contrast included, at rest and with overlays open.
import { expectNoAxeViolations } from '#test/support/accessibility.ts';
import { expect, test } from '#test/support/fixtures.ts';

test('the page has no accessibility violation', async ({ page }): Promise<void> => {
	await page.goto('/');
	await expectNoAxeViolations(page);
});

test('an open dialog has no accessibility violation', async ({ page }): Promise<void> => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Rename report' }).click();
	await expect(page.getByRole('dialog', { name: 'Rename report' })).toBeVisible();

	await expectNoAxeViolations(page);
});

test('an open menu has no accessibility violation', async ({ page }): Promise<void> => {
	await page.goto('/');
	await page.getByRole('button', { name: 'More actions' }).click();
	await expect(page.getByRole('menu')).toBeVisible();

	await expectNoAxeViolations(page);
});

test.describe('on a phone', (): void => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('the page and the navigation drawer have no accessibility violation', async ({
		page,
	}): Promise<void> => {
		await page.goto('/');
		await expectNoAxeViolations(page);

		await page.getByRole('button', { name: 'Open navigation' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await expectNoAxeViolations(page);
	});
});
