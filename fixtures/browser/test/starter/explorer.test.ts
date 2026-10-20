// The playground of the component explorer: each control changes the component and its code at once, an overlay opens
// from its trigger or its button and closes as it asks, and a required text left blank keeps its initial value instead
// of breaking the page.
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

// A modal overlay is opened by the button of the playground, and closes when it asks to: Escape here.
test('a dialog of the playground opens from its button with the chosen props and closes on Escape', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/dialog');
	const playground: Locator = page.locator('.playground');
	const opener: Locator = playground.getByRole('button', { name: 'Open the flight plan' });

	await playground.getByRole('textbox', { name: /^title/ }).fill('Jump to Kessel');
	await playground.getByLabel('size', { exact: true }).selectOption('large');
	await opener.click();

	const dialog: Locator = page.getByRole('dialog', { name: 'Jump to Kessel' });

	await expect(dialog).toBeVisible();

	await expect(dialog).toHaveAccessibleDescription(
		'Check the route before the jump to hyperspace.',
	);

	await page.keyboard.press('Escape');

	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();
	await expect(playground.locator('pre')).toContainText("title='Jump to Kessel'");
	await expect(playground.locator('pre')).toContainText("size='large'");
});

test('a confirmation dialog of the playground closes from both of its buttons', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/confirm-dialog');

	const opener: Locator = page
		.locator('.playground')
		.getByRole('button', { name: 'Release the bounty' });

	const dialog: Locator = page.getByRole('alertdialog', { name: 'Release the bounty?' });

	await opener.click();
	await dialog.getByRole('button', { name: 'Confirm' }).click();
	await expect(dialog).toBeHidden();

	await opener.click();
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();
});

// The items are plain data rendered on the server; the menu of the browser runs them.
test('a menu of the playground opens from its sample trigger with its sample items', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/menu');

	const trigger: Locator = page
		.locator('.playground')
		.getByRole('button', { name: 'Crew actions' });

	await trigger.click();
	const menu: Locator = page.getByRole('menu', { name: 'Crew actions' });

	await expect(menu.getByRole('menuitem')).toHaveText([
		'Send a message',
		/^Assign a bounty/,
		'Remove from the crew',
	]);

	await menu.getByRole('menuitem', { name: 'Send a message' }).click();
	await expect(menu).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('a context menu of the playground opens from the keyboard with the chosen label', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/context-menu');
	const playground: Locator = page.locator('.playground');

	await playground.getByRole('textbox', { name: /^label/ }).fill('Actions for Jet Black');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+F10');

	await expect(page.getByRole('menu', { name: 'Actions for Jet Black' })).toBeVisible();
	await expect(playground.locator('pre')).toContainText("label='Actions for Jet Black'");
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
