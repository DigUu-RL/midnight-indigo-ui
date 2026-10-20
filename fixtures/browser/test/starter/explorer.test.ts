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

// The columns hold functions, which come to the browser from a client module.
test('a data table of the playground filters its rows with its sample columns', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/data-table');
	const playground: Locator = page.locator('.playground');

	const preview: Locator = playground.getByRole('group', {
		name: 'Component with the chosen props',
	});

	await playground.getByRole('textbox', { name: 'filter', exact: true }).fill('Mars');

	await expect(preview.getByRole('rowheader')).toHaveText(['Asimov Solensan', 'Teddy Bomber']);
	await expect(playground.locator('pre')).toContainText("filter='Mars'");
});

// The trigger is an element rendered on the server, which the tooltip of the browser wraps. The focus shows the tooltip
// at once, where the hover waits for its delay.
test('a tooltip of the playground describes its sample trigger with the chosen text', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/tooltip');
	const playground: Locator = page.locator('.playground');

	const trigger: Locator = playground
		.getByRole('group', { name: 'Component with the chosen props' })
		.getByRole('button', { name: 'Add crew member' });

	await playground.getByRole('textbox', { name: /^content/ }).fill('Shortcut: Shift + A');
	await page.keyboard.press('Shift+Tab');

	await expect(trigger).toBeFocused();
	await expect(page.getByRole('tooltip')).toHaveText('Shortcut: Shift + A');
	await expect(trigger).toHaveAccessibleDescription('Shortcut: Shift + A');
	await expect(playground.locator('pre')).toContainText("<Tooltip content='Shortcut: Shift + A'>");
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
