// Every page of the application in each language: opened directly and refreshed (hydration without warnings, which the
// fixture turns into failures), reached by a client-side navigation from the sidebar, and audited by axe (contrast
// included). The 404 page too.
import type { Locator, Page, Response as PageResponse } from '@playwright/test';

import { expectNoAxeViolations } from '#test/support/accessibility.ts';
import { expect, test } from '#test/support/fixtures.ts';

interface ApplicationPage {
	path: string;
	/** Name of the page in the navigation and its `h1`, by locale. */
	names: Readonly<Record<'en-us' | 'pt-br', string>>;
}

const applicationPages: readonly ApplicationPage[] = [
	{ path: '', names: { 'en-us': 'Sales overview', 'pt-br': 'Visão geral de vendas' } },
	{ path: '/orders', names: { 'en-us': 'Orders', 'pt-br': 'Pedidos' } },
	{ path: '/reports', names: { 'en-us': 'Reports', 'pt-br': 'Relatórios' } },
	{ path: '/customers/new', names: { 'en-us': 'New customer', 'pt-br': 'Novo cliente' } },
	{ path: '/settings/appearance', names: { 'en-us': 'Appearance', 'pt-br': 'Aparência' } },
];

const locales: readonly ('en-us' | 'pt-br')[] = ['en-us', 'pt-br'];

const navigationNames: Readonly<Record<'en-us' | 'pt-br', string>> = {
	'en-us': 'Main navigation',
	'pt-br': 'Navegação principal',
};

const heading = (page: Page, name: string): Locator => {
	return page.getByRole('heading', { level: 1, name, exact: true });
};

locales.forEach((locale: 'en-us' | 'pt-br'): void => {
	applicationPages.forEach(({ path, names }: ApplicationPage): void => {
		const url: string = `/${locale}${path}`;

		test(`${url} hydrates when opened directly and after a refresh, without accessibility violations`, async ({
			page,
		}): Promise<void> => {
			await page.goto(url);
			await expect(heading(page, names[locale])).toBeVisible();

			const sidebar: Locator = page.getByRole('navigation', { name: navigationNames[locale] });

			await expect(sidebar.getByRole('link', { name: names[locale] })).toHaveAttribute(
				'aria-current',
				'page',
			);

			await page.reload();
			await expect(heading(page, names[locale])).toBeVisible();
			await expectNoAxeViolations(page);
		});
	});
});

test('the sidebar navigates between the pages on the client', async ({ page }): Promise<void> => {
	await page.goto('/en-us');

	await page.evaluate((): void => {
		document.documentElement.dataset.sameDocument = 'true';
	});

	const navigation: Locator = page.getByRole('navigation', { name: 'Main navigation' });

	for (const { path, names } of applicationPages.slice(1)) {
		await navigation.getByRole('link', { name: names['en-us'] }).click();
		await expect(page).toHaveURL(`/en-us${path}`);
		await expect(heading(page, names['en-us'])).toBeVisible();
		await expect(page).toHaveTitle(`${names['en-us']} · Aurora Retail`);
	}

	expect(
		await page.evaluate((): string | undefined => document.documentElement.dataset.sameDocument),
	).toBe('true');

	// The breadcrumbs lead back home.
	await page
		.getByRole('navigation', { name: 'Breadcrumb' })
		.getByRole('link', { name: 'Sales overview' })
		.click();

	await expect(page).toHaveURL('/en-us');
});

test.describe('a missing page', (): void => {
	// The browser reports the 404 status of the document itself.
	test.use({ expectedConsoleMessages: [/status of 404/] });

	test('is translated, keeps the shell and leads back home', async ({ page }): Promise<void> => {
		const response: PageResponse | null = await page.goto('/pt-br/nao/existe');

		expect(response?.status()).toBe(404);
		await expect(heading(page, 'Página não encontrada')).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
		await expectNoAxeViolations(page);

		await page
			.getByRole('main')
			.getByRole('link', { name: 'Ir para a visão geral de vendas' })
			.click();

		await expect(page).toHaveURL('/pt-br');
		await expect(heading(page, 'Visão geral de vendas')).toBeVisible();
	});
});
