// axe-core in a real browser. Unlike the jsdom audit of the unit tests, the page is laid out and painted here, so color
// contrast is checked too.
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import axe from 'axe-core';
import type { AxeResults, Result, RunOptions } from 'axe-core';

const describeViolation = (violation: Result): string => {
	const targets: string = violation.nodes
		.map((node: Result['nodes'][number]): string => node.target.join(' '))
		.join(', ');

	return `${violation.id}: ${violation.help} (${targets})`;
};

/** Runs axe-core on the page, or inside `selector`, and expects no violation at the WCAG 2.2 A and AA levels. */
export const expectNoAxeViolations = async (page: Page, selector?: string): Promise<void> => {
	await page.addScriptTag({ content: axe.source });

	const options: RunOptions = {
		runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
	};

	const results: AxeResults = await page.evaluate(
		async ([context, runOptions]: [string | undefined, RunOptions]): Promise<AxeResults> => {
			return window.axe.run(context ?? document, runOptions);
		},
		[selector, options] as [string | undefined, RunOptions],
	);

	expect(results.violations.map(describeViolation)).toEqual([]);
};

declare global {
	interface Window {
		axe: typeof axe;
	}
}
