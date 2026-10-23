// Charts in the browser, on the production build, with the reference datasets: a line chart of three series with 1 000,
// 10 000 and 100 000 points (plus a stacked bar and a donut on the same page), timed from the start of the React render
// to the frame after the engine has drawn, then the keyboard, legend and zoom interactions.
import type { Locator, Page } from '@playwright/test';

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

/** Opens the chart scenario and returns the time until every chart is drawn. */
const openCharts = async (page: Page, pointCount: number): Promise<number> => {
	await openScenario(page, `scenario=chart&size=${String(pointCount)}`);
	await page.waitForSelector('html[data-chart-ready="true"]');

	const renderTime: number = await page.evaluate((): number => {
		return performance.getEntriesByName('chart-render')[0]?.duration ?? Number.NaN;
	});

	test.info().annotations.push({
		type: 'measurement',
		description: `charts with ${String(pointCount)} points drawn in ${String(Math.round(renderTime))} ms`,
	});

	return renderTime;
};

// Budgets: about three times the time measured on a development laptop (engine download and parse included).
const renderBudgets: readonly [number, number][] = [
	[1_000, 1_500],
	[10_000, 2_000],
	[100_000, 4_000],
];

for (const [pointCount, milliseconds] of renderBudgets) {
	test(`draws a line chart of ${String(pointCount)} points per series within budget`, async ({
		page,
	}): Promise<void> => {
		const renderTime: number = await openCharts(page, pointCount);

		await expect(page.getByRole('group', { name: 'Traffic by channel' })).toBeVisible();
		expect(renderTime).toBeLessThan(budget(milliseconds));
	});
}

test('explores 10 000 points with a good interaction latency', async ({ page }): Promise<void> => {
	await openCharts(page, 10_000);

	const figure: Locator = page.getByRole('figure', { name: 'Traffic by channel' });
	const surface: Locator = figure.getByRole('group', { name: 'Traffic by channel' });
	await surface.focus();

	const nextPoint: InteractionMeasurement = await measureInteraction(
		page,
		'move to the next point',
		async (): Promise<void> => {
			await page.keyboard.press('ArrowRight');
			await expect(figure.getByRole('status')).toHaveText(/^D1: Organic: /);
		},
	);

	const toggleSeries: InteractionMeasurement = await measureInteraction(
		page,
		'hide a series',
		async (): Promise<void> => {
			const paid: Locator = figure.getByRole('button', { name: 'Paid' });
			await paid.click();
			await expect(paid).toHaveAttribute('aria-pressed', 'false');
		},
	);

	const zoomIn: InteractionMeasurement = await measureInteraction(
		page,
		'zoom in',
		async (): Promise<void> => {
			await figure.getByRole('button', { name: 'Zoom in' }).click();
			await expect(figure.getByRole('status')).toHaveText(/^Showing D\d+ to D\d+\.$/);
		},
	);

	expect(nextPoint.latency).toBeLessThan(budget(goodInteractionLatency));
	expect(toggleSeries.latency).toBeLessThan(budget(goodInteractionLatency));
	expect(zoomIn.latency).toBeLessThan(budget(goodInteractionLatency));
});
