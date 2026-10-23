// The public path of the page of a component and the path of the route of its subpath, which the proxy and the code
// that reads the URL turn into each other.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { publicPathOf, routePathOf, routeSegmentOf } from '@/src/explorer/routes';

const subpaths: Readonly<Record<string, string>> = {
	chip: 'data-display',
	'date-picker': 'forms/date-pickers',
};

const subpathOf = (slug: string): string | undefined => subpaths[slug];

test('the page of a component is served by the route of its subpath', (): void => {
	assert.equal(
		routePathOf('/en-us/components/chip', subpathOf),
		'/en-us/components/data-display/chip',
	);

	assert.equal(
		routePathOf('/pt-br/components/chip', subpathOf),
		'/pt-br/components/data-display/chip',
	);
});

test('a nested subpath is one segment of the path of its route', (): void => {
	assert.equal(routeSegmentOf('forms/date-pickers'), 'forms-date-pickers');

	assert.equal(
		routePathOf('/en-us/components/date-picker', subpathOf),
		'/en-us/components/forms-date-pickers/date-picker',
	);

	assert.equal(
		publicPathOf('/pt-br/components/forms-date-pickers/date-picker'),
		'/pt-br/components/date-picker',
	);
});

test('any other path has no route of the explorer', (): void => {
	assert.equal(routePathOf('/en-us/components', subpathOf), undefined);
	assert.equal(routePathOf('/en-us/components/blaster', subpathOf), undefined);
	assert.equal(routePathOf('/en-us/components/data-display/chip', subpathOf), undefined);
	assert.equal(routePathOf('/en-us/orders', subpathOf), undefined);
});

test('the path of the route of a subpath gives back the public path', (): void => {
	assert.equal(publicPathOf('/en-us/components/data-display/chip'), '/en-us/components/chip');
	assert.equal(publicPathOf('/pt-br/components/feedback/dialog'), '/pt-br/components/dialog');
});

test('any other path stays as it is', (): void => {
	[
		'/en-us',
		'/en-us/components',
		'/en-us/components/chip',
		'/en-us/customers/new',
		'/gallery',
	].forEach((path: string): void => {
		assert.equal(publicPathOf(path), path);
	});
});
