// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { Grid, GridItem } from '@/src/layout/grid/index';

afterEach((): void => {
	cleanup();
});

describe('Grid', (): void => {
	it('has one column by default', (): void => {
		render(<Grid data-testid='grid' />);
		const declarations: string = declarationsOf(screen.getByTestId('grid'), '&');

		expect(declarations).toContain('display:grid;');
		expect(declarations).toContain('grid-template-columns:repeat(1, minmax(0, 1fr));');
		expect(declarations).toContain('gap:var(--mi-spacing-4);');
	});

	it('adds columns from each breakpoint up', (): void => {
		render(<Grid data-testid='grid' columns={{ compact: 1, medium: 2, large: 4 }} />);

		expect(styleRulesOf(screen.getByTestId('grid'))).toEqual([
			expect.stringContaining('grid-template-columns:repeat(1, minmax(0, 1fr));'),
			'@media (min-width: 37.5em){&{grid-template-columns:repeat(2, minmax(0, 1fr));}}',
			'@media (min-width: 75em){&{grid-template-columns:repeat(4, minmax(0, 1fr));}}',
		]);
	});

	it('fits as many columns of a minimum width as the width allows, never overflowing', (): void => {
		render(<Grid data-testid='grid' minColumnWidth='16rem' />);

		expect(styleRulesOf(screen.getByTestId('grid'))).toEqual([
			expect.stringContaining(
				'grid-template-columns:repeat(auto-fill, minmax(min(16rem, 100%), 1fr));',
			),
		]);
	});

	it('spans items over columns or the whole row', (): void => {
		render(
			<Grid columns={4}>
				<GridItem data-testid='wide' span={{ compact: 'full', expanded: 2 }} />
				<GridItem data-testid='single' />
			</Grid>,
		);

		expect(styleRulesOf(screen.getByTestId('wide'))).toEqual([
			expect.stringContaining('grid-column:1/-1;'),
			expect.stringMatching(
				/^@media \(min-width: 52\.5em\)\{&\{.*grid-column:span 2\/span 2;\}\}$/,
			),
		]);

		expect(declarationsOf(screen.getByTestId('single'), '&')).toContain(
			'grid-column:span 1/span 1;',
		);
	});

	it('can be a list of items', async (): Promise<void> => {
		render(
			<Grid as='ul' aria-label='Projects' columns={{ compact: 1, medium: 3 }}>
				<GridItem as='li'>Atlas</GridItem>
				<GridItem as='li'>Borealis</GridItem>
			</Grid>,
		);

		expect(screen.getByRole('list', { name: 'Projects' })).toBeDefined();
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
		await expectNoAxeViolations(document.body);
	});
});
