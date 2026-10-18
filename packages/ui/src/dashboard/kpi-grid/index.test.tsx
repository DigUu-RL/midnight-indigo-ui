// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { KpiGrid } from '#src/dashboard/kpi-grid/index.tsx';
import type { KpiItem } from '#src/dashboard/kpi-grid/index.tsx';

afterEach(cleanup);

const items: KpiItem[] = [
	{
		id: 'revenue',
		label: 'Revenue',
		value: 'R$ 48.210',
		change: { value: '12%', trend: 'up' },
		description: 'vs. last month',
	},
	{ id: 'orders', label: 'Orders', value: '1.284' },
	{ id: 'refunds', label: 'Refunds', value: '37', change: { value: '4%', trend: 'down' } },
];

describe('KpiGrid', (): void => {
	it('is a named list with a named group per key figure', async (): Promise<void> => {
		const { container } = render(<KpiGrid label='Key figures' items={items} />);
		const list: HTMLElement = screen.getByRole('list', { name: 'Key figures' });

		expect(within(list).getAllByRole('listitem')).toHaveLength(3);
		expect(within(list).getByRole('group', { name: 'Revenue' }).textContent).toContain('R$ 48.210');
		expect(within(list).getByRole('group', { name: 'Refunds' }).textContent).toContain('Down 4%');
		await expectNoAxeViolations(container);
	});

	it('fits as many cards per row as the width allows', (): void => {
		render(<KpiGrid label='Key figures' items={items} minColumnWidth='16rem' />);

		expect(styleRulesOf(screen.getByRole('list')).join('')).toContain(
			'grid-template-columns:repeat(auto-fill, minmax(min(16rem, 100%), 1fr));',
		);
	});

	it('spaces the cards by the card grid gap unless given a gap', (): void => {
		const { rerender } = render(<KpiGrid label='Key figures' items={items} />);

		// The last declaration wins.
		const effectiveGap = (): string | undefined => {
			return styleRulesOf(screen.getByRole('list'))
				.join('')
				.match(/(?<![\w-])gap:[^;]+/g)
				?.at(-1);
		};

		expect(effectiveGap()).toBe('gap:var(--mi-card-grid-gap)');
		rerender(<KpiGrid label='Key figures' items={items} gap='8' />);
		expect(effectiveGap()).toBe('gap:var(--mi-spacing-8)');
	});

	it('shows every figure as loading', (): void => {
		render(<KpiGrid label='Key figures' items={items} loading />);

		const groups: HTMLElement[] = within(screen.getByRole('list')).getAllByRole('group');

		expect(
			groups.map((group: HTMLElement): string | null => group.getAttribute('aria-busy')),
		).toEqual(['true', 'true', 'true']);

		expect(screen.queryByText('R$ 48.210')).toBeNull();
	});
});
