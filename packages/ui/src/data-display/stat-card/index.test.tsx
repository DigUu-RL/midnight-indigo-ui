// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations } from '#test/component-harness.ts';
import { StatCard } from '#src/data-display/stat-card/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('StatCard', (): void => {
	it('is a group named by its label, whose change is told in text and not only by color', async (): Promise<void> => {
		const { container } = render(
			<StatCard
				label='Revenue'
				value='R$ 12.400'
				change={{ value: '12%', trend: 'up' }}
				description='vs. last month'
			/>,
		);

		const group: HTMLElement = screen.getByRole('group', { name: 'Revenue' });

		expect(group.textContent).toContain('R$ 12.400');
		expect(group.textContent).toContain('Up 12%');
		expect(group.textContent).toContain('vs. last month');

		expect(declarationsOf(screen.getByText('12%'), '&')).toContain(
			'color:var(--mi-intent-success-text);',
		);

		await expectNoAxeViolations(container);
	});

	it('colors the change by its sentiment, which may differ from the trend', (): void => {
		render(
			<StatCard
				label='Costs'
				value='R$ 3.100'
				change={{ value: '8%', trend: 'up', sentiment: 'negative' }}
			/>,
		);

		expect(declarationsOf(screen.getByText('8%'), '&')).toContain(
			'color:var(--mi-intent-error-text);',
		);
	});

	it('shows a placeholder while loading, marked busy and announced by text', (): void => {
		render(
			<StatCard
				label='Revenue'
				value='R$ 12.400'
				change={{ value: '12%', trend: 'down' }}
				loading
			/>,
		);

		const group: HTMLElement = screen.getByRole('group', { name: 'Revenue' });

		expect(group.getAttribute('aria-busy')).toBe('true');
		expect(group.textContent).toContain('Loading');
		expect(group.textContent).not.toContain('R$ 12.400');
		expect(group.textContent).not.toContain('12%');
	});

	it('takes the trend texts from labels, for translation', (): void => {
		render(
			<StatCard
				label='Receita'
				value='R$ 12.400'
				change={{ value: '0%', trend: 'flat' }}
				labels={{ flat: 'Sem variação' }}
			/>,
		);

		expect(screen.getByRole('group', { name: 'Receita' }).textContent).toContain('Sem variação 0%');
	});
});
