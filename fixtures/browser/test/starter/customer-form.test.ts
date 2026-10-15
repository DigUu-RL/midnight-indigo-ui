// The new customer form: native constraints in the browser, the other checks in a Server Action (an address already
// registered is only known to the server), every message in the language of the page, and a toast after saving.
import type { Locator, Page } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

const fillCustomer = async (page: Page, email: string): Promise<void> => {
	await page.getByLabel('Full name').fill('Paula Andrade');
	await page.getByLabel('Email address').fill(email);
	await page.getByLabel('Phone').fill('(11) 91234-5678');
	await page.getByLabel('Region').selectOption('southeast');
};

test('an empty submission lists the required fields', async ({ page }): Promise<void> => {
	await page.goto('/en-us/customers/new');
	await page.getByRole('button', { name: 'Register customer' }).click();

	const summary: Locator = page.getByRole('region', {
		name: 'There are 3 problems with this form',
	});

	await expect(summary).toBeFocused();
	await expect(summary.getByRole('link')).toHaveCount(3);
});

test('the server rejects an address already registered, next to the field', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/customers/new');
	await fillCustomer(page, 'ana.souza@aurora.example');
	await page.getByRole('button', { name: 'Register customer' }).click();

	await expect(page.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
	await expect(page.getByText('This email address is already registered.').first()).toBeVisible();
});

test('a valid customer is saved, confirmed by a toast, and the form is cleared', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/customers/new');
	await fillCustomer(page, 'paula.andrade@aurora.example');
	await page.getByRole('button', { name: 'Register customer' }).click();

	await expect(page.getByRole('status').filter({ hasText: 'Customer registered' })).toContainText(
		/Paula Andrade is customer CLI-\d{6}\./,
	);

	await expect(page.getByLabel('Full name')).toHaveValue('');
});

test('in Portuguese, the messages of the server are in Portuguese', async ({
	page,
}): Promise<void> => {
	await page.goto('/pt-br/customers/new');
	await page.getByLabel('Nome completo').fill('Jo');
	await page.getByLabel('Endereço de e-mail').fill('bruno.lima@aurora.example');
	await page.getByLabel('Região').selectOption('south');
	await page.getByRole('button', { name: 'Cadastrar cliente' }).click();

	await expect(
		page.getByText('Informe o nome completo, com pelo menos 3 letras.').first(),
	).toBeVisible();

	await expect(page.getByText('Este e-mail já está cadastrado.').first()).toBeVisible();
});
