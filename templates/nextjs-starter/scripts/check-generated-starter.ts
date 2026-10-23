// Proves that a generated starter works outside the monorepo, as a user would run it: generates a copy with the local
// build of the library (`--pack`) in a temporary directory, installs it with pnpm, builds it, serves it and requests
// every page in each locale. Needs the library built (`pnpm build`) and access to the npm registry.
//
//   pnpm check:starter
import { execSync, spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import type { AddressInfo, Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createStarter } from '@/scripts/create-starter';

interface PageCheck {
	path: string;
	status: number;
	/** `lang` of `<html>`, or the target of a redirect. */
	expected: string;
}

const checks: readonly PageCheck[] = [
	{ path: '/', status: 307, expected: '/en-us' },
	{ path: '/en-us', status: 200, expected: 'en-US' },
	{ path: '/pt-br', status: 200, expected: 'pt-BR' },
	{ path: '/pt-br/orders', status: 200, expected: 'pt-BR' },
	{ path: '/en-us/reports', status: 200, expected: 'en-US' },
	{ path: '/pt-br/customers/new', status: 200, expected: 'pt-BR' },
	{ path: '/en-us/settings/appearance', status: 200, expected: 'en-US' },
	{ path: '/gallery', status: 200, expected: 'en-US' },
	{ path: '/pt-br/no/such/page', status: 404, expected: 'pt-BR' },
];

const serverStartTimeoutInMilliseconds: number = 60_000;

// The generated project lives outside the monorepo, where the alias hook that pnpm loads here
// (`--import=@midnight-indigo/node-aliases` in `NODE_OPTIONS`) does not exist: Next.js resolves `@/` on its own.
const standaloneEnvironment: NodeJS.ProcessEnv = {
	...process.env,
	NEXT_TELEMETRY_DISABLED: '1',
	NODE_OPTIONS: '',
};

const run = (command: string, directory: string): void => {
	console.log(`$ ${command}`);

	execSync(command, {
		cwd: directory,
		stdio: 'inherit',
		env: standaloneEnvironment,
	});
};

const findFreePort = async (): Promise<number> => {
	const server: Server = createServer();

	await new Promise<void>((resolve: () => void): void => {
		server.listen(0, resolve);
	});

	const { port }: AddressInfo = server.address() as AddressInfo;

	await new Promise<void>((resolve: () => void): void => {
		server.close((): void => {
			resolve();
		});
	});

	return port;
};

const waitForServer = async (url: string, deadline: number): Promise<void> => {
	const isUp: boolean = await fetch(url).then(
		(response: Response): boolean => response.ok,
		(): boolean => false,
	);

	if (isUp) return;

	if (Date.now() > deadline) {
		throw new Error(`The generated starter did not answer at ${url} in time.`);
	}

	await new Promise((resolve: (value: unknown) => void): void => {
		setTimeout(resolve, 500);
	});

	await waitForServer(url, deadline);
};

const failureOf = async (
	origin: string,
	{ path, status, expected }: PageCheck,
): Promise<string | undefined> => {
	const response: Response = await fetch(`${origin}${path}`, { redirect: 'manual' });
	const html: string = await response.text();

	const actual: string =
		response.status === 307
			? new URL(response.headers.get('location') ?? '', origin).pathname
			: (/<html lang="([^"]+)"/.exec(html)?.[1] ?? 'no lang');

	console.log(`${path}: ${String(response.status)} ${actual}`);

	return response.status === status && actual === expected
		? undefined
		: `${path}: expected ${String(status)} ${expected}, got ${String(response.status)} ${actual}`;
};

const workspace: string = mkdtempSync(join(tmpdir(), 'midnight-indigo-generated-'));
const project: string = join(workspace, 'aurora-admin');
let server: ChildProcess | undefined;

try {
	createStarter({ target: project, pack: true });
	console.log(`Generated in ${project}`);
	run('pnpm install', project);
	run('pnpm build', project);

	const port: number = await findFreePort();
	const origin: string = `http://localhost:${String(port)}`;

	server = spawn(
		process.execPath,
		[join(project, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '--port', String(port)],
		{
			cwd: project,
			env: standaloneEnvironment,
			stdio: 'ignore',
		},
	);

	await waitForServer(`${origin}/en-us`, Date.now() + serverStartTimeoutInMilliseconds);

	const failures: string[] = (
		await Promise.all(
			checks.map(async (check: PageCheck): Promise<string | undefined> => failureOf(origin, check)),
		)
	).filter((failure: string | undefined): failure is string => failure !== undefined);

	if (failures.length > 0) throw new Error(`The generated starter failed:\n${failures.join('\n')}`);

	console.log('The generated starter installs, builds and serves every page.');
} finally {
	server?.kill();
	rmSync(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
}
