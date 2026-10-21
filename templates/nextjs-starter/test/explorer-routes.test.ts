// The public path of the page of a component and the path of the route of its subpath, which the proxy and the code
// that reads the URL turn into each other.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { publicPathOf, routePathOf } from '#src/explorer/routes.ts';

const subpathOf = (slug: string): string | undefined => {
	return slug === 'chip' ? 'data-display' : undefined;
};

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
