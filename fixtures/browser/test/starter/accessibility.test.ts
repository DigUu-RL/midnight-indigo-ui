// axe-core on the rendered starter, contrast included, at rest and with overlays open.
import type { Page } from '@playwright/test';

import { expectNoAxeViolations } from '#test/support/accessibility.ts';
import { expect, test } from '#test/support/fixtures.ts';

test('the page has no accessibility violation', async ({ page }): Promise<void> => {
	await page.goto('/gallery');
	await expectNoAxeViolations(page);
});

test('an open dialog has no accessibility violation', async ({ page }): Promise<void> => {
	await page.goto('/gallery');
	await page.getByRole('button', { name: 'Rename report' }).click();
	await expect(page.getByRole('dialog', { name: 'Rename report' })).toBeVisible();

	await expectNoAxeViolations(page);
});

test('an open menu has no accessibility violation', async ({ page }): Promise<void> => {
	await page.goto('/gallery');
	await page.getByRole('button', { name: 'More actions' }).click();
	await expect(page.getByRole('menu')).toBeVisible();

	await expectNoAxeViolations(page);
});

const explorerPages: readonly string[] = [
	'/en-us/components',
	'/en-us/components/chip',
	'/pt-br/components/button',
	'/en-us/components/icon-button',
	'/pt-br/components/copy-button',
	'/en-us/components/container',
	'/en-us/components/stack',
	'/en-us/components/grid',
	'/en-us/components/avatar',
	'/pt-br/components/badge',
	'/en-us/components/card',
	'/en-us/components/carousel',
	'/pt-br/components/divider',
	'/en-us/components/list',
	'/en-us/components/stat-card',
	'/en-us/components/skeleton',
	'/pt-br/components/skeleton-text',
	'/en-us/components/skeleton-list',
	'/en-us/components/empty-state',
	'/pt-br/components/error-state',
	'/en-us/components/table',
	'/en-us/components/data-table',
	'/en-us/components/code',
	'/pt-br/components/code-block',
	'/en-us/components/alert',
	'/en-us/components/progress-bar',
	'/pt-br/components/tooltip',
	'/en-us/components/popover',
	'/pt-br/components/menu',
	'/en-us/components/context-menu',
	'/en-us/components/dialog',
	'/pt-br/components/confirm-dialog',
	'/en-us/components/drawer',
	'/pt-br/components/toast-provider',
	'/en-us/components/text-field',
	'/pt-br/components/text-area',
	'/en-us/components/password-field',
	'/en-us/components/search-field',
	'/pt-br/components/number-field',
	'/en-us/components/checkbox',
	'/pt-br/components/checkbox-group',
	'/en-us/components/radio-group',
	'/pt-br/components/switch',
	'/en-us/components/select',
	'/en-us/components/combobox',
	'/pt-br/components/slider',
	'/en-us/components/form',
	'/pt-br/components/form-field',
	'/en-us/components/fieldset',
	'/en-us/components/form-actions',
	'/pt-br/components/submit-button',
	'/en-us/components/error-summary',
	'/pt-br/components/file-upload',
	'/en-us/components/date-picker',
	'/pt-br/components/time-picker',
	'/en-us/components/date-time-picker',
	'/pt-br/components/date-pickers-provider',
];

// A table wider than its column (the props of a component) becomes a focusable region once it is hydrated and measured;
// before that, axe sees a scrollable region without keyboard access.
const waitForMeasuredTables = async (page: Page): Promise<void> => {
	await expect
		.poll(async (): Promise<boolean> => {
			return page.evaluate((): boolean => {
				return [...document.querySelectorAll('table')].every((table: HTMLTableElement): boolean => {
					const container: HTMLElement | null = table.parentElement;

					return (
						container === null ||
						container.scrollWidth <= container.clientWidth ||
						container.hasAttribute('tabindex')
					);
				});
			});
		})
		.toBe(true);
};

for (const path of explorerPages) {
	test(`the explorer page ${path} has no accessibility violation`, async ({
		page,
	}): Promise<void> => {
		await page.goto(path);
		await waitForMeasuredTables(page);
		await expectNoAxeViolations(page);
	});
}

test('the code of an example in the explorer has no accessibility violation', async ({
	page,
}): Promise<void> => {
	await page.goto('/pt-br/components/button');
	await waitForMeasuredTables(page);
	await page.getByRole('tab', { name: 'Código' }).first().click();
	await expectNoAxeViolations(page);
});

test.describe('on a phone', (): void => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('the page and the navigation drawer have no accessibility violation', async ({
		page,
	}): Promise<void> => {
		await page.goto('/gallery');
		await expectNoAxeViolations(page);

		await page.getByRole('button', { name: 'Open navigation' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await expectNoAxeViolations(page);
	});
});
