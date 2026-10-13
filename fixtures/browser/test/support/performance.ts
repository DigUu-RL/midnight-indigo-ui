// Measurements in the browser. Interactions are timed by the Event Timing API, the basis of Interaction to Next Paint
// (INP): from the input to the next frame painted after the handlers ran, so it includes rendering, layout and paint.
// Long tasks (more than 50 ms on the main thread) are what makes a page feel frozen.
import { test } from '@playwright/test';
import type { Page } from '@playwright/test';

export interface InteractionMeasurement {
	/** The longest interaction, in milliseconds; 0 when every one took less than 16 ms (below what is reported). */
	latency: number;
	/** Sum, in milliseconds, of the part of each long task beyond 50 ms: how long the page could not respond. */
	blockingTime: number;
}

/**
 * Multiplier of every budget, for a slower machine: `PERFORMANCE_BUDGET_FACTOR=2 pnpm test:performance`. The budgets
 * themselves are about three times the time measured on a development laptop.
 */
const budgetFactor: number = Number(process.env.PERFORMANCE_BUDGET_FACTOR ?? '1');

/** The budget, in milliseconds, scaled by `PERFORMANCE_BUDGET_FACTOR`. */
export const budget = (milliseconds: number): number => milliseconds * budgetFactor;

/** "Good" Interaction to Next Paint, by the Core Web Vitals thresholds. */
export const goodInteractionLatency: number = 200;

declare global {
	interface Window {
		interactionDurations: number[];
		longTaskDurations: number[];
	}
}

/** Starts recording interactions and long tasks from the first script of every page; call it before `goto`. */
export const recordInteractions = async (page: Page): Promise<void> => {
	await page.addInitScript((): void => {
		window.interactionDurations = [];
		window.longTaskDurations = [];

		new PerformanceObserver((list: PerformanceObserverEntryList): void => {
			for (const entry of list.getEntries() as PerformanceEventTiming[]) {
				if (entry.interactionId > 0) window.interactionDurations.push(entry.duration);
			}
		}).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit);

		new PerformanceObserver((list: PerformanceObserverEntryList): void => {
			for (const entry of list.getEntries()) window.longTaskDurations.push(entry.duration);
		}).observe({ type: 'longtask', buffered: true });
	});
};

const settle = async (page: Page): Promise<void> => {
	// Event Timing reports an interaction after the frame it caused is painted; two frames and a task cover that.
	await page.evaluate(async (): Promise<void> => {
		await new Promise<void>((resolve: () => void): void => {
			requestAnimationFrame((): void => {
				requestAnimationFrame((): void => {
					setTimeout(resolve, 100);
				});
			});
		});
	});
};

/** Runs `interaction` (real input from Playwright) and measures it. Records it in the report as `name`. */
export const measureInteraction = async (
	page: Page,
	name: string,
	interaction: () => Promise<void>,
): Promise<InteractionMeasurement> => {
	await settle(page);

	await page.evaluate((): void => {
		window.interactionDurations = [];
		window.longTaskDurations = [];
	});

	await interaction();
	await settle(page);

	const measurement: InteractionMeasurement = await page.evaluate((): InteractionMeasurement => {
		return {
			latency: Math.max(0, ...window.interactionDurations),
			blockingTime: window.longTaskDurations.reduce((total: number, duration: number): number => {
				return total + Math.max(0, duration - 50);
			}, 0),
		};
	});

	test.info().annotations.push({
		type: 'measurement',
		description: `${name}: ${String(Math.round(measurement.latency))} ms latency, ${String(Math.round(measurement.blockingTime))} ms blocking`,
	});

	return measurement;
};

/** Opens a scenario of the performance app and returns the time from the start of its render to its first paint. */
export const openScenario = async (page: Page, query: string): Promise<number> => {
	await page.goto(`/?${query}`);
	await page.waitForSelector('html[data-scenario-ready="true"]');

	const renderTime: number = await page.evaluate((): number => {
		return performance.getEntriesByName('scenario-render')[0]?.duration ?? Number.NaN;
	});

	test.info().annotations.push({
		type: 'measurement',
		description: `render of ${query}: ${String(Math.round(renderTime))} ms`,
	});

	return renderTime;
};
