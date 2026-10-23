// The locale helpers shared by the proxy, the server and the browser.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { localeOfPath, localizePath, negotiateLocale } from '@/src/i18n/locales';

test('the locale of a path is its first segment, when it is one of the locales', (): void => {
	assert.equal(localeOfPath('/pt-br/orders'), 'pt-br');
	assert.equal(localeOfPath('/en-us'), 'en-us');
	assert.equal(localeOfPath('/'), undefined);
	assert.equal(localeOfPath('/orders/pt-br'), undefined);
	assert.equal(localeOfPath('/pt-BR/orders'), undefined);
});

test('a path is moved to another locale, or given one', (): void => {
	assert.equal(localizePath('/pt-br/orders', 'en-us'), '/en-us/orders');
	assert.equal(localizePath('/pt-br', 'en-us'), '/en-us');
	assert.equal(localizePath('/', 'pt-br'), '/pt-br');
	assert.equal(localizePath('/customers/new', 'pt-br'), '/pt-br/customers/new');
});

test('the preferred locale follows the weights of Accept-Language and falls back to the language', (): void => {
	assert.equal(negotiateLocale('pt-BR,pt;q=0.9,en;q=0.8'), 'pt-br');
	assert.equal(negotiateLocale('en;q=0.5, pt-PT;q=0.9'), 'pt-br');
	assert.equal(negotiateLocale('en-GB'), 'en-us');
	assert.equal(negotiateLocale('fr-FR, pt;q=0'), undefined);
	assert.equal(negotiateLocale('*'), undefined);
	assert.equal(negotiateLocale(''), undefined);
	assert.equal(negotiateLocale(null), undefined);
});
