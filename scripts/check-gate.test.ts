import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkPhases, runCheckGate } from '#scripts/check-gate.ts';
import type { CheckChain, CheckPhase, StepResult } from '#scripts/check-gate.ts';

interface FakeRun {
	events: string[];
	runStep: (script: string) => Promise<StepResult>;
}

/** Steps that log when they start and end, wait a turn of the event loop, and fail when named in `failing`. */
const fakeRun = (failing: readonly string[] = []): FakeRun => {
	const events: string[] = [];

	const runStep = async (script: string): Promise<StepResult> => {
		events.push(`start ${script}`);

		await new Promise<void>((resolve: () => void): void => {
			setImmediate(resolve);
		});

		events.push(`end ${script}`);
		return { script, succeeded: !failing.includes(script), output: '', milliseconds: 0 };
	};

	return { events, runStep };
};

const scriptsOf = (results: readonly StepResult[]): string[] => {
	return results.map((result: StepResult): string => result.script);
};

test('the chains of a phase run side by side, and the next phase waits for all of them', async (): Promise<void> => {
	const { events, runStep }: FakeRun = fakeRun();
	const reported: string[] = [];

	await runCheckGate(
		[[['build']], [['lint'], ['typecheck', 'format']], [['performance']]],
		runStep,
		(result: StepResult): void => {
			reported.push(result.script);
		},
	);

	assert.deepEqual(reported, ['build', 'lint', 'typecheck', 'format', 'performance']);

	assert.deepEqual(events, [
		'start build',
		'end build',
		'start lint',
		'start typecheck',
		'end lint',
		'end typecheck',
		'start format',
		'end format',
		'start performance',
		'end performance',
	]);
});

test('a failure stops its chain, lets the other chains end, and skips the next phases', async (): Promise<void> => {
	const { runStep }: FakeRun = fakeRun(['typecheck']);

	const results: StepResult[] = await runCheckGate(
		[
			[
				['lint', 'format'],
				['typecheck', 'test'],
			],
			[['performance']],
		],
		runStep,
		(): void => undefined,
	);

	assert.deepEqual(scriptsOf(results), ['lint', 'format', 'typecheck']);

	assert.equal(
		results.find((result: StepResult): boolean => !result.succeeded)?.script,
		'typecheck',
	);
});

test('the gate runs every root script of the CI job once, the build first and the performance budgets alone at the end', (): void => {
	const scripts: string[] = checkPhases.flatMap((phase: CheckPhase): string[] => {
		return phase.flatMap((chain: CheckChain): string[] => [...chain]);
	});

	assert.deepEqual(
		[...scripts].sort(),
		[
			'build',
			'check:bundle',
			'check:licenses',
			'check:package',
			'check:source',
			'format:check',
			'lint',
			'test',
			'test:performance',
			'typecheck',
		].sort(),
	);

	assert.deepEqual(checkPhases[0], [['build']]);
	assert.deepEqual(checkPhases.at(-1), [['test:performance']]);
});
