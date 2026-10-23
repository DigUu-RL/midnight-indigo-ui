import { describe, expect, it } from 'vitest';

import { getIconData, renderIconData, scopeIdentifiers } from '@/src/icons/icon-data/index';
import type { IconifyCollection, IconifyIconData, RenderedIcon } from '@/src/icons/icon-data/index';

const collection: IconifyCollection = {
	prefix: 'test',
	width: 24,
	height: 24,
	icons: {
		arrow: { body: '<path d="M4 12h16"/>' },
		wide: { body: '<path d="M0 0h32"/>', width: 32, height: 16 },
	},
	aliases: {
		'arrow-down': { parent: 'arrow', rotate: 1 },
		'arrow-up': { parent: 'arrow-down', rotate: 2, hFlip: true },
		'wide-tall': { parent: 'wide', height: 32 },
		loop: { parent: 'loop' },
	},
};

describe('getIconData', (): void => {
	it('applies the dimensions the collection sets for all its icons', (): void => {
		expect(getIconData(collection, 'arrow')).toStrictEqual({
			width: 24,
			height: 24,
			body: '<path d="M4 12h16"/>',
		});
	});

	it('keeps the dimensions of an icon over those of the collection', (): void => {
		expect(getIconData(collection, 'wide')).toMatchObject({ width: 32, height: 16 });
	});

	it('follows aliases, adding rotations, cancelling flips and replacing dimensions', (): void => {
		expect(getIconData(collection, 'arrow-down')).toMatchObject({ rotate: 1, hFlip: false });
		expect(getIconData(collection, 'arrow-up')).toMatchObject({ rotate: 3, hFlip: true });
		expect(getIconData(collection, 'wide-tall')).toMatchObject({ width: 32, height: 32 });
	});

	it('returns undefined for an unknown icon or an alias cycle', (): void => {
		expect(getIconData(collection, 'missing')).toBeUndefined();
		expect(getIconData(collection, 'loop')).toBeUndefined();
	});
});

describe('renderIconData', (): void => {
	const arrow: IconifyIconData = { body: '<path/>', width: 24, height: 16 };

	it('frames the icon in its box, with Iconify defaults', (): void => {
		expect(renderIconData({ body: '<path/>' })).toEqual({
			viewBox: '0 0 16 16',
			aspectRatio: 1,
			body: '<path></path>',
		});

		expect(renderIconData({ ...arrow, left: -2, top: 1 })).toMatchObject({ viewBox: '-2 1 24 16' });
	});

	it('mirrors with a transform of the body', (): void => {
		const horizontal: RenderedIcon = renderIconData({ ...arrow, hFlip: true });
		const vertical: RenderedIcon = renderIconData({ ...arrow, vFlip: true });

		expect(horizontal.body).toBe('<g transform="translate(24 0) scale(-1 1)"><path></path></g>');
		expect(vertical.body).toBe('<g transform="translate(0 16) scale(1 -1)"><path></path></g>');
	});

	it('swaps the axes on a quarter turn', (): void => {
		const turned: RenderedIcon = renderIconData({ ...arrow, rotate: 1 });

		expect(turned.viewBox).toBe('0 0 16 24');
		expect(turned.aspectRatio).toBe(16 / 24);
		expect(turned.body).toBe('<g transform="rotate(90 8 8)"><path></path></g>');
	});

	it('treats flipping both ways as a half turn', (): void => {
		expect(renderIconData({ ...arrow, hFlip: true, vFlip: true }).body).toBe(
			renderIconData({ ...arrow, rotate: 2 }).body,
		);

		expect(renderIconData({ ...arrow, rotate: -1 }).body).toContain('rotate(-90');
	});
});

describe('scopeIdentifiers', (): void => {
	it('renames ids and every reference to them', (): void => {
		const body: string =
			'<defs><mask id="a"><path/></mask><linearGradient id="a.b"/></defs>' +
			'<path mask="url(#a)" fill="url(#a.b)"/><use href="#a"/>';

		expect(scopeIdentifiers(body, 'icon1')).toBe(
			'<defs><mask id="icon1-0"><path/></mask><linearGradient id="icon1-1"/></defs>' +
				'<path mask="url(#icon1-0)" fill="url(#icon1-1)"/><use href="#icon1-0"/>',
		);
	});

	it('leaves a body without ids unchanged', (): void => {
		expect(scopeIdentifiers('<path d="M0 0"/>', 'icon1')).toBe('<path d="M0 0"/>');
	});
});
