// Renders the compiled dashboard shell and patterns on the server, as a consumer's SSR framework would, with its own
// router link, branding, navigation and texts: nothing in the package has to be forked to replace them.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	DashboardLayout,
	DashboardPanel,
	FilterBar,
	KpiGrid,
	PageHeader,
} from '@midnight-indigo/ui/dashboard';
import { NavigationProvider } from '@midnight-indigo/ui/navigation';
import type { LinkComponentProps } from '@midnight-indigo/ui/navigation';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

// Without a style cache, Emotion writes each `<style>` right before its element: markup is checked without them.
const withoutStyles = (html: string): string => html.replaceAll(/<style[^>]*>.*?<\/style>/gs, '');

const RouterLink = (props: LinkComponentProps): ReactElement => {
	return createElement('a', { ...props, 'data-router-link': '' });
};

test('the compiled dashboard renders on the server with the content and texts of the consumer', (): void => {
	const page: ReactElement = createElement(
		NavigationProvider,
		{ linkComponent: RouterLink },
		// `children` goes in the props: it is required, and TypeScript does not count the rest arguments for it.
		createElement(DashboardLayout, {
			navigation: {
				label: 'Navegação principal',
				items: [
					{
						id: 'sales',
						label: 'Vendas',
						icon: createElement('svg'),
						href: '/vendas',
						current: true,
					},
				],
			},
			brand: createElement('strong', null, 'Loja Aurora'),
			topbar: createElement('button', { type: 'button' }, 'Notificações'),
			sidebarVariant: 'rail',
			labels: { skipToContent: 'Pular para o conteúdo' },
			children: [
				createElement(PageHeader, {
					key: 'header',
					title: 'Vendas',
					description: 'Pedidos de todas as lojas.',
				}),
				createElement(FilterBar, {
					key: 'filters',
					label: 'Filtros',
					onClear: (): void => undefined,
					labels: { clear: 'Limpar filtros' },
					children: createElement('input', { 'aria-label': 'Cliente' }),
				}),
				createElement(KpiGrid, {
					key: 'figures',
					label: 'Indicadores',
					items: [{ id: 'revenue', label: 'Receita', value: 'R$ 48.210' }],
				}),
				createElement(DashboardPanel, {
					key: 'revenue',
					title: 'Receita por mês',
					children: 'Gráfico',
				}),
			],
		}),
	);

	const html: string = renderToString(page);
	const markup: string = withoutStyles(html);

	assert.match(markup, /^<div[^>]*><a href="#[^"]+"[^>]*>Pular para o conteúdo<\/a>/);
	assert.match(markup, /<nav[^>]*aria-label="Navegação principal"/);
	assert.match(markup, /<a href="\/vendas" aria-current="page"[^>]*data-router-link=""/);
	assert.match(markup, /<header[^>]*>.*?Loja Aurora.*?Notificações.*?<\/header>/s);
	assert.match(markup, /<main id="[^"]+" tabindex="-1"/);
	assert.match(markup, /<h1[^>]*>Vendas<\/h1>/);
	assert.match(markup, /<form[^>]*role="search" aria-label="Filtros"/);
	assert.match(markup, />Limpar filtros<\/button>/);
	assert.match(markup, /<ul[^>]*aria-label="Indicadores"/);

	assert.match(
		markup,
		/<section[^>]*aria-labelledby="([^"]+)".*?<h2[^>]*id="\1"[^>]*>Receita por mês/s,
	);

	assert.doesNotMatch(markup, /Collapse navigation|Expand navigation/);
	assert.match(html, /width:4\.5rem/);
});
