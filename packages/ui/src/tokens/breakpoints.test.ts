import { describe, expect, it } from 'vitest';

import { breakpointMediaQuery, breakpointNames, breakpoints } from '@/src/tokens/breakpoints';
import type { Breakpoint } from '@/src/tokens/breakpoints';

describe('breakpoints', (): void => {
	it('start at zero and increase', (): void => {
		const widths: number[] = breakpointNames.map((name: Breakpoint): number => breakpoints[name]);

		expect(widths[0]).toBe(0);
		expect(widths).toEqual(widths.toSorted((left: number, right: number): number => left - right));
		expect(new Set(widths).size).toBe(widths.length);
	});

	it('declare every name, in order', (): void => {
		expect(Object.keys(breakpoints)).toEqual([...breakpointNames]);
	});

	it.each<[Breakpoint, string]>([
		['compact', '(min-width: 0em)'],
		['medium', '(min-width: 37.5em)'],
		['expanded', '(min-width: 52.5em)'],
		['large', '(min-width: 75em)'],
		['extraLarge', '(min-width: 100em)'],
	])('%s matches from its width up, in em', (breakpoint: Breakpoint, mediaQuery: string): void => {
		expect(breakpointMediaQuery(breakpoint)).toBe(mediaQuery);
	});
});
