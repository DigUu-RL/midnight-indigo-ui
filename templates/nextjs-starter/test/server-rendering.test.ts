// Serves the production build (`pnpm build` runs first) and inspects the streamed HTML of the component gallery and of
// the sales overview as a browser receives it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';

import { tokens } from '@midnight-indigo/ui/tokens';

import {
	countOccurrences,
	headOf,
	readStreamedPage,
	startStarter,
} from '@/test/support/starter-server';
import type { StarterServer, StreamedPage } from '@/test/support/starter-server';

interface ThemeConfiguration {
	palette: { official: { main: string } };
}

const themeConfiguration: ThemeConfiguration = JSON.parse(
	readFileSync(new URL('../src/theme.json', import.meta.url), 'utf8'),
) as ThemeConfiguration;

const themeStyleMarker: string = 'data-href="midnight-indigo-theme-';
const streamedContent: string = 'Streamed panel, styled';

const listStylesheetUrls = (html: string, origin: string): URL[] => {
	return [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(
		(match: RegExpExecArray): URL => new URL(match[1] ?? '', origin),
	);
};

let server: StarterServer;
let page: StreamedPage;

before(async (): Promise<void> => {
	server = await startStarter();
	page = await readStreamedPage(`${server.origin}/gallery`);
});

after((): void => {
	server.stop();
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
	const canvasBackground: RegExp = new RegExp(
		`body\\{[^}]*background-color:${tokens.surface.canvas}`,
	);

	assert.match(headOf(page), /<style data-emotion="mui-global /);
	assert.match(headOf(page), canvasBackground);
});

test('the body typography comes from the tokens and is rendered on the server', (): void => {
	const head: string = headOf(page);
	const { fontFamily, fontSize, lineHeight } = tokens.typography.body;
	const minifiedFontFamily: string = fontFamily.replaceAll(', ', ',');

	assert.ok(head.includes(`font-family:${minifiedFontFamily}`), 'The body font stack is missing.');
	assert.match(head, new RegExp(`body\\{[^}]*font-size:${fontSize}[^}]*line-height:${lineHeight}`));
});

test('Geist Sans and Geist Mono are self-hosted: no font is requested from another origin', async (): Promise<void> => {
	const stylesheets: URL[] = listStylesheetUrls(page.html, server.origin);

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
		fontFaces.some((fontFace: string): boolean => fontFace.includes('Geist Variable')),
		'No @font-face declares Geist Sans.',
	);

	assert.ok(
		fontFaces.some((fontFace: string): boolean => fontFace.includes('Geist Mono Variable')),
		'No @font-face declares Geist Mono.',
	);

	assert.deepEqual(
		fontUrls.filter((url: URL): boolean => url.origin !== server.origin),
		[],
	);

	const fontResponse: Response = await fetch(fontUrls[0] ?? server.origin);
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

test('the alerts and overlay triggers are rendered on the server, the overlays themselves are not', (): void => {
	assert.match(page.html, /Two invoices are overdue/);
	assert.match(page.html, /aria-haspopup="menu" aria-expanded="false"[^>]*>.*?More actions/);
	assert.match(page.html, /aria-haspopup="dialog" aria-expanded="false"[^>]*>.*?Filters/);
	assert.match(page.html, /aria-label="Copy link"/);
	assert.doesNotMatch(page.html, /role="(?:dialog|alertdialog|menu|tooltip)"/);
});

test('the navigation is rendered on the server with landmarks, current pages and next/link anchors', (): void => {
	assert.match(page.html, /<nav aria-label="Breadcrumb"><ol/);
	assert.match(page.html, /aria-label="Show 1 more level"/);
	assert.match(page.html, /<nav aria-label="Project sections">/);

	assert.match(
		page.html,
		/<a(?=[^>]*href="\/gallery")(?=[^>]*aria-current="page")[^>]*>(?:<!-- -->)?Overview/,
	);

	assert.match(page.html, /role="tablist" aria-label="Report sections"/);
	assert.match(page.html, /<nav aria-label="Pagination">/);
	assert.match(page.html, /aria-label="Page 1" aria-current="true"/);
	assert.match(page.html, /<a[^>]*href="\/gallery\?view=guide"[^>]*>getting started guide<\/a>/);
	assert.match(page.html, /target="_blank" rel="noopener noreferrer"/);
	assert.match(page.html, /<nav[^>]*aria-label="Demo navigation"/);

	assert.match(
		page.html,
		/<button(?=[^>]*aria-label="Open navigation")(?=[^>]*aria-haspopup="dialog")(?=[^>]*aria-expanded="false")/,
	);
});

test('the data display is rendered on the server: a sorted first page, key figures and states', (): void => {
	assert.match(
		page.html,
		/<table[^>]*aria-rowcount="43"[^>]*><caption id="[^"]+"[^>]*>Invoices<\/caption>/,
	);

	assert.match(
		page.html,
		/<th scope="col" aria-sort="descending"[^>]*><button type="button"[^>]*>Total/,
	);

	assert.match(page.html, /<nav aria-label="Pages of Invoices">/);
	assert.match(page.html, /role="group" aria-labelledby="[^"]+"[^>]*>.*?Revenue/);
	assert.match(page.html, /role="group" aria-labelledby="[^"]+" aria-busy="true"/);
	assert.match(page.html, /<form role="search" aria-label="Invoices"/);
	assert.match(page.html, /<ul aria-label="Latest customers"/);
	assert.match(page.html, /No disputes/);
});

test('the layout switches at the breakpoints with CSS from the first paint', (): void => {
	const head: string = headOf(page);

	assert.match(
		head,
		/@media \(min-width: ?37\.5em\)\{[^}]*\{[^}]*grid-template-columns:repeat\(2, minmax\(0, 1fr\)\)/,
	);

	assert.match(
		head,
		/@media \(min-width: ?75em\)\{[^}]*\{[^}]*grid-template-columns:repeat\(4, minmax\(0, 1fr\)\)/,
	);

	assert.match(
		head,
		/@media \(min-width: ?52\.5em\)\{[^}]*\{[^}]*display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;/,
	);
});

test('the component styles arrive in the head of the first flush, so controls paint styled', (): void => {
	const head: string = headOf(page);

	assert.ok(head.includes('background-color:var(--mi-intent-official-main)'));
	assert.ok(head.includes('outline:var(--mi-focus-width) solid var(--mi-focus-ring)'));
});

test('the sales overview is rendered on the server with its shell, translated texts and loading state', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us`);

	assert.match(html, /<a href="#[^"]+"[^>]*>Skip to main content<\/a>/);
	assert.match(html, /<nav[^>]*aria-label="Main navigation"/);
	assert.match(html, /<a(?=[^>]*href="\/en-us")(?=[^>]*aria-current="page")/);
	assert.match(html, /<header[^>]*>.*?aria-label="Open navigation"/s);
	assert.match(html, /<main id="[^"]+" tabindex="-1"/);
	assert.match(html, /<h1[^>]*>Sales overview<\/h1>/);
	assert.match(html, /<nav[^>]*aria-label="Data scenario"/);
	assert.match(html, /<form[^>]*role="search" aria-label="Filters"/);
	assert.match(html, /<ul[^>]*aria-label="Key figures"/);
	assert.match(html, /role="group" aria-labelledby="[^"]+" aria-busy="true"/);
	assert.match(html, /<section[^>]*aria-labelledby="[^"]+"/);
});

test('a scenario of the mock API is chosen by the URL', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us?state=error`);

	assert.match(html, /<a(?=[^>]*href="\/en-us\?state=error")(?=[^>]*aria-current="page")/);
	assert.doesNotMatch(html, /<a(?=[^>]*href="\/en-us\?state=empty")(?=[^>]*aria-current="page")/);
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
