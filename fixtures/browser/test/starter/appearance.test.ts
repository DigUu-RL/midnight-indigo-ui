// The palette editor: a color changes the preview only, the contrast audit reports the pairs it breaks, an invalid color
// is explained, and the theme can be copied or downloaded as the theme.json of the build.
import type { Download, Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '@/test/support/accessibility';
import { expect, test } from '@/test/support/fixtures';

const preview = (page: Page): Locator => page.locator('.palette-preview');

const themeJson = (page: Page): Locator => {
	return page.getByRole('region', { name: 'theme.json' }).locator('pre code');
};

const customProperty = async (locator: Locator, name: string): Promise<string> => {
	return locator.evaluate((element: Element, property: string): string => {
		return getComputedStyle(element).getPropertyValue(property).trim();
	}, name);
};

test('a main color changes the preview and the exported theme, not the rest of the page', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/settings/appearance');
	await page.getByLabel('Official', { exact: true }).fill('#7C5CFF');

	await expect
		.poll(async (): Promise<string> => customProperty(preview(page), '--mi-intent-official-main'))
		.toBe('#7C5CFF');

	expect(await customProperty(page.locator('body'), '--mi-intent-official-main')).toBe('#FF6AC1');
	await expect(themeJson(page)).toContainText('"main": "#7C5CFF"');

	await page.getByRole('button', { name: 'Restore the colors of the build' }).click();
	await expect(themeJson(page)).toContainText('"main": "#FF6AC1"');
});

test('a color that breaks the contrast is reported, and an invalid one is explained', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/settings/appearance');
	await expect(page.getByText('Every pair passes')).toBeVisible();

	await page.getByLabel('Warning', { exact: true }).fill('#3A2A10');
	await expect(page.getByText(/pairs? below the minimum/)).toBeVisible();
	await expectNoAxeViolations(page);

	await page.getByLabel('Info', { exact: true }).fill('blue');
	await expect(page.getByLabel('Info', { exact: true })).toHaveAttribute('aria-invalid', 'true');
	await expect(page.getByText('Enter a color in the format #RRGGBB or #RGB.')).toBeVisible();
});

test('the theme is copied and downloaded as theme.json', async ({
	page,
	context,
}): Promise<void> => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/en-us/settings/appearance');

	await page.getByRole('button', { name: 'Copy' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'The theme was copied.' })).toBeVisible();

	expect(
		JSON.parse(await page.evaluate(async (): Promise<string> => navigator.clipboard.readText())),
	).toEqual(JSON.parse((await themeJson(page).textContent()) ?? ''));

	const download: Promise<Download> = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download' }).click();

	expect((await download).suggestedFilename()).toBe('theme.json');
});
