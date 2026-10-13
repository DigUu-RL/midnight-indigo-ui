// Many options and many items in the browser, on the production build.
import type { Locator } from '@playwright/test';

import { expect, test } from '#test/support/fixtures.ts';
import {
	budget,
	goodInteractionLatency,
	measureInteraction,
	openScenario,
	recordInteractions,
} from '#test/support/performance.ts';
import type { InteractionMeasurement } from '#test/support/performance.ts';

test.beforeEach(async ({ page }): Promise<void> => {
	await recordInteractions(page);
});

// The list renders at most 100 options (`maxVisibleOptions`), so its cost does not grow with the options.
for (const optionCount of [1_000, 10_000, 100_000]) {
	test(`a combobox with ${String(optionCount)} options opens and filters with a good latency`, async ({
		page,
	}): Promise<void> => {
		const renderTime: number = await openScenario(
			page,
			`scenario=combobox&size=${String(optionCount)}`,
		);

		const input: Locator = page.getByRole('combobox', { name: 'Product' });

		const opening: InteractionMeasurement = await measureInteraction(
			page,
			'open the list',
			async (): Promise<void> => {
				await input.click();
				await input.press('ArrowDown');
				await expect(page.getByRole('listbox')).toBeVisible();
			},
		);

		await expect(page.getByRole('option')).toHaveCount(100);

		const typing: InteractionMeasurement = await measureInteraction(
			page,
			'typing to filter',
			async (): Promise<void> => {
				await input.pressSequentially('product 12');
				await expect(page.getByRole('option').first()).toContainText('Product 12');
			},
		);

		expect(renderTime).toBeLessThan(budget(400));
		expect(opening.latency).toBeLessThan(budget(goodInteractionLatency));
		expect(typing.latency).toBeLessThan(budget(goodInteractionLatency));
	});
}

test('a select with 10 000 options renders within budget', async ({ page }): Promise<void> => {
	const renderTime: number = await openScenario(page, 'scenario=select&size=10000');

	await expect(page.getByRole('combobox', { name: 'Product' }).locator('option')).toHaveCount(
		10_001,
	);

	expect(renderTime).toBeLessThan(budget(1500));
});

test('a list with 1 000 items renders within budget', async ({ page }): Promise<void> => {
	const renderTime: number = await openScenario(page, 'scenario=list&size=1000');

	await expect(page.getByRole('list', { name: 'Invoices' }).getByRole('listitem')).toHaveCount(
		1_000,
	);

	expect(renderTime).toBeLessThan(budget(600));
});
