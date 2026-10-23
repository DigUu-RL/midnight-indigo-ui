// The data table in the browser, on the production build: rendering and interactions with large datasets.
import type { Locator } from '@playwright/test';

import { expect, test } from '@/test/support/fixtures';
import {
	budget,
	goodInteractionLatency,
	measureInteraction,
	openScenario,
	recordInteractions,
} from '@/test/support/performance';
import type { InteractionMeasurement } from '@/test/support/performance';

test.beforeEach(async ({ page }): Promise<void> => {
	await recordInteractions(page);
});

const countElements = async (table: Locator): Promise<number> => {
	return table.evaluate((element: Element): number => element.querySelectorAll('*').length);
};

test.describe('10 000 rows on the client', (): void => {
	test('renders the first page within budget', async ({ page }): Promise<void> => {
		const renderTime: number = await openScenario(page, 'scenario=data-table&size=10000');

		await expect(page.getByRole('table', { name: 'Invoices' }).getByRole('row')).toHaveCount(26);
		expect(renderTime).toBeLessThan(budget(500));
	});

	test('sorts, pages and filters with a good interaction latency', async ({
		page,
	}): Promise<void> => {
		await openScenario(page, 'scenario=data-table&size=10000');
		const table: Locator = page.getByRole('table', { name: 'Invoices' });

		const sortByText: InteractionMeasurement = await measureInteraction(
			page,
			'sort by text',
			async (): Promise<void> => {
				await table.getByRole('button', { name: 'Customer' }).click();

				await expect(table.getByRole('columnheader', { name: 'Customer' })).toHaveAttribute(
					'aria-sort',
					'ascending',
				);
			},
		);

		const sortByNumber: InteractionMeasurement = await measureInteraction(
			page,
			'sort by number',
			async (): Promise<void> => {
				await table.getByRole('button', { name: 'Total' }).click();

				await expect(table.getByRole('columnheader', { name: 'Total' })).toHaveAttribute(
					'aria-sort',
					'ascending',
				);
			},
		);

		const nextPage: InteractionMeasurement = await measureInteraction(
			page,
			'next page',
			async (): Promise<void> => {
				await page.getByRole('button', { name: 'Next page' }).click();

				await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
					'aria-current',
					'true',
				);
			},
		);

		const typing: InteractionMeasurement = await measureInteraction(
			page,
			'typing a filter',
			async (): Promise<void> => {
				await page
					.getByRole('searchbox', { name: 'Filter invoices' })
					.pressSequentially('recife 12');

				await expect(page.getByRole('status').filter({ hasText: /rows?$/ })).toHaveText(
					/^\d+ rows?$/,
				);
			},
		);

		expect(sortByText.latency).toBeLessThan(budget(goodInteractionLatency));
		expect(sortByNumber.latency).toBeLessThan(budget(goodInteractionLatency));
		expect(nextPage.latency).toBeLessThan(budget(100));
		expect(typing.latency).toBeLessThan(budget(goodInteractionLatency));
	});

	test('keeps the DOM the size of a page', async ({ page }): Promise<void> => {
		await openScenario(page, 'scenario=data-table&size=100');
		const smallCount: number = await countElements(page.getByRole('table', { name: 'Invoices' }));

		await openScenario(page, 'scenario=data-table&size=10000');
		const largeCount: number = await countElements(page.getByRole('table', { name: 'Invoices' }));

		expect(largeCount).toBe(smallCount);
	});
});

test.describe('10 000 000 rows paged by a server', (): void => {
	test('renders and moves between pages like a small table', async ({ page }): Promise<void> => {
		const renderTime: number = await openScenario(
			page,
			'scenario=data-table&processing=server&size=10000000',
		);

		const lastPage: InteractionMeasurement = await measureInteraction(
			page,
			'jump to the last page',
			async (): Promise<void> => {
				await page.getByRole('button', { name: 'Page 400000' }).click();

				await expect(page.getByRole('button', { name: 'Page 400000' })).toHaveAttribute(
					'aria-current',
					'true',
				);
			},
		);

		await expect(page.getByRole('rowheader', { name: 'INV-10000000' })).toBeVisible();
		expect(renderTime).toBeLessThan(budget(300));
		expect(lastPage.latency).toBeLessThan(budget(100));
	});
});
