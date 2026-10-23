// The production build of the starter hydrates in a real browser: no mismatch, no error, and the server markup becomes
// interactive without being replaced.
import type { JSHandle } from '@playwright/test';

import { expect, test } from '@/test/support/fixtures';

test('hydrates without errors and the server markup becomes interactive', async ({
	page,
}): Promise<void> => {
	await page.goto('/gallery');

	// The node rendered by the server must be the one that becomes interactive: hydration adopts it, never recreates it.
	const serverHeading: JSHandle = await page.evaluateHandle((): Element | null => {
		return document.querySelector('h1');
	});

	await page.getByRole('tab', { name: 'Details' }).click();

	await expect(page.getByRole('tabpanel', { name: 'Details' })).toHaveText(
		'Three new teams joined.',
	);

	expect(
		await page.evaluate((heading: Element | null): boolean => {
			return heading !== null && heading.isConnected && heading === document.querySelector('h1');
		}, serverHeading),
	).toBe(true);
});

test('the streamed panel arrives styled after the shell', async ({ page }): Promise<void> => {
	await page.goto('/gallery');
	await expect(page.getByText('Streamed panel, styled')).toBeVisible();
});
