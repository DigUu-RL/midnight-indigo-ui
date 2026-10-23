// @vitest-environment jsdom
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { useTranslation } from 'react-i18next';
import type { ReactElement, ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { DataTable } from '@/src/data-display/data-table/index';
import { SkeletonText } from '@/src/data-display/skeleton-text/index';
import { Dialog } from '@/src/feedback/dialog/index';
import { Pagination } from '@/src/navigation/pagination/index';
import { SidebarMenuButton } from '@/src/navigation/sidebar/index';
import { I18nProvider, useFormatters, useI18n } from '@/src/i18n/i18n-provider/index';
import type { I18nProviderProps, I18nValue } from '@/src/i18n/i18n-provider/index';
import { libraryNamespace } from '@/src/i18n/library-messages';
import type { I18nResources } from '@/src/i18n/library-messages';

interface Order {
	id: string;
	customer: string;
	placedAt: Date;
}

const resources: I18nResources = {
	'pt-BR': {
		translation: {
			orders: { title: 'Pedidos', count: { one: '{{count}} pedido', other: '{{count}} pedidos' } },
			placedAt: 'Feito em {{date, datetime}}',
		},
	},
	'en-US': {
		translation: {
			orders: { title: 'Orders', count: { one: '{{count}} order', other: '{{count}} orders' } },
			placedAt: 'Placed on {{date, datetime}}',
		},
	},
};

const providerProps: Omit<I18nProviderProps, 'children'> = {
	locale: 'pt-BR',
	fallbackLocale: 'en-US',
	resources,
	timeZone: 'America/Sao_Paulo',
	currency: 'BRL',
};

const orders: Order[] = [
	{ id: '1', customer: 'Ana', placedAt: new Date('2026-10-13T02:30:00Z') },
	{ id: '2', customer: 'Bia', placedAt: new Date('2026-10-12T15:00:00Z') },
];

const OrdersPage = (): ReactElement => {
	const { t, formatDate, formatCurrency }: I18nValue = useI18n();

	return (
		<main>
			<h1>{t('orders.title')}</h1>
			<p>{t('orders.count', { count: orders.length })}</p>

			<p>
				{t('placedAt', {
					date: orders[0]?.placedAt,
					formatParams: { date: { dateStyle: 'short' } },
				})}
			</p>

			<p>{formatDate(new Date('2026-10-13T02:30:00Z'), { dateStyle: 'long' })}</p>
			<p>{formatCurrency(1234.5).replaceAll('\u00A0', ' ')}</p>

			<DataTable
				caption='Pedidos'
				rows={orders}
				getRowId={(order: Order): string => order.id}
				pageSize={1}
				columns={[
					{ id: 'customer', header: 'Cliente', cell: (order: Order): string => order.customer },
				]}
			/>

			<SkeletonText />
		</main>
	);
};

const withProvider = (props: Partial<I18nProviderProps> = {}) => {
	return ({ children }: { children?: ReactNode }): ReactElement => {
		return (
			<I18nProvider {...providerProps} {...props}>
				{children}
			</I18nProvider>
		);
	};
};

afterEach((): void => {
	cleanup();
});

describe('I18nProvider', (): void => {
	it('translates the application and the components, and formats in the given zone and currency', (): void => {
		render(
			<I18nProvider {...providerProps}>
				<OrdersPage />
			</I18nProvider>,
		);

		expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeDefined();
		expect(screen.getByText('2 pedidos')).toBeDefined();
		expect(screen.getByText('Feito em 12/10/2026')).toBeDefined();
		expect(screen.getByText('12 de outubro de 2026')).toBeDefined();
		expect(screen.getByText('R$ 1.234,50')).toBeDefined();
		expect(screen.getByRole('navigation', { name: 'Páginas de Pedidos' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDefined();
		expect(screen.getByText('Carregando')).toBeDefined();
	});

	it('keeps the labels prop of a component over the provider', (): void => {
		render(
			<I18nProvider {...providerProps}>
				<Pagination
					page={1}
					pageCount={3}
					onPageChange={(): void => undefined}
					labels={{ next: 'Avançar' }}
				/>

				<SidebarMenuButton open={false} onOpenChange={(): void => undefined} />
				<SidebarMenuButton open={false} onOpenChange={(): void => undefined} label='Menu' />
			</I18nProvider>,
		);

		expect(screen.getByRole('button', { name: 'Avançar' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Abrir navegação' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Menu' })).toBeDefined();
	});

	it('lets the application override the texts of the library and add a locale', (): void => {
		render(
			<I18nProvider
				locale='es'
				fallbackLocale='en-US'
				resources={{
					es: {
						translation: { orders: { title: 'Pedidos' } },
						[libraryNamespace]: { dialog: { close: 'Cerrar' } },
					},
				}}
				onMissingKey={(): void => undefined}
			>
				<Dialog open title='Pedido' onClose={(): void => undefined}>
					<Pagination page={1} pageCount={3} onPageChange={(): void => undefined} />
				</Dialog>
			</I18nProvider>,
		);

		expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDefined();
		// Texts the new locale lacks come from the fallback locale.
		expect(screen.getByRole('button', { name: 'Next page' })).toBeDefined();
	});

	it('changes the language of the components and the application with the locale prop', async (): Promise<void> => {
		const { rerender } = render(
			<I18nProvider {...providerProps}>
				<OrdersPage />
			</I18nProvider>,
		);

		await act(async (): Promise<void> => {
			rerender(
				<I18nProvider {...providerProps} locale='en-US'>
					<OrdersPage />
				</I18nProvider>,
			);

			await Promise.resolve();
		});

		expect(screen.getByRole('heading', { name: 'Orders' })).toBeDefined();
		expect(screen.getByText('2 orders')).toBeDefined();
		expect(screen.getByText('October 12, 2026')).toBeDefined();
		expect(screen.getByRole('button', { name: 'Next page' })).toBeDefined();
	});

	it('changes the language from a component, loading its messages', async (): Promise<void> => {
		const { result } = renderHook((): I18nValue => useI18n(), {
			wrapper: withProvider({
				loadMessages: (
					locale: string,
					namespace: string,
				): Promise<{ hello: string } | undefined> => {
					return Promise.resolve(
						locale === 'fr' && namespace === 'translation' ? { hello: 'Bonjour' } : undefined,
					);
				},
				onMissingKey: (): void => undefined,
			}),
		});

		await act(async (): Promise<void> => {
			await result.current.changeLocale('fr');
		});

		expect(result.current.t('hello')).toBe('Bonjour');
		expect(result.current.locale).toBe('fr');
	});

	it('shares its instance with react-i18next', (): void => {
		const { result } = renderHook((): string => useTranslation().t('orders.title'), {
			wrapper: withProvider(),
		});

		expect(result.current).toBe('Pedidos');
	});

	it('gives the formatters of its locale', (): void => {
		const { result } = renderHook((): string => useFormatters().formatNumber(1234.5), {
			wrapper: withProvider(),
		});

		expect(result.current).toBe('1.234,5');
	});

	it('is required by the hooks', (): void => {
		expect((): unknown => renderHook((): I18nValue => useI18n())).toThrow(/inside an I18nProvider/);
	});
});

describe('I18nProvider on the server', (): void => {
	const originalTimeZone: string | undefined = process.env.TZ;
	let root: Root | undefined;

	afterEach((): void => {
		act((): void => root?.unmount());
		root = undefined;
		document.body.innerHTML = '';
		process.env.TZ = originalTimeZone;
	});

	it('renders the same text as the browser, which hydrates without mismatch', async (): Promise<void> => {
		const application: ReactElement = (
			<I18nProvider {...providerProps}>
				<OrdersPage />
			</I18nProvider>
		);

		// The server and the browser run in different time zones; the provider gives the one to use.
		process.env.TZ = 'UTC';
		const html: string = renderToString(application);
		const container: HTMLDivElement = document.createElement('div');

		container.innerHTML = html;
		document.body.append(container);
		process.env.TZ = 'Asia/Tokyo';

		const recoverableErrors: unknown[] = [];

		await act(async (): Promise<void> => {
			root = hydrateRoot(container, application, {
				onRecoverableError: (error: unknown): void => {
					recoverableErrors.push(error);
				},
			});

			await Promise.resolve();
		});

		expect(html).toContain('Feito em 12/10/2026');
		expect(html).toContain('Páginas de Pedidos');
		expect(recoverableErrors).toEqual([]);
		expect(container.innerHTML).toBe(html);
	});
});
