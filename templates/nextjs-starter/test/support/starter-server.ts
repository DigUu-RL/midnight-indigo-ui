// Serves the production build of the starter (`pnpm build` runs first) on a free port, and reads pages as a browser
// receives them: the redirects of the proxy are not followed, and the streamed HTML is split where the `<head>` ends.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import type { AddressInfo, Server } from 'node:net';
import { fileURLToPath } from 'node:url';

export interface StreamedPage {
	status: number;
	/** Everything received up to the chunk that closes the `<head>`: what the browser paints first. */
	shell: string;
	/** The complete response, including the chunks streamed after the shell. */
	html: string;
	headers: Headers;
}

export interface StarterServer {
	origin: string;
	stop: () => void;
}

export const starterRoot: string = fileURLToPath(new URL('../..', import.meta.url));

const nextExecutable: string = fileURLToPath(import.meta.resolve('next/dist/bin/next'));
const serverStartTimeoutInMilliseconds: number = 30_000;

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
	if (Date.now() > deadline) throw new Error(`The starter did not answer at ${url} in time.`);

	await new Promise((resolve: (value: unknown) => void): void => {
		setTimeout(resolve, 200);
	});

	await waitForServer(url, deadline);
};

export const startStarter = async (): Promise<StarterServer> => {
	assert.ok(existsSync(`${starterRoot}/.next/BUILD_ID`), 'Build the starter first: pnpm build.');

	const port: number = await findFreePort();

	const server: ChildProcess = spawn(
		process.execPath,
		[nextExecutable, 'start', '--port', String(port)],
		{
			cwd: starterRoot,
			env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
			stdio: 'ignore',
		},
	);

	const origin: string = `http://localhost:${String(port)}`;
	await waitForServer(`${origin}/en-us`, Date.now() + serverStartTimeoutInMilliseconds);

	return {
		origin,
		stop: (): void => {
			server.kill();
		},
	};
};

export const readStreamedPage = async (
	url: string,
	init: RequestInit = {},
): Promise<StreamedPage> => {
	const response: Response = await fetch(url, { redirect: 'manual', ...init });
	assert.ok(response.body, 'The page has no body.');

	const decoder: TextDecoder = new TextDecoder();
	const received: string[] = [];
	let shell: string | undefined;

	for await (const chunk of response.body) {
		received.push(decoder.decode(chunk, { stream: true }));
		const soFar: string = received.join('');
		shell ??= soFar.includes('</head>') ? soFar : undefined;
	}

	const html: string = received.join('');
	return { status: response.status, shell: shell ?? html, html, headers: response.headers };
};

/** The `<head>` of the first flush. */
export const headOf = (page: StreamedPage): string => {
	return page.shell.slice(0, page.shell.indexOf('</head>'));
};

export const countOccurrences = (text: string, fragment: string): number => {
	return text.split(fragment).length - 1;
};
