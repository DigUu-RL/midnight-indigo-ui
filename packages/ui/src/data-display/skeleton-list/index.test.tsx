// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SkeletonList } from '#src/data-display/skeleton-list/index.tsx';

afterEach((): void => {
	cleanup();
});

const hiddenPlaceholders = (container: HTMLElement): number => {
	return container.querySelectorAll('[aria-hidden="true"]').length;
};

describe('SkeletonList', (): void => {
	it('draws rows of two lines, with a leading circle on demand', (): void => {
		render(<SkeletonList items={2} withLeading label='Loading the team' />);
		const status: HTMLElement = screen.getByRole('status');

		expect(status.textContent).toBe('Loading the team');
		expect(hiddenPlaceholders(status)).toBe(6);
	});
});
