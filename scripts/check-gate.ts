// The plan of `pnpm check` and how it runs: phases one after the other, and in each phase chains of root scripts side by
// side, each chain stopping at its first failure. Kept apart from `check.ts`, which spawns the scripts, so a test runs
// the plan with fake steps.

/** Root scripts that run one after the other. */
export type CheckChain = readonly string[];

/** Chains that run side by side; the next phase starts once every chain has ended. */
export type CheckPhase = readonly CheckChain[];

export interface StepResult {
	script: string;
	succeeded: boolean;
	output: string;
	milliseconds: number;
}

export type StepRunner = (script: string) => Promise<StepResult>;

/**
 * Everything reads the build first. Then the steps that only read run side by side: the lint alone (it builds its own
 * TypeScript programs), the static checks in one chain, and the tests in another, with the package check after them, so
 * `attw --pack` and the consumer fixture never pack the library at once. The performance budgets run last and alone, so
 * no other step shares the processor with a measurement.
 */
export const checkPhases: readonly CheckPhase[] = [
	[['build']],
	[
		['lint'],
		['typecheck', 'format:check', 'check:source', 'check:licenses', 'check:bundle'],
		['test', 'check:package'],
	],
	[['test:performance']],
];

const runChain = async (
	chain: CheckChain,
	runStep: StepRunner,
	onResult: (result: StepResult) => void,
): Promise<StepResult[]> => {
	const results: StepResult[] = [];

	for (const script of chain) {
		const result: StepResult = await runStep(script);
		onResult(result);
		results.push(result);
		if (!result.succeeded) return results;
	}

	return results;
};

/**
 * Runs the phases and returns the result of every step that ran, each one also given to `onResult` as soon as it ends; a
 * phase with a failure ends the run.
 */
export const runCheckGate = async (
	phases: readonly CheckPhase[],
	runStep: StepRunner,
	onResult: (result: StepResult) => void,
): Promise<StepResult[]> => {
	const results: StepResult[] = [];

	for (const phase of phases) {
		const chainResults: StepResult[][] = await Promise.all(
			phase.map((chain: CheckChain): Promise<StepResult[]> => runChain(chain, runStep, onResult)),
		);

		results.push(...chainResults.flat());
		if (results.some((result: StepResult): boolean => !result.succeeded)) return results;
	}

	return results;
};
