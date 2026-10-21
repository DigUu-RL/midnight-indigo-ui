// The component explorer: its navigation leads from the page of a component to one of another subpath, served by
// another route, at the public path. In the playground, each control changes the component and its code at once, an
// overlay opens from its trigger or its button and closes as it asks, a toast is shown through its hook, a field keeps
// what the reader typed while its props change, and a required text left blank keeps its initial value instead of
// breaking the page.
import type { Locator } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

test('the navigation leads to a component of another subpath at its public path', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/chip');
	const navigation: Locator = page.getByRole('navigation', { name: 'Components' });

	await navigation.getByRole('link', { name: 'Dialog', exact: true }).click();

	await expect(page).toHaveURL('/en-us/components/dialog');
	await expect(page.getByRole('heading', { level: 1, name: 'Dialog' })).toBeVisible();

	await expect(navigation.getByRole('link', { name: 'Dialog', exact: true })).toHaveAttribute(
		'aria-current',
		'page',
	);

	await page.getByRole('link', { name: 'Português', exact: true }).click();
	await expect(page).toHaveURL('/pt-br/components/dialog');
});

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

// The playground and the examples call `useToast`: the provider of the layout shows the toasts, as in an application.
test('a toast of the playground is shown with the chosen options by the provider of the layout', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/toast-provider');
	const playground: Locator = page.locator('.playground');

	await playground.getByRole('textbox', { name: /^title/ }).fill('Bounty lost');
	await playground.getByLabel('intent', { exact: true }).selectOption('error');
	await playground.getByRole('button', { name: 'Show the toast' }).click();

	const toast: Locator = page
		.getByRole('region', { name: /^Notifications/ })
		.locator('[data-toast]');

	await expect(toast).toHaveCount(1);
	await expect(toast).toContainText('Bounty lost');
	await expect(toast).toContainText('Spike Spiegel delivered Asimov Solensan to the ISSP.');
	await expect(playground.locator('pre')).toContainText("intent: 'error'");
	await expect(playground.locator('pre')).toContainText("title: 'Bounty lost'");
});

test('the action of a toast undoes what the example did', async ({ page }): Promise<void> => {
	await page.goto('/en-us/components/toast-provider');
	const crew: Locator = page.getByRole('group', { name: 'Crew of the Bebop' });

	await crew.getByRole('button', { name: 'Remove Jet Black from the crew' }).click();
	await expect(crew).not.toContainText('Jet Black');

	await page
		.getByRole('region', { name: /^Notifications/ })
		.getByRole('button', { name: 'Undo' })
		.click();

	await expect(crew).toContainText('Jet Black');
});

// The playground renders the same field again with the new props, so what the reader typed in it stays.
test('a field of the playground keeps the text typed in it while its props change', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/components/text-field');
	const playground: Locator = page.locator('.playground');

	const field: Locator = playground
		.getByRole('group', { name: 'Component with the chosen props' })
		.getByRole('textbox', { name: /^Callsign/ });

	await field.fill('Red Tail');
	await playground.getByRole('textbox', { name: /^error/ }).fill('That callsign is taken.');

	await expect(field).toHaveValue('Red Tail');
	await expect(field).toHaveAttribute('aria-invalid', 'true');
	await expect(field).toHaveAccessibleDescription(/That callsign is taken\./);
	await expect(playground.locator('pre')).toContainText("error='That callsign is taken.'");
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
