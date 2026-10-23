// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Icon, iconAccessibilityProps } from '@/src/icons/icon/index';

const checkPath: ReactElement = <path d='M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' />;

const parseSvg = (element: ReactElement): SVGSVGElement => {
	const markup: string = renderToStaticMarkup(element);

	const svg: Element | null = new DOMParser().parseFromString(
		markup,
		'image/svg+xml',
	).documentElement;

	if (!(svg instanceof SVGSVGElement)) throw new Error(`Not an SVG element: ${markup}`);
	return svg;
};

describe('Icon accessibility', (): void => {
	it('hides a decorative icon from the accessibility tree', (): void => {
		const svg: SVGSVGElement = parseSvg(<Icon decorative>{checkPath}</Icon>);

		expect(svg.getAttribute('aria-hidden')).toBe('true');
		expect(svg.getAttribute('focusable')).toBe('false');
		expect(svg.hasAttribute('role')).toBe(false);
		expect(svg.hasAttribute('aria-label')).toBe(false);
	});

	it('names a functional icon', (): void => {
		const svg: SVGSVGElement = parseSvg(<Icon label='Completed'>{checkPath}</Icon>);

		expect(svg.getAttribute('role')).toBe('img');
		expect(svg.getAttribute('aria-label')).toBe('Completed');
		expect(svg.hasAttribute('aria-hidden')).toBe(false);
	});

	it('rejects a blank label', (): void => {
		expect((): string => renderToStaticMarkup(<Icon label=' '>{checkPath}</Icon>)).toThrow(
			/icon label cannot be blank/,
		);
	});

	it('requires choosing between a label and decorative', (): void => {
		// @ts-expect-error An icon must be either labeled or decorative.
		const neither: ReactElement = <Icon>{checkPath}</Icon>;

		const both: ReactElement = (
			// @ts-expect-error An icon cannot be labeled and decorative at once.
			<Icon label='Completed' decorative>
				{checkPath}
			</Icon>
		);

		expect([neither, both]).toHaveLength(2);
	});
});

describe('iconAccessibilityProps', (): void => {
	it('returns the attributes for any icon component', (): void => {
		expect(iconAccessibilityProps({ decorative: true })).toEqual({
			'aria-hidden': true,
			focusable: 'false',
		});

		expect(iconAccessibilityProps({ label: 'Warning' })).toEqual({
			role: 'img',
			'aria-label': 'Warning',
		});
	});
});

describe('Icon appearance', (): void => {
	it('follows the surrounding text by default', (): void => {
		const svg: SVGSVGElement = parseSvg(<Icon decorative>{checkPath}</Icon>);

		expect(svg.getAttribute('style')).toContain('width:1em;height:1em');
		expect(svg.getAttribute('fill')).toBe('currentColor');
		expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
	});

	it('uses the icon size tokens', (): void => {
		const svg: SVGSVGElement = parseSvg(
			<Icon decorative size='medium'>
				{checkPath}
			</Icon>,
		);

		expect(svg.getAttribute('style')).toContain(
			'width:var(--mi-icon-size-medium);height:var(--mi-icon-size-medium)',
		);
	});

	it('accepts SVG attributes, e.g. for stroke-based icon sets', (): void => {
		const svg: SVGSVGElement = parseSvg(
			<Icon label='Search' fill='none' stroke='currentColor' className='search-icon'>
				<circle cx='11' cy='11' r='7' />
			</Icon>,
		);

		expect(svg.getAttribute('fill')).toBe('none');
		expect(svg.getAttribute('stroke')).toBe('currentColor');
		expect(svg.getAttribute('class')).toBe('search-icon');
		expect(svg.querySelector('circle')).not.toBeNull();
	});
});
