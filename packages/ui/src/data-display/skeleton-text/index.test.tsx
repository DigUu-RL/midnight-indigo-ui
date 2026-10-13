// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { SkeletonText } from '#src/data-display/skeleton-text/index.tsx';

afterEach((): void => {
	cleanup();
});

const hiddenPlaceholders = (container: HTMLElement): number => {
	return container.querySelectorAll('[aria-hidden="true"]').length;
};

describe('SkeletonText', (): void => {
	it('is a status that announces its label once, with hidden lines', async (): Promise<void> => {
		const { container } = render(<SkeletonText lines={4} />);
		const status: HTMLElement = screen.getByRole('status');

		expect(status.textContent).toBe('Loading');
		expect(hiddenPlaceholders(status)).toBe(4);
		await expectNoAxeViolations(container);
	});

	it('takes a translated label', (): void => {
		render(<SkeletonText label='Carregando o relatório' />);

		expect(screen.getByRole('status').textContent).toBe('Carregando o relatório');
	});
});
