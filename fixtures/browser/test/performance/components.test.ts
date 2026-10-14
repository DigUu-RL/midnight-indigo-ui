// Many components at once in the browser, on the production build: 200 cards of about ten components each.
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

const cardCount: number = 200;

test.beforeEach(async ({ page }): Promise<void> => {
	await recordInteractions(page);
});

test(`${String(cardCount)} cards of components render, respond and update within budget`, async ({
	page,
}): Promise<void> => {
	const renderTime: number = await openScenario(
		page,
		`scenario=components&size=${String(cardCount)}`,
	);

	await expect(page.getByRole('region')).toHaveCount(cardCount);
	const field: Locator = page.getByRole('textbox', { name: 'Owner of Team 100' });

	// Typing in one field renders that field only, however many components the page has.
	const typing: InteractionMeasurement = await measureInteraction(
		page,
		'typing in one field',
		async (): Promise<void> => {
			await field.pressSequentially('Ana');
			await expect(field).toHaveValue('Ana');
		},
	);

	const toggling: InteractionMeasurement = await measureInteraction(
		page,
		'toggling a switch',
		async (): Promise<void> => {
			const toggle: Locator = page.getByRole('switch', { name: 'Alerts of Team 150' });
			await toggle.click();
			await expect(toggle).toBeChecked();
		},
	);

	// Every card renders again with new values: the worst case of an update that reaches the whole page.
	const refreshing: InteractionMeasurement = await measureInteraction(
		page,
		'refreshing every card',
		async (): Promise<void> => {
			await page.getByRole('button', { name: 'Refresh all' }).click();
			await expect(page.getByText('Revision 1')).toHaveCount(cardCount);
		},
	);

	expect(renderTime).toBeLessThan(budget(1500));
	expect(typing.latency).toBeLessThan(budget(goodInteractionLatency));
	expect(toggling.latency).toBeLessThan(budget(goodInteractionLatency));
	// Every prop changes, so every component must render: memoization cannot save this one, only cheaper components.
	expect(refreshing.latency).toBeLessThan(budget(1100));
});
