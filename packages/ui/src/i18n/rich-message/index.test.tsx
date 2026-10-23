// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider, useI18n } from '@/src/i18n/i18n-provider/index';
import type { I18nProviderProps, I18nValue } from '@/src/i18n/i18n-provider/index';
import type { I18nResources } from '@/src/i18n/library-messages';
import { RichMessage } from '@/src/i18n/rich-message/index';
import type { MalformedMessageHandler, RichTags } from '@/src/i18n/rich-text';

const resources: I18nResources = {
	'en-US': {
		translation: {
			welcome: 'Welcome, <strong>{{name}}</strong>. Read the <docs>guide</docs>.',
			broken: 'Unclosed <em>emphasis',
		},
	},
	'pt-BR': {
		translation: {
			welcome: 'Boas-vindas, <strong>{{name}}</strong>. Leia o <docs>guia</docs>.',
			broken: 'Ênfase <em>sem fechamento',
		},
	},
};

const docs: RichTags = {
	docs: (children: ReactNode): ReactNode => <a href='/docs'>{children}</a>,
};

const Providers = ({
	children,
	...props
}: Partial<I18nProviderProps> & { children: ReactNode }): ReactElement => {
	return (
		<I18nProvider locale='en-US' fallbackLocale='en-US' resources={resources} {...props}>
			{children}
		</I18nProvider>
	);
};

const Welcome = (): ReactElement => {
	const { rich, plain }: I18nValue = useI18n();

	return (
		<p aria-label={plain('welcome', { name: 'Samus Aran' })}>
			{rich('welcome', { name: 'Samus Aran' }, docs)}
		</p>
	);
};

afterEach((): void => {
	cleanup();
});

describe('RichMessage', (): void => {
	it('renders the tags of a translation with the values as text', (): void => {
		render(
			<Providers>
				<p data-testid='message'>
					<RichMessage messageKey='welcome' values={{ name: '<em>Spike</em>' }} tags={docs} />
				</p>
			</Providers>,
		);

		expect(screen.getByTestId('message').innerHTML).toBe(
			'Welcome, <strong>&lt;em&gt;Spike&lt;/em&gt;</strong>. Read the <a href="/docs">guide</a>.',
		);
	});

	it('follows the locale of the provider', (): void => {
		const { rerender } = render(
			<Providers>
				<RichMessage messageKey='welcome' values={{ name: 'Leia' }} tags={docs} />
			</Providers>,
		);

		act((): void => {
			rerender(
				<Providers locale='pt-BR'>
					<RichMessage messageKey='welcome' values={{ name: 'Leia' }} tags={docs} />
				</Providers>,
			);
		});

		expect(screen.getByRole('link', { name: 'guia' })).toBeTruthy();
	});

	it('reports a malformed message to the handler of the provider and renders it as text', (): void => {
		const onMalformedMessage: MalformedMessageHandler = vi.fn<MalformedMessageHandler>();

		render(
			<Providers onMalformedMessage={onMalformedMessage}>
				<RichMessage messageKey='broken' />
			</Providers>,
		);

		expect(screen.getByText('Unclosed <em>emphasis')).toBeTruthy();
		expect(onMalformedMessage).toHaveBeenCalledWith('Unclosed <em>emphasis', 'unclosedTag', 'em');
	});
});

describe('rich and plain of useI18n', (): void => {
	it('give the rich message and its plain text for attributes', (): void => {
		render(
			<Providers>
				<Welcome />
			</Providers>,
		);

		expect(
			screen.getByLabelText('Welcome, Samus Aran. Read the guide.').querySelector('strong')
				?.textContent,
		).toBe('Samus Aran');
	});

	it('render the same markup on the server', (): void => {
		expect(
			renderToString(
				<Providers>
					<Welcome />
				</Providers>,
			),
		).toContain('Welcome, <strong>Samus Aran</strong>. Read the <a href="/docs">guide</a>.');
	});
});
