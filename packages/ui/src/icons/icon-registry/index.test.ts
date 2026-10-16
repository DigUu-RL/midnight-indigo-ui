import { afterEach, describe, expect, it } from 'vitest';

import type { IconifyCollection } from '#src/icons/icon-data/index.ts';
import {
	listRegisteredIconCollections,
	registerIconCollection,
	resolveIconName,
	unregisterIconCollection,
} from '#src/icons/icon-registry/index.ts';

const collection: IconifyCollection = {
	prefix: 'test',
	width: 24,
	height: 24,
	icons: { home: { body: '<path d="M3 12l9-9 9 9"/>' } },
	aliases: { house: { parent: 'home' } },
};

afterEach((): void => {
	listRegisteredIconCollections().forEach((prefix: string): void => {
		unregisterIconCollection(prefix);
	});
});

describe('icon registry', (): void => {
	it('resolves names and aliases of a registered collection', (): void => {
		registerIconCollection(collection);

		expect(listRegisteredIconCollections()).toEqual(['test']);

		expect(resolveIconName('test:home')).toMatchObject({
			body: collection.icons.home?.body,
			width: 24,
		});

		expect(resolveIconName('test:house').body).toBe(collection.icons.home?.body);
	});

	it('explains how to register a missing collection', (): void => {
		expect((): unknown => resolveIconName('mdi:home')).toThrow(
			/No icon collection is registered for the prefix "mdi".*registerIconCollection.*@iconify-json\/mdi/,
		);
	});

	it('names the missing icon of a registered collection', (): void => {
		registerIconCollection(collection);

		expect((): unknown => resolveIconName('test:garage')).toThrow(
			'The icon collection "test" has no icon "garage" (icon "test:garage").',
		);
	});

	it('rejects a name without a prefix', (): void => {
		expect((): unknown => resolveIconName(':home')).toThrow(/is not an icon name/);
		expect((): unknown => resolveIconName('test:')).toThrow(/is not an icon name/);
	});

	it('replaces a collection registered again and forgets an unregistered one', (): void => {
		registerIconCollection(collection);
		registerIconCollection({ prefix: 'test', icons: { garage: { body: '<path/>' } } });

		expect(resolveIconName('test:garage').body).toBe('<path/>');
		expect(unregisterIconCollection('test')).toBe(true);
		expect(unregisterIconCollection('test')).toBe(false);
	});
});
