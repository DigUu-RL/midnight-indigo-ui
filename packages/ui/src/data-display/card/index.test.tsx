// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Card, CardContent, CardHeader } from '#src/data-display/card/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('Card', (): void => {
	it('renders the header title as a level 3 heading by default', async (): Promise<void> => {
		const { container } = render(
			<Card>
				<CardHeader
					title='Revenue'
					subtitle='Last 30 days'
					action={<button type='button'>Export</button>}
				/>

				<CardContent>R$ 12.400</CardContent>
			</Card>,
		);

		expect(screen.getByRole('heading', { level: 3, name: 'Revenue' })).toBeDefined();
		expect(screen.getByText('Last 30 days')).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('becomes a region named by its title when it is a section', async (): Promise<void> => {
		const { container } = render(
			<Card as='section'>
				<CardHeader title='Active users' headingLevel={2} />
				<CardContent>1.024</CardContent>
			</Card>,
		);

		expect(screen.getByRole('region', { name: 'Active users' }).tagName).toBe('SECTION');
		expect(screen.getByRole('heading', { level: 2 })).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('prefers an explicit aria-label', (): void => {
		render(
			<Card as='article' aria-label='Order 42'>
				<CardContent>Shipped</CardContent>
			</Card>,
		);

		const article: HTMLElement = screen.getByRole('article', { name: 'Order 42' });
		expect(article.hasAttribute('aria-labelledby')).toBe(false);
	});

	it('keeps the same look in both variants (regression)', (): void => {
		render(
			<>
				<Card data-testid='card'>outline</Card>

				<Card data-testid='card' variant='elevated'>
					elevated
				</Card>
			</>,
		);

		expect(screen.getAllByTestId('card').map(styleRulesOf)).toMatchSnapshot();
	});
});
