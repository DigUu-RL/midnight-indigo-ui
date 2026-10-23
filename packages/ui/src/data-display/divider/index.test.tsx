// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations } from '@/test/component-harness';
import { Divider } from '@/src/data-display/divider/index';

afterEach((): void => {
	cleanup();
});

describe('Divider', (): void => {
	it('is a separator, horizontal or vertical, unless decorative', async (): Promise<void> => {
		const { container } = render(
			<div>
				<Divider />
				<Divider orientation='vertical' />
				<Divider decorative />
			</div>,
		);

		const separators: HTMLElement[] = screen.getAllByRole('separator');

		expect(separators).toHaveLength(2);
		expect(separators[1]?.getAttribute('aria-orientation')).toBe('vertical');
		await expectNoAxeViolations(container);
	});

	it('draws the line on the logical side of its orientation', (): void => {
		render(
			<>
				<Divider data-testid='horizontal' />
				<Divider orientation='vertical' data-testid='vertical' />
			</>,
		);

		expect(declarationsOf(screen.getByTestId('horizontal'), '&')).toContain(
			'border-block-start:1px solid var(--mi-border-default);',
		);

		expect(declarationsOf(screen.getByTestId('vertical'), '&')).toContain(
			'border-inline-start:1px solid var(--mi-border-default);',
		);
	});
});
