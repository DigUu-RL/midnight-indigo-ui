// The languages of the starter in a real browser: `/` opens in the language of the browser, the language links lead to
// the same page in the other language and remember the choice, and the page is translated after hydration too.
import type { Locator, Page } from '@playwright/test';

import { expect, test } from '@/test/support/fixtures';

const languageLinks = (page: Page): Locator => page.getByRole('banner').getByRole('navigation');

test.describe('with a browser in Portuguese', (): void => {
	test.use({ locale: 'pt-BR' });

	test('the home page opens in Portuguese', async ({ page }): Promise<void> => {
		await page.goto('/');

		await expect(page).toHaveURL('/pt-br');
		await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

		await expect(
			page.getByRole('heading', { level: 1, name: 'Visão geral de vendas' }),
		).toBeVisible();

		await expect(page).toHaveTitle('Visão geral de vendas · Aurora Varejo');
	});
});

test('the language link leads to the same page in the other language and is remembered', async ({
	page,
}): Promise<void> => {
	await page.goto('/en-us/orders');
	const portuguese: Locator = languageLinks(page).getByRole('link', { name: 'Português' });

	await expect(
		page.getByRole('banner').getByRole('navigation', { name: 'Language' }),
	).toBeVisible();

	await expect(portuguese).toHaveAttribute('lang', 'pt-BR');
	await expect(portuguese).toHaveAttribute('hreflang', 'pt-BR');
	await portuguese.click();

	await expect(page).toHaveURL('/pt-br/orders');
	await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
	await expect(page.getByRole('heading', { level: 1, name: 'Pedidos' })).toBeVisible();
	await expect(page.getByRole('columnheader', { name: 'Situação' })).toBeVisible();

	await page.reload();
	await expect(page.getByRole('heading', { level: 1, name: 'Pedidos' })).toBeVisible();

	// The browser is in English, but the choice wins.
	await page.goto('/');
	await expect(page).toHaveURL('/pt-br');
	await languageLinks(page).getByRole('link', { name: 'English' }).click();

	await expect(page).toHaveURL('/en-us');
	await page.goto('/reports');
	await expect(page).toHaveURL('/en-us/reports');
});

test('the texts of the components follow the language of the page', async ({
	page,
}): Promise<void> => {
	await page.goto('/pt-br');

	await expect(page.getByRole('link', { name: 'Pular para o conteúdo principal' })).toBeAttached();
	await expect(page.getByRole('button', { name: 'Recolher navegação' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();

	await expect(page.getByRole('group', { name: 'Receita', exact: true })).not.toHaveAttribute(
		'aria-busy',
	);

	// Amounts in reais in both languages: the currency belongs to the business, not to the language.
	await expect(page.getByRole('group', { name: 'Receita', exact: true })).toContainText('R$');
});
