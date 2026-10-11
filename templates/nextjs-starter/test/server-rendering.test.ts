// Serves the production build (`pnpm build` runs first) and inspects the streamed HTML as a browser receives it.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import type { AddressInfo, Server } from 'node:net';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { tokens } from '@midnight-indigo/ui/tokens';

interface StreamedPage {
	/** Everything received up to the chunk that closes the `<head>`: what the browser paints first. */
	shell: string;
	/** The complete response, including the chunks streamed after the shell. */
	html: string;
}

interface ThemeConfiguration {
	palette: { official: { main: string } };
}

const starterRoot: string = fileURLToPath(new URL('..', import.meta.url));
const nextExecutable: string = fileURLToPath(import.meta.resolve('next/dist/bin/next'));

const themeConfiguration: ThemeConfiguration = JSON.parse(
	readFileSync(new URL('../src/theme.json', import.meta.url), 'utf8'),
) as ThemeConfiguration;

const themeStyleMarker: string = 'data-href="midnight-indigo-theme-';
const streamedContent: string = 'Streamed panel, styled';
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

const readStreamedPage = async (url: string): Promise<StreamedPage> => {
	const response: Response = await fetch(url);
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
	return { shell: shell ?? html, html };
};

const countOccurrences = (text: string, fragment: string): number => {
	return text.split(fragment).length - 1;
};

const listStylesheetUrls = (html: string, origin: string): URL[] => {
	return [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(
		(match: RegExpExecArray): URL => new URL(match[1] ?? '', origin),
	);
};

let server: ChildProcess | undefined;
let page: StreamedPage;
let origin: string;

before(async (): Promise<void> => {
	assert.ok(existsSync(`${starterRoot}/.next/BUILD_ID`), 'Build the starter first: pnpm build.');

	const port: number = await findFreePort();

	server = spawn(process.execPath, [nextExecutable, 'start', '--port', String(port)], {
		cwd: starterRoot,
		env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
		stdio: 'ignore',
	});

	origin = `http://localhost:${String(port)}`;
	await waitForServer(`${origin}/`, Date.now() + serverStartTimeoutInMilliseconds);
	page = await readStreamedPage(`${origin}/`);
});

after((): void => {
	server?.kill();
});

test('the theme stylesheet arrives in the head of the first flush', (): void => {
	const themeStyleIndex: number = page.shell.indexOf(themeStyleMarker);

	assert.ok(themeStyleIndex >= 0, 'The theme stylesheet is missing from the shell.');
	assert.ok(themeStyleIndex < page.shell.indexOf('</head>'));
});

test('the palette configured in theme.json reaches the CSS custom properties', (): void => {
	const officialMain: string = themeConfiguration.palette.official.main;
	assert.ok(page.html.includes(`--mi-intent-official-main: ${officialMain};`));
});

test('Material UI styles are rendered on the server, so the dark canvas paints without a flash', (): void => {
	const head: string = page.shell.slice(0, page.shell.indexOf('</head>'));

	const canvasBackground: RegExp = new RegExp(
		`body\\{[^}]*background-color:${tokens.surface.canvas}`,
	);

	assert.match(head, /<style data-emotion="mui-global /);
	assert.match(head, canvasBackground);
});

test('the body typography comes from the tokens and is rendered on the server', (): void => {
	const head: string = page.shell.slice(0, page.shell.indexOf('</head>'));
	const { fontFamily, fontSize, lineHeight } = tokens.typography.body;
	const minifiedFontFamily: string = fontFamily.replaceAll(', ', ',');

	assert.ok(head.includes(`font-family:${minifiedFontFamily}`), 'The body font stack is missing.');
	assert.match(head, new RegExp(`body\\{[^}]*font-size:${fontSize}[^}]*line-height:${lineHeight}`));
});

test('Inter is self-hosted: no font is requested from another origin', async (): Promise<void> => {
	const stylesheets: URL[] = listStylesheetUrls(page.html, origin);

	assert.doesNotMatch(page.html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
	assert.ok(stylesheets.length > 0, 'The page links no stylesheet.');

	// Font URLs are relative to the stylesheet that declares them.
	const fontFacesByStylesheet: [URL, string[]][] = await Promise.all(
		stylesheets.map(async (url: URL): Promise<[URL, string[]]> => {
			const css: string = await (await fetch(url)).text();
			return [url, css.match(/@font-face\{[^}]*\}/g) ?? []];
		}),
	);

	const fontFaces: string[] = fontFacesByStylesheet.flatMap(
		([, faces]: [URL, string[]]): string[] => faces,
	);

	const fontUrls: URL[] = fontFacesByStylesheet.flatMap(
		([stylesheet, faces]: [URL, string[]]): URL[] => {
			return faces.flatMap((fontFace: string): URL[] => {
				return [...fontFace.matchAll(/url\(([^)]+)\)/g)].map((match: RegExpExecArray): URL => {
					return new URL((match[1] ?? '').replaceAll(/["']/g, ''), stylesheet);
				});
			});
		},
	);

	assert.ok(
		fontFaces.some((fontFace: string): boolean => fontFace.includes('Inter Variable')),
		'No @font-face declares Inter.',
	);

	assert.deepEqual(
		fontUrls.filter((url: URL): boolean => url.origin !== origin),
		[],
	);

	const fontResponse: Response = await fetch(fontUrls[0] ?? origin);
	assert.equal(fontResponse.status, 200);
	assert.equal(fontResponse.headers.get('content-type'), 'font/woff2');
});

test('functional icons are named and decorative icons are hidden', (): void => {
	assert.match(page.html, /<svg[^>]*role="img"[^>]*aria-label="Completed"/);
	assert.match(page.html, /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
});

test('the components are rendered on the server with their roles and names', (): void => {
	assert.match(page.html, /<button type="button"[^>]*>.*?New report<\/button>/);
	assert.match(page.html, /<button type="button" aria-label="Notifications, 3 unread"/);
	assert.match(page.html, /aria-pressed="true"[^>]*>.*?Open/);
	assert.match(page.html, /aria-label="Remove Finance"/);
	assert.match(page.html, /role="progressbar" aria-label="Monthly goal" aria-valuenow="68"/);
	assert.match(page.html, /aria-roledescription="carousel" aria-label="Highlights"/);
});

test('the form is rendered on the server with labelled fields and a described switch', (): void => {
	assert.match(page.html, /<form[^>]*novalidate=""/i);

	assert.match(
		page.html,
		/<label[^>]*for="([^"]+)"[^>]*>Email address.*?<input[^>]*id="\1"[^>]*aria-describedby="[^"]+"/,
	);

	assert.match(page.html, /<select[^>]*required=""/);
	assert.match(page.html, /role="radiogroup"/);
	assert.match(page.html, /role="switch"[^>]*aria-describedby="[^"]+"/);
	assert.match(page.html, /Sends a notification by email for each new report\./);
	assert.match(page.html, /<button type="submit"[^>]*>.*?Save profile<\/button>/);
});

test('the component styles arrive in the head of the first flush, so controls paint styled', (): void => {
	const head: string = page.shell.slice(0, page.shell.indexOf('</head>'));

	assert.ok(head.includes('background-color:var(--mi-intent-official-main)'));
	assert.ok(head.includes('outline:var(--mi-focus-width) solid var(--mi-focus-ring)'));
});

test('the late chunk is streamed after the shell', (): void => {
	assert.ok(
		!page.shell.includes(streamedContent),
		'The panel was not streamed: it is already in the shell.',
	);

	assert.ok(page.html.includes(streamedContent));
});

test('no stylesheet is duplicated across the streamed chunks', (): void => {
	const emotionStyleIdentifiers: string[] = [
		...page.html.matchAll(/data-emotion="mui ([^"]+)"/g),
	].flatMap((match: RegExpExecArray): string[] => (match[1] ?? '').split(' '));

	assert.equal(countOccurrences(page.html, themeStyleMarker), 1);
	assert.equal(countOccurrences(page.html, '--mi-intent-official-main:'), 1);
	assert.deepEqual(emotionStyleIdentifiers, [...new Set(emotionStyleIdentifiers)]);
});
