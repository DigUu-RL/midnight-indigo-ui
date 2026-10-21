// `pnpm check`: the full gate of the CI job `check`, run as `check-gate.ts` plans it. Each step is a root script, whose
// output is shown only when it fails, so the logs of the steps that run side by side do not mix; a line per step says
// how long it took.
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { checkPhases, runCheckGate } from '#scripts/check-gate.ts';
import type { StepResult } from '#scripts/check-gate.ts';

const repositoryRoot: string = fileURLToPath(new URL('..', import.meta.url));

const secondsOf = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(1)} s`;

const runStep = (script: string): Promise<StepResult> => {
	const start: number = performance.now();

	return new Promise<StepResult>((resolve: (result: StepResult) => void): void => {
		const chunks: Buffer[] = [];

		// A shell finds `pnpm` on Windows too, where it is a `.cmd`.
		const child: ChildProcess = spawn(`pnpm run ${script}`, {
			cwd: repositoryRoot,
			shell: true,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		child.stdout?.on('data', (chunk: Buffer): void => {
			chunks.push(chunk);
		});

		child.stderr?.on('data', (chunk: Buffer): void => {
			chunks.push(chunk);
		});

		child.on('close', (code: number | null): void => {
			resolve({
				script,
				succeeded: code === 0,
				output: Buffer.concat(chunks).toString('utf8'),
				milliseconds: performance.now() - start,
			});
		});
	});
};

const report = (result: StepResult): void => {
	console.log(
		`${result.succeeded ? 'ok  ' : 'FAIL'}  ${result.script} (${secondsOf(result.milliseconds)})`,
	);

	if (!result.succeeded) console.error(`\n${result.output}`);
};

const start: number = performance.now();
const results: StepResult[] = await runCheckGate(checkPhases, runStep, report);
const failed: StepResult[] = results.filter((result: StepResult): boolean => !result.succeeded);

const summary: string =
	failed.length === 0
		? `\nAll ${String(results.length)} steps passed in ${secondsOf(performance.now() - start)}.`
		: `\nFailed: ${failed.map((result: StepResult): string => result.script).join(', ')}.`;

console[failed.length === 0 ? 'log' : 'error'](summary);
process.exitCode = failed.length === 0 ? 0 : 1;
