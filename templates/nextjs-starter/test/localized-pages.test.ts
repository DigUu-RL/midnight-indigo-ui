// Every page of the application in each locale, served by the production build: the proxy picks the locale of a path
// without one, the server renders the page in the language of its URL with every text translated, the styles in the
// `<head>` of the first flush, and links to the same page in the other language.
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { headOf, readStreamedPage, startStarter } from '@/test/support/starter-server';
import type { StarterServer, StreamedPage } from '@/test/support/starter-server';
import englishMessages from '@/src/messages/en-us.json' with { type: 'json' };
import brazilianPortugueseMessages from '@/src/messages/pt-br.json' with { type: 'json' };

interface Messages {
	readonly [key: string]: string | Messages;
}

interface Locale {
	segment: string;
	tag: string;
	messages: Messages;
}

interface ApplicationPage {
	path: string;
	/** Message of its `h1`. */
	heading: string;
	/** The `h1` is `heading` itself, a name the page does not translate (a component of the explorer). */
	literal?: boolean;
}

const locales: readonly Locale[] = [
	{ segment: 'en-us', tag: 'en-US', messages: englishMessages },
	{ segment: 'pt-br', tag: 'pt-BR', messages: brazilianPortugueseMessages },
];

const applicationPages: readonly ApplicationPage[] = [
	{ path: '', heading: 'overview.header.title' },
	{ path: '/orders', heading: 'orders.header.title' },
	{ path: '/reports', heading: 'reports.header.title' },
	{ path: '/customers/new', heading: 'customers.header.title' },
	{ path: '/settings/appearance', heading: 'appearance.header.title' },
	{ path: '/icons', heading: 'icons.header.title' },
	{ path: '/icons/attribution', heading: 'iconAttribution.header.title' },
	{ path: '/components', heading: 'explorer.header.title' },
	{ path: '/components/button', heading: 'Button', literal: true },
	{ path: '/components/chip', heading: 'Chip', literal: true },
];

const themeStyleMarker: string = 'data-href="midnight-indigo-theme-';

const messageAt = (messages: Messages, path: string): string => {
	const value: string | Messages | undefined = path
		.split('.')
		.reduce((node: string | Messages | undefined, key: string): string | Messages | undefined => {
			return typeof node === 'object' ? node[key] : undefined;
		}, messages);

	assert.equal(typeof value, 'string', `${path} is not a message.`);
	return value as string;
};

/** Paths of every message; a plural object counts as one, as it is translated by its own path. */
const messagePaths = (messages: Messages, prefix: string = ''): string[] => {
	return Object.entries(messages).flatMap(([key, value]: [string, string | Messages]): string[] => {
		const isPlural: boolean = typeof value === 'object' && 'other' in value;

		return typeof value === 'string' || isPlural
			? [`${prefix}${key}`]
			: messagePaths(value, `${prefix}${key}.`);
	});
};

/** React escapes the text it renders. */
const escapeHtml = (text: string): string => {
	return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

let server: StarterServer;

before(async (): Promise<void> => {
	server = await startStarter();
});

after((): void => {
	server.stop();
});

describe('the proxy gives a locale to the paths without one', (): void => {
	const redirectOf = async (path: string, headers: Record<string, string>): Promise<string> => {
		const { status, headers: responseHeaders }: StreamedPage = await readStreamedPage(
			`${server.origin}${path}`,
			{ headers },
		);

		assert.equal(status, 307, `${path} was not redirected.`);
		return new URL(responseHeaders.get('location') ?? '', server.origin).href.replace(
			server.origin,
			'',
		);
	};

	test('the language preferred by the browser, or the same language in another region', async (): Promise<void> => {
		assert.equal(await redirectOf('/', { 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' }), '/pt-br');
		assert.equal(await redirectOf('/', { 'accept-language': 'en-GB,en;q=0.9' }), '/en-us');
		assert.equal(await redirectOf('/', { 'accept-language': 'fr-FR,fr;q=0.9,pt;q=0.5' }), '/pt-br');
	});

	test('English when the browser accepts none of the locales, or says nothing', async (): Promise<void> => {
		assert.equal(await redirectOf('/', { 'accept-language': 'fr-FR,de;q=0.8' }), '/en-us');
		assert.equal(await redirectOf('/', {}), '/en-us');
	});

	test('the language chosen last wins over the browser, and the path and query are kept', async (): Promise<void> => {
		assert.equal(
			await redirectOf('/orders?status=paid', {
				'accept-language': 'en-US',
				cookie: 'locale=pt-br',
			}),
			'/pt-br/orders?status=paid',
		);
	});

	// Only the language links write the cookie: a visit, or a prefetch of the link to the other language, never changes
	// the language of `/` behind the user's back.
	test('a page with a locale is served as is, without setting a cookie', async (): Promise<void> => {
		const page: StreamedPage = await readStreamedPage(`${server.origin}/pt-br/orders`, {
			headers: { 'accept-language': 'en-US', cookie: 'locale=en-us' },
		});

		assert.equal(page.status, 200);
		assert.match(page.html, /<html lang="pt-BR"/);
		assert.equal(page.headers.get('set-cookie'), null);
	});
});

locales.forEach((locale: Locale): void => {
	const other: Locale | undefined = locales.find(
		(candidate: Locale): boolean => candidate !== locale,
	);

	describe(`in ${locale.tag}`, (): void => {
		applicationPages.forEach(({ path, heading, literal = false }: ApplicationPage): void => {
			const url: string = `/${locale.segment}${path}`;
			const headingText: string = literal ? heading : messageAt(locale.messages, heading);

			test(`${url} is rendered on the server in its language, styled from the first flush`, async (): Promise<void> => {
				const page: StreamedPage = await readStreamedPage(`${server.origin}${url}`);
				const head: string = headOf(page);

				assert.equal(page.status, 200);
				assert.match(page.html, new RegExp(`<html lang="${locale.tag}"`));

				assert.match(page.html, new RegExp(`<h1[^>]*>${escapeHtml(headingText)}</h1>`));

				assert.ok(
					head.includes(escapeHtml(messageAt(locale.messages, 'app.name'))),
					'The title is not translated.',
				);

				assert.ok(head.includes(themeStyleMarker), 'The theme stylesheet is not in the head.');
				assert.match(head, /<style data-emotion="mui-global /);
				assert.equal(page.html.split(themeStyleMarker).length - 1, 1);
			});

			test(`${url} has no untranslated text and links to the same page in the other language`, async (): Promise<void> => {
				const { html }: StreamedPage = await readStreamedPage(`${server.origin}${url}`);

				const untranslated: string[] = messagePaths(locale.messages).filter(
					(key: string): boolean => {
						return html.includes(key);
					},
				);

				assert.deepEqual(untranslated, []);

				assert.match(
					html,
					new RegExp(
						`<a(?=[^>]*href="/${other?.segment ?? ''}${path}")(?=[^>]*lang="${other?.tag ?? ''}")(?=[^>]*hrefLang="${other?.tag ?? ''}")`,
						'i',
					),
				);
			});
		});

		test('a missing path is a 404 page in the language of the URL, inside the shell and styled', async (): Promise<void> => {
			const page: StreamedPage = await readStreamedPage(
				`${server.origin}/${locale.segment}/no/such/page`,
			);

			assert.equal(page.status, 404);
			assert.match(page.html, new RegExp(`<html lang="${locale.tag}"`));

			assert.match(
				page.html,
				new RegExp(`<h1[^>]*>${escapeHtml(messageAt(locale.messages, 'notFound.title'))}</h1>`),
			);

			assert.match(page.html, /<nav[^>]*aria-label="[^"]+"[^>]*>/);

			assert.match(
				page.html,
				new RegExp(
					`<a[^>]*href="/${locale.segment}"[^>]*>${escapeHtml(messageAt(locale.messages, 'notFound.home'))}`,
				),
			);

			assert.ok(headOf(page).includes(themeStyleMarker));
		});
	});
});
