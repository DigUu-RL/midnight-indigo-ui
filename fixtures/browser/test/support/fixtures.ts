// `test` of the browser suite: every test fails if the page logs an error or a warning (a hydration mismatch, a missing
// key, a failed request) or throws, even when its own assertions pass.
import { expect, test as base } from '@playwright/test';
import type { ConsoleMessage, Page } from '@playwright/test';

interface BrowserFixtures {
	page: Page;
}

export const test: ReturnType<typeof base.extend<BrowserFixtures>> = base.extend<BrowserFixtures>({
	page: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>): Promise<void> => {
		const problems: string[] = [];

		page.on('console', (message: ConsoleMessage): void => {
			if (message.type() === 'error' || message.type() === 'warning') {
				problems.push(`console.${message.type()}: ${message.text()}`);
			}
		});

		page.on('pageerror', (error: Error): void => {
			problems.push(`uncaught: ${error.message}`);
		});

		await use(page);

		expect(problems, 'The page logged errors or warnings.').toEqual([]);
	},
});

export { expect };
