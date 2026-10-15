// Visual regression of the component gallery of the starter: every section (tokens, typography, components, forms, overlays, navigation, data
// display) compared with its committed baseline, plus states only visible after an interaction. One screenshot per
// section, so that a difference points at the component that changed. Update the baselines on purpose only:
// `pnpm --filter @midnight-indigo/browser-tests test:visual:update` (see the wiki, "Testes e integração contínua").
import type { Locator, Page } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';

const slug = (text: string): string => {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/\p{Diacritic}/gu, '')
		.replaceAll(/[^a-z\d]+/g, '-')
		.replaceAll(/^-|-$/g, '');
};

// Fonts and the streamed panel arrive after the first paint; a screenshot taken before them would be flaky.
const openGallery = async (page: Page): Promise<void> => {
	await page.goto('/gallery');
	await expect(page.getByText('Streamed panel, styled')).toBeVisible();

	await page.evaluate(async (): Promise<void> => {
		await document.fonts.ready;
	});
};

test('every section of the gallery matches its baseline', async ({ page }): Promise<void> => {
	await openGallery(page);

	const sections: Locator[] = await page.locator('main > *').all();
	expect(sections.length).toBeGreaterThan(5);

	for (const [index, section] of sections.entries()) {
		const heading: string = await section.evaluate((element: Element): string => {
			return (
				(element.matches('h1, h2, h3') ? element : element.querySelector('h1, h2, h3'))
					?.textContent ?? ''
			);
		});

		const name: string = `${String(index + 1).padStart(2, '0')}-${slug(heading) || 'section'}.png`;

		await expect.soft(section).toHaveScreenshot(name);
	}
});

test('an open dialog matches its baseline', async ({ page }): Promise<void> => {
	await openGallery(page);
	await page.getByRole('button', { name: 'Rename report' }).click();
	await expect(page.getByRole('dialog', { name: 'Rename report' })).toBeVisible();

	await expect(page).toHaveScreenshot('dialog-open.png');
});

test('an open menu matches its baseline', async ({ page }): Promise<void> => {
	await openGallery(page);
	await page.getByRole('button', { name: 'More actions' }).click();
	await expect(page.getByRole('menu')).toBeVisible();

	await expect(page).toHaveScreenshot('menu-open.png');
});

test('form errors match their baseline', async ({ page }): Promise<void> => {
	await openGallery(page);

	const form: Locator = page.locator('form').filter({ has: page.getByLabel('Full name') });
	await form.getByRole('button', { name: 'Save profile' }).click();
	await expect(form.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');

	await expect(form).toHaveScreenshot('form-errors.png');
});

test('a focused control shows the focus ring', async ({ page }): Promise<void> => {
	await openGallery(page);

	// Focus from the keyboard (back and forth): the ring follows `:focus-visible`, which a pointer focus does not set.
	// The first "New report" is the button of the components section; the sidebar has an item with the same name.
	const button: Locator = page.getByRole('button', { name: 'New report' }).first();
	await button.focus();
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Tab');
	await expect(button).toBeFocused();

	await expect(button.locator('xpath=..')).toHaveScreenshot('focus-ring.png');
});

test.describe('on a phone', (): void => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('the page and the navigation drawer match their baselines', async ({
		page,
	}): Promise<void> => {
		await openGallery(page);
		await expect(page).toHaveScreenshot('phone-top.png');

		await page.getByRole('button', { name: 'Open navigation' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await expect(page).toHaveScreenshot('phone-navigation-open.png');
	});
});
