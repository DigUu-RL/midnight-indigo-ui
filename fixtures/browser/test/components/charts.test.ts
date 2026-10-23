// Charts drawn by the real engine in Chromium: the keyboard and touch interactions, resizing and the accessibility audit
// with contrast, which jsdom cannot do (it has no canvas and does not lay out).
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '@/test/support/accessibility';
import { expect, test } from '@/test/support/fixtures';

const openCharts = async (page: Page, pointCount: number = 60): Promise<Locator> => {
	await page.goto(`/?scenario=chart&size=${String(pointCount)}`);
	await page.waitForSelector('html[data-chart-ready="true"]');

	return page.getByRole('figure', { name: 'Traffic by channel' });
};

/** The tooltip of the engine: the element with text that it adds over the drawing, whose canvas has none. */
const tooltipOf = (figure: Locator): Locator => {
	return figure
		.locator('[_echarts_instance_] div')
		.filter({ hasText: /^D\d+/, visible: true })
		.last();
};

test('the charts have no accessibility violation, contrast included', async ({
	page,
}): Promise<void> => {
	const figure: Locator = await openCharts(page);
	await figure.getByRole('button', { name: 'Show data table' }).click();

	await expectNoAxeViolations(page);
});

test('the keyboard moves between points and shows their tooltip', async ({
	page,
}): Promise<void> => {
	const figure: Locator = await openCharts(page);
	const surface: Locator = figure.getByRole('group', { name: 'Traffic by channel' });

	await surface.focus();
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');

	await expect(figure.getByRole('status')).toHaveText(
		/^D2: Organic: [\d,]+, Paid: [\d,]+, Referral: [\d,]+ \(2 of 60\)$/,
	);

	await expect(tooltipOf(figure)).toContainText('D2');

	await page.keyboard.press('Escape');
	await expect(tooltipOf(figure)).toHaveCount(0);
});

// Unzoomed, thousands of days share each pixel, so the tooltip shows the day drawn there; the announcement is exact.
test('the keyboard announces each of 10 000 points', async ({ page }): Promise<void> => {
	const figure: Locator = await openCharts(page, 10_000);

	await figure.getByRole('group', { name: 'Traffic by channel' }).focus();
	await page.keyboard.press('End');
	await page.keyboard.press('ArrowLeft');

	await expect(figure.getByRole('status')).toHaveText(
		/^D9999: Organic: [\d,]+, .* \(9,999 of 10,000\)$/,
	);

	await expect(tooltipOf(figure)).toContainText(/^D\d+/);
});

test('the keyboard and the buttons zoom the axis', async ({ page }): Promise<void> => {
	const figure: Locator = await openCharts(page);
	const surface: Locator = figure.getByRole('group', { name: 'Traffic by channel' });

	await figure.getByRole('button', { name: 'Zoom in' }).click();
	await expect(figure.getByRole('status')).toHaveText('Showing D15 to D44.');

	await surface.focus();
	await page.keyboard.press('+');
	await expect(figure.getByRole('status')).toHaveText('Showing D22 to D36.');

	await page.keyboard.press('End');
	await expect(figure.getByRole('status')).toHaveText(/^D60: /);

	await figure.getByRole('button', { name: 'Show all' }).click();
	await expect(figure.getByRole('status')).toHaveText('Showing D1 to D60.');
});

test.describe('on a touch screen', (): void => {
	test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

	test('a tap shows the tooltip, and the legend buttons toggle the series', async ({
		page,
	}): Promise<void> => {
		const figure: Locator = await openCharts(page);
		const canvas: Locator = figure.locator('canvas').first();

		const box: { x: number; y: number; width: number; height: number } | null =
			await canvas.boundingBox();

		await canvas.tap({ position: { x: (box?.width ?? 0) / 2, y: (box?.height ?? 0) / 2 } });
		await expect(tooltipOf(figure)).toContainText(/D\d+/);

		const referral: Locator = figure.getByRole('button', { name: 'Referral' });
		await referral.tap();

		await expect(referral).toHaveAttribute('aria-pressed', 'false');
	});
});

test('the drawing follows the size of its container without being recreated', async ({
	page,
}): Promise<void> => {
	const figure: Locator = await openCharts(page);
	const canvas: Locator = figure.locator('canvas').first();

	await canvas.evaluate((element: Element): void => {
		element.setAttribute('data-original', 'true');
	});

	const wide: number = (await canvas.boundingBox())?.width ?? 0;
	await page.setViewportSize({ width: 600, height: 800 });

	await expect
		.poll(async (): Promise<number> => (await canvas.boundingBox())?.width ?? 0)
		.toBeLessThan(wide);

	await expect(canvas).toHaveAttribute('data-original', 'true');
});
