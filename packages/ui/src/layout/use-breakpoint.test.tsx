// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { resetViewport, resizeViewport, setViewportWidth } from '#test/viewport.ts';
import { useBreakpoint } from '#src/layout/use-breakpoint.ts';

afterEach((): void => {
	cleanup();
	resetViewport();
});

const ExpandedProbe = (): ReactElement => {
	return <p>{useBreakpoint('expanded') ? 'expanded' : 'narrower'}</p>;
};

describe('useBreakpoint', (): void => {
	it.each<[number, string]>([
		[390, 'narrower'],
		[839, 'narrower'],
		[840, 'expanded'],
		[1600, 'expanded'],
	])('at %i px is %s', (width: number, expected: string): void => {
		setViewportWidth(width);
		render(<ExpandedProbe />);

		expect(screen.getByRole('paragraph').textContent).toBe(expected);
	});

	it('follows the viewport', (): void => {
		setViewportWidth(390);
		render(<ExpandedProbe />);

		resizeViewport(1024);
		expect(screen.getByRole('paragraph').textContent).toBe('expanded');
		resizeViewport(600);
		expect(screen.getByRole('paragraph').textContent).toBe('narrower');
	});
});
