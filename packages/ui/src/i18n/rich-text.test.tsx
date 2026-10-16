import type { i18n as I18nInstance } from 'i18next';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { createI18n } from '#src/i18n/create-i18n.ts';
import {
	createRichTranslator,
	defaultRichTags,
	renderRichText,
	toPlainText,
} from '#src/i18n/rich-text.ts';
import type { MalformedMessageHandler, RichTags, RichTranslator } from '#src/i18n/rich-text.ts';

const markupOf = (node: ReactNode): string => renderToStaticMarkup(<>{node}</>);

const silent: MalformedMessageHandler = (): void => undefined;

const link: RichTags = {
	link: (children: ReactNode): ReactNode => <a href='/orders'>{children}</a>,
};

const createTranslator = async (
	onMalformedMessage: MalformedMessageHandler = silent,
): Promise<RichTranslator> => {
	const instance: I18nInstance = await createI18n({
		locale: 'en-US',
		fallbackLocale: 'en-US',
		resources: {
			'en-US': {
				translation: {
					greeting: 'Hello <strong>{{name}}</strong>',
					orders: {
						one: '<strong>{{count, number}}</strong> order of {{customer}}',
						other: '<strong>{{count, number}}</strong> orders of {{customer}}',
					},
					status: { paid: 'Order <em>paid</em>', refunded: 'Order <s>refunded</s>' },
					nested: 'See the <link>orders of <strong>{{customer}}</strong></link>.',
					attributes: 'Read the <link href="https://example.com" onclick="alert(1)">docs</link>.',
					broken: 'An <strong>unclosed tag',
					lines: 'First line<br/>Second line',
				},
			},
		},
		onMissingKey: (): void => undefined,
	});

	return createRichTranslator(instance.t, { onMalformedMessage });
};

describe('renderRichText', (): void => {
	it('renders every default tag as its element', (): void => {
		const message: string = defaultRichTags
			.filter((tag: string): boolean => tag !== 'br')
			.map((tag: string): string => `<${tag}>${tag}</${tag}>`)
			.join(' ');

		expect(markupOf(renderRichText(`${message}<br>end`))).toBe(
			'<strong>strong</strong> <b>b</b> <em>em</em> <i>i</i> <u>u</u> <s>s</s> <code>code</code> ' +
				'<kbd>kbd</kbd> <mark>mark</mark> <small>small</small> <sub>sub</sub> <sup>sup</sup><br/>end',
		);
	});

	it('nests default and custom tags', (): void => {
		const highlight: RichTags = {
			...link,
			highlight: (children: ReactNode): ReactNode => <span className='highlight'>{children}</span>,
		};

		expect(
			markupOf(
				renderRichText('<link>Go to <highlight>the <em>new</em> orders</highlight></link> now', {
					tags: highlight,
				}),
			),
		).toBe(
			'<a href="/orders">Go to <span class="highlight">the <em>new</em> orders</span></a> now',
		);
	});

	it('lets a custom tag replace a default one, and calls a self-closing one without children', (): void => {
		const tags: RichTags = {
			strong: (children: ReactNode): ReactNode => <strong className='accent'>{children}</strong>,
			icon: (children: ReactNode): ReactNode => <span>{children === null ? '★' : 'children'}</span>,
		};

		expect(markupOf(renderRichText('<strong>Top</strong> seller <icon/>', { tags }))).toBe(
			'<strong class="accent">Top</strong> seller <span>★</span>',
		);
	});

	it('ignores attributes written in the translation', (): void => {
		expect(markupOf(renderRichText('<strong class="x" style="color:red">Bold</strong>'))).toBe(
			'<strong>Bold</strong>',
		);
	});

	it.each([
		['an unknown tag', 'Click <script>alert(1)</script> here', 'unknownTag', 'script'],
		['an unclosed tag', 'An <strong>unclosed tag', 'unclosedTag', 'strong'],
		['an unexpected closing tag', 'A closing</em> tag', 'unexpectedClosingTag', 'em'],
	])(
		'shows %s as text and reports it',
		(_case: string, message: string, problem: string, tag: string): void => {
			const onMalformedMessage: MalformedMessageHandler = vi.fn<MalformedMessageHandler>();

			expect(markupOf(renderRichText(message, { onMalformedMessage }))).toBe(
				message.replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
			);

			expect(onMalformedMessage).toHaveBeenCalledWith(message, problem, tag);
		},
	);

	it('keeps the well-formed part of crossed tags and shows the rest as text', (): void => {
		const onMalformedMessage: MalformedMessageHandler = vi.fn<MalformedMessageHandler>();

		expect(
			markupOf(renderRichText('<strong>a <em>b</strong> c</em>', { onMalformedMessage })),
		).toBe('&lt;strong&gt;a <em>b&lt;/strong&gt; c</em>');

		expect(onMalformedMessage).toHaveBeenCalledWith(
			expect.any(String),
			'unexpectedClosingTag',
			'strong',
		);

		expect(onMalformedMessage).toHaveBeenCalledWith(expect.any(String), 'unclosedTag', 'strong');
	});

	it('reports a problem once per message, and leaves a lone < as text', (): void => {
		const onMalformedMessage: MalformedMessageHandler = vi.fn<MalformedMessageHandler>();

		const markup: string = markupOf(
			renderRichText('<x>1</x> < 2 <x>3</x>', { onMalformedMessage }),
		);

		expect(markup).toBe('&lt;x&gt;1&lt;/x&gt; &lt; 2 &lt;x&gt;3&lt;/x&gt;');
		expect(onMalformedMessage).toHaveBeenCalledTimes(1);
	});

	it('warns in the console outside production only', (): void => {
		const warn: MockInstance<typeof console.warn> = vi
			.spyOn(console, 'warn')
			.mockImplementation((): void => undefined);

		markupOf(renderRichText('<strong>open'));
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('tag <strong> is never closed'));

		warn.mockClear();
		vi.stubEnv('NODE_ENV', 'production');
		markupOf(renderRichText('<strong>open'));
		expect(warn).not.toHaveBeenCalled();

		vi.unstubAllEnvs();
		warn.mockRestore();
	});
});

describe('toPlainText', (): void => {
	it('removes the tags, turns <br> into a space and keeps a malformed part', (): void => {
		expect(
			toPlainText('Hello <strong>Samus</strong>, see <link>the <em>docs</em></link>.<br/>Bye <b>', {
				onMalformedMessage: silent,
			}),
		).toBe('Hello Samus, see the docs. Bye <b>');
	});
});

describe('createRichTranslator', (): void => {
	it('renders an interpolated value literally, never as tags', async (): Promise<void> => {
		const { rich, plain }: RichTranslator = await createTranslator();

		expect(markupOf(rich('greeting', { name: '<em>x</em>' }))).toBe(
			'Hello <strong>&lt;em&gt;x&lt;/em&gt;</strong>',
		);

		expect(plain('greeting', { name: '<em>x</em>' })).toBe('Hello <em>x</em>');
	});

	it('protects the values given in the replace option', async (): Promise<void> => {
		const { rich }: RichTranslator = await createTranslator();

		expect(markupOf(rich('greeting', { replace: { name: '</strong>Leia' } }))).toBe(
			'Hello <strong>&lt;/strong&gt;Leia</strong>',
		);
	});

	it('works with plurals, contexts and nested custom tags', async (): Promise<void> => {
		const { rich }: RichTranslator = await createTranslator();

		expect(markupOf(rich('orders', { count: 1200, customer: 'Spike Spiegel' }))).toBe(
			'<strong>1,200</strong> orders of Spike Spiegel',
		);

		expect(markupOf(rich('status', { context: 'refunded' }))).toBe('Order <s>refunded</s>');

		expect(markupOf(rich('nested', { customer: 'Leia Organa' }, link))).toBe(
			'See the <a href="/orders">orders of <strong>Leia Organa</strong></a>.',
		);
	});

	it('ignores attributes of a custom tag in the translation', async (): Promise<void> => {
		const { rich }: RichTranslator = await createTranslator();
		expect(markupOf(rich('attributes', {}, link))).toBe('Read the <a href="/orders">docs</a>.');
	});

	it('renders a malformed translation as text without throwing', async (): Promise<void> => {
		const onMalformedMessage: MalformedMessageHandler = vi.fn<MalformedMessageHandler>();
		const { rich, plain }: RichTranslator = await createTranslator(onMalformedMessage);

		expect(markupOf(rich('broken'))).toBe('An &lt;strong&gt;unclosed tag');
		expect(plain('broken')).toBe('An <strong>unclosed tag');

		expect(onMalformedMessage).toHaveBeenCalledWith(
			'An <strong>unclosed tag',
			'unclosedTag',
			'strong',
		);
	});

	it('gives the plain text of a message for attributes', async (): Promise<void> => {
		const { plain }: RichTranslator = await createTranslator();

		expect(plain('nested', { customer: 'Leia Organa' })).toBe('See the orders of Leia Organa.');
		expect(plain('lines')).toBe('First line Second line');
	});
});
