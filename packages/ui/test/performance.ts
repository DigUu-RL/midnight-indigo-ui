// Helpers of the performance suite (`*.performance.test.ts(x)`, run by `pnpm test:performance`).
import { performance } from 'node:perf_hooks';

/**
 * Multiplier between the time measured on a development laptop and the budget a test asserts: a shared CI runner is
 * slower and noisier, and a budget should fail on a regression in the order of magnitude, not on noise. Raise it for a
 * slow machine with `PERFORMANCE_BUDGET_FACTOR=2 pnpm test:performance`.
 */
export const budgetFactor: number = Number(process.env.PERFORMANCE_BUDGET_FACTOR ?? '1');

/** The budget, in milliseconds, scaled by `budgetFactor`. */
export const budget = (milliseconds: number): number => milliseconds * budgetFactor;

/**
 * Duration, in milliseconds, of the fastest of `runs` executions of `task`. Noise (garbage collection, other processes,
 * a cold cache) only ever adds time, so the fastest run is the most stable estimate; the first run also warms up the
 * just-in-time compiler for the next ones.
 */
export const fastestRun = (task: () => void, runs: number = 3): number => {
	return Math.min(
		...Array.from({ length: runs }, (): number => {
			const start: number = performance.now();
			task();
			return performance.now() - start;
		}),
	);
};

/** Like `fastestRun`, for a task that awaits (a user interaction, a render that settles). */
export const fastestAsyncRun = async (
	task: () => Promise<void>,
	runs: number = 3,
): Promise<number> => {
	const durations: number[] = [];

	for (let run: number = 0; run < runs; run += 1) {
		const start: number = performance.now();
		await task();
		durations.push(performance.now() - start);
	}

	return Math.min(...durations);
};
