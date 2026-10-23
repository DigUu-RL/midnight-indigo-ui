// Overlays with the keyboard and the pointer: focus moves in, Escape closes, focus returns to the trigger, and actions
// report their outcome in a toast.
import type { Locator } from '@playwright/test';

import { expect, test } from '@/test/support/fixtures';

test('a dialog takes focus, closes with Escape and returns focus to its trigger', async ({
	page,
}): Promise<void> => {
	await page.goto('/gallery');

	const trigger: Locator = page.getByRole('button', { name: 'Rename report' });
	await trigger.click();

	const dialog: Locator = page.getByRole('dialog', { name: 'Rename report' });
	await expect(dialog).toBeVisible();

	await expect
		.poll(async (): Promise<boolean> => {
			return dialog.evaluate((element: Element): boolean => {
				return element.contains(document.activeElement);
			});
		})
		.toBe(true);

	await page.keyboard.press('Escape');

	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('a menu item chosen with the keyboard opens a confirmation, and confirming shows a toast', async ({
	page,
}): Promise<void> => {
	await page.goto('/gallery');

	await page.getByRole('button', { name: 'More actions' }).focus();
	await page.keyboard.press('Enter');

	const menu: Locator = page.getByRole('menu');
	await expect(menu).toBeVisible();

	await menu.getByRole('menuitem', { name: 'Delete' }).focus();
	await page.keyboard.press('Enter');

	const confirmation: Locator = page.getByRole('alertdialog', { name: 'Delete this report?' });
	await expect(confirmation).toBeVisible();

	await confirmation.getByRole('button', { name: 'Delete report' }).click();

	await expect(confirmation).toBeHidden();

	await expect(
		page.getByRole('region', { name: 'Notifications' }).getByText('The report was deleted.'),
	).toBeVisible();
});

test('a toast reports the outcome of an action', async ({ page }): Promise<void> => {
	await page.goto('/gallery');
	await page.getByRole('button', { name: 'Save report' }).click();

	await expect(
		page.getByRole('region', { name: 'Notifications' }).getByText('The report was saved.'),
	).toBeVisible();
});

test('a tooltip appears on keyboard focus', async ({ page }): Promise<void> => {
	await page.goto('/gallery');
	await page.getByRole('button', { name: 'Copy link' }).focus();

	await expect(page.getByRole('tooltip')).toHaveText('Copies the link to the clipboard');
});
