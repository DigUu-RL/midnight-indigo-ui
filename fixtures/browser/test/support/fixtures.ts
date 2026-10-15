// `test` of the browser suite: every test fails if the page logs an error or a warning (a hydration mismatch, a missing
// key, a failed request) or throws, even when its own assertions pass. A test that expects a message on purpose (the
// 404 page, whose document is a failed request) lists it in `expectedConsoleMessages`.
import { expect, test as base } from '@playwright/test';
import type { ConsoleMessage, Page } from '@playwright/test';

interface BrowserFixtures {
	/** Console errors and warnings the test expects, e.g. `[/status of 404/]` with `test.use`. */
	expectedConsoleMessages: RegExp[];
	page: Page;
}

export const test: ReturnType<typeof base.extend<BrowserFixtures>> = base.extend<BrowserFixtures>({
	expectedConsoleMessages: [[], { option: true }],
	page: async (
		{ page, expectedConsoleMessages }: { page: Page; expectedConsoleMessages: RegExp[] },
		use: (page: Page) => Promise<void>,
	): Promise<void> => {
		const problems: string[] = [];

		const isExpected = (text: string): boolean => {
			return expectedConsoleMessages.some((pattern: RegExp): boolean => pattern.test(text));
		};

		page.on('console', (message: ConsoleMessage): void => {
			const isProblem: boolean = message.type() === 'error' || message.type() === 'warning';

			if (isProblem && !isExpected(message.text())) {
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
