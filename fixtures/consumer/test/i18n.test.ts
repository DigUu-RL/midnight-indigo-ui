// Translates with the compiled i18n subpath, on the server, as a consumer's Server Component or SSR framework would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DataTable } from '@midnight-indigo/ui/data-display';
import { createI18n, I18nProvider, libraryNamespace } from '@midnight-indigo/ui/i18n';
import type { i18n as I18nInstance } from 'i18next';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

interface Row {
	id: string;
	name: string;
}

test('createI18n translates, pluralizes and carries the texts of the library', async (): Promise<void> => {
	const i18n: I18nInstance = await createI18n({
		locale: 'pt-BR',
		fallbackLocale: 'en-US',
		resources: {
			'pt-BR': { translation: { items: { one: '{{count}} item', other: '{{count}} itens' } } },
		},
	});

	assert.equal(i18n.t('items', { count: 3 }), '3 itens');
	assert.equal(i18n.t('dialog.close', { ns: libraryNamespace }), 'Fechar');
});

test('the components render the texts of the provider on the server', (): void => {
	const rows: Row[] = [
		{ id: '1', name: 'Ana' },
		{ id: '2', name: 'Bia' },
	];

	const page: ReactElement = createElement(
		I18nProvider,
		{ locale: 'pt-BR', fallbackLocale: 'en-US', timeZone: 'America/Sao_Paulo' },
		createElement(DataTable<Row>, {
			caption: 'Clientes',
			rows,
			getRowId: (row: Row): string => row.id,
			pageSize: 1,
			columns: [{ id: 'name', header: 'Nome', cell: (row: Row): string => row.name }],
		}),
	);

	const html: string = renderToString(page);

	assert.match(html, /aria-label="Páginas de Clientes"/);
	assert.match(html, /aria-label="Próxima página"/);
});
