// The playground of the component explorer: each control changes the component and its code at once, and a required
// text left blank keeps its initial value instead of breaking the page.
import type { Locator } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

test('a control changes the component and its code', async ({ page }): Promise<void> => {
	await page.goto('/en-us/components/avatar');
	const playground: Locator = page.locator('.playground');

	const preview: Locator = playground.getByRole('group', {
		name: 'Component with the chosen props',
	});

	await playground.getByLabel('size', { exact: true }).selectOption('large');
	await playground.getByRole('textbox', { name: /^name/ }).fill('Faye Valentine');

	await expect(preview.getByRole('img', { name: 'Faye Valentine' })).toHaveText('FV');

	await expect(playground.locator('pre')).toContainText(
		"<Avatar name='Faye Valentine' size='large' />",
	);
});

test('a required text left blank keeps its initial value', async ({ page }): Promise<void> => {
	await page.goto('/en-us/components/avatar');
	const playground: Locator = page.locator('.playground');
	const name: Locator = playground.getByRole('textbox', { name: /^name/ });

	await name.fill('');

	await expect(name).toHaveAccessibleDescription(
		/Required: the preview and the code keep the initial value\./,
	);

	await expect(
		playground
			.getByRole('group', { name: 'Component with the chosen props' })
			.getByRole('img', { name: 'Spike Spiegel' }),
	).toBeVisible();

	await expect(playground.locator('pre')).toContainText("<Avatar name='Spike Spiegel' />");
});
