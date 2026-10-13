import type { i18n as I18nInstance } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { createI18n, initializeI18n } from '#src/i18n/create-i18n.ts';
import type { I18nOptions } from '#src/i18n/create-i18n.ts';
import { libraryNamespace } from '#src/i18n/library-messages.ts';
import type { I18nResources, Messages } from '#src/i18n/library-messages.ts';

// The convention the wiki recommends; nothing requires it.
const resources: I18nResources = {
	'en-US': {
		translation: {
			text: { name: 'Name', search: 'Search' },
			user: { greeting: 'Hello, {{name}}!' },
			inbox: { messages: { one: '{{count}} message', other: '{{count}} messages' } },
			report: {
				generatedAt: 'Generated on {{date, datetime}}',
				total: 'Total: {{value, currency}}',
			},
			onlyInEnglish: 'Only in English',
		},
		billing: { plan: 'Plan' },
	},
	'pt-BR': {
		translation: {
			text: { name: 'Nome', search: 'Pesquisar' },
			user: { greeting: 'Olá, {{name}}!' },
			inbox: {
				messages: {
					zero: 'Nenhuma mensagem',
					one: '{{count, number}} mensagem',
					many: '{{count, number}} de mensagens',
					other: '{{count, number}} mensagens',
				},
			},
			report: { generatedAt: 'Gerado em {{date, datetime}}', total: 'Total: {{value, currency}}' },
		},
		billing: { plan: 'Plano' },
	},
};

const silent: Pick<I18nOptions, 'onMissingKey'> = { onMissingKey: (): void => undefined };

const brazilian = async (overrides: Partial<I18nOptions> = {}): Promise<I18nInstance> => {
	return createI18n({
		locale: 'pt-BR',
		fallbackLocale: 'en-US',
		resources,
		...silent,
		...overrides,
	});
};

describe('createI18n', (): void => {
	it('is ready at once when every message is bundled', (): void => {
		const { instance } = initializeI18n({ locale: 'pt-BR', fallbackLocale: 'en-US', resources });

		expect(instance.t('text.search')).toBe('Pesquisar');
	});

	it('interpolates without escaping, since React escapes', async (): Promise<void> => {
		const i18n: I18nInstance = await brazilian();

		expect(i18n.t('user.greeting', { name: 'Ana & Bia <3' })).toBe('Olá, Ana & Bia <3!');
	});

	it('pluralizes with the rules of the locale, including zero and many', async (): Promise<void> => {
		const i18n: I18nInstance = await brazilian();

		expect(i18n.t('inbox.messages', { count: 0 })).toBe('Nenhuma mensagem');
		expect(i18n.t('inbox.messages', { count: 1 })).toBe('1 mensagem');
		expect(i18n.t('inbox.messages', { count: 2500 })).toBe('2.500 mensagens');
		expect(i18n.t('inbox.messages', { count: 1_000_000 })).toBe('1.000.000 de mensagens');

		await i18n.changeLanguage('en-US');
		expect(i18n.t('inbox.messages', { count: 0 })).toBe('0 messages');
		expect(i18n.t('inbox.messages', { count: 1 })).toBe('1 message');
	});

	it('falls back to the fallback locale, then to the key', async (): Promise<void> => {
		const i18n: I18nInstance = await brazilian();

		expect(i18n.t('onlyInEnglish')).toBe('Only in English');
		expect(i18n.t('nowhere.at.all')).toBe('nowhere.at.all');
	});

	it('reports each key that resolves in no locale', async (): Promise<void> => {
		const onMissingKey = vi.fn();
		const i18n: I18nInstance = await brazilian({ onMissingKey });

		i18n.t('onlyInEnglish');
		i18n.t('nowhere');
		i18n.t('nowhere');

		expect(onMissingKey).toHaveBeenCalledExactlyOnceWith('nowhere', 'translation', ['en-US']);
	});

	it('warns about missing keys in the console by default', async (): Promise<void> => {
		const warn = vi.spyOn(console, 'warn').mockImplementation((): void => undefined);

		const i18n: I18nInstance = await createI18n({
			locale: 'en-US',
			fallbackLocale: 'en-US',
			resources,
		});

		i18n.t('nowhere');

		expect(warn).toHaveBeenCalledWith(
			'[Midnight Indigo: UI] Missing translation "translation:nowhere" for en-US.',
		);

		warn.mockRestore();
	});

	it('keeps namespaces apart, with the first one as default', async (): Promise<void> => {
		const i18n: I18nInstance = await brazilian();

		expect(i18n.options.defaultNS).toBe('translation');
		expect(i18n.t('plan', { ns: 'billing' })).toBe('Plano');
		expect(i18n.t('billing:plan')).toBe('Plano');
		expect(i18n.t('dialog.close', { ns: libraryNamespace })).toBe('Fechar');
	});

	it('lets the application override the texts of the library', async (): Promise<void> => {
		const i18n: I18nInstance = await brazilian({
			resources: { ...resources, 'pt-BR': { [libraryNamespace]: { dialog: { close: 'Sair' } } } },
		});

		expect(i18n.t('dialog.close', { ns: libraryNamespace })).toBe('Sair');
		expect(i18n.t('drawer.close', { ns: libraryNamespace })).toBe('Fechar');
	});

	it('accepts a locale the library does not ship, falling back for its texts', async (): Promise<void> => {
		const i18n: I18nInstance = await createI18n({
			locale: 'es',
			fallbackLocale: 'en-US',
			resources: {
				es: {
					translation: { text: { search: 'Buscar' } },
					[libraryNamespace]: { dialog: { close: 'Cerrar' } },
				},
			},
			...silent,
		});

		expect(i18n.t('text.search')).toBe('Buscar');
		expect(i18n.t('dialog.close', { ns: libraryNamespace })).toBe('Cerrar');
		expect(i18n.t('drawer.close', { ns: libraryNamespace })).toBe('Close');
	});

	it('loads messages dynamically, on creation and when the locale changes', async (): Promise<void> => {
		const files: Record<string, Messages> = {
			'pt-BR/translation': { text: { search: 'Pesquisar' } },
			'fr/translation': { text: { search: 'Rechercher' } },
			'fr/midnight-indigo': { dialog: { close: 'Fermer' } },
		};

		const loadMessages = vi.fn(
			(locale: string, namespace: string): Promise<Messages | undefined> => {
				return Promise.resolve(files[`${locale}/${namespace}`]);
			},
		);

		const i18n: I18nInstance = await createI18n({
			locale: 'pt-BR',
			fallbackLocale: 'en-US',
			loadMessages,
			...silent,
		});

		expect(i18n.t('text.search')).toBe('Pesquisar');
		// The texts of the library are bundled, so they are never requested for its own locales.
		expect(loadMessages).not.toHaveBeenCalledWith('pt-BR', libraryNamespace);

		await i18n.changeLanguage('fr');

		expect(i18n.t('text.search')).toBe('Rechercher');
		expect(i18n.t('dialog.close', { ns: libraryNamespace })).toBe('Fermer');
		expect(i18n.t('drawer.close', { ns: libraryNamespace })).toBe('Close');
	});

	it('formats dates and currencies in messages with the configured time zone and currency', async (): Promise<void> => {
		const i18n: I18nInstance = await brazilian({ timeZone: 'America/Sao_Paulo', currency: 'BRL' });
		const instant: Date = new Date('2026-10-13T02:30:00Z');

		expect(
			i18n.t('report.generatedAt', {
				date: instant,
				formatParams: { date: { dateStyle: 'short', timeStyle: 'short' } },
			}),
		).toBe('Gerado em 12/10/2026, 23:30');

		expect(i18n.t('report.total', { value: 1234.5 }).replaceAll('\u00A0', ' ')).toBe(
			'Total: R$ 1.234,50',
		);
	});

	it('creates independent instances', async (): Promise<void> => {
		const first: I18nInstance = await brazilian();
		const second: I18nInstance = await brazilian({ locale: 'en-US' });

		expect(first.t('text.name')).toBe('Nome');
		expect(second.t('text.name')).toBe('Name');
	});
});
