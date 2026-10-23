// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { DashboardPanel } from '@/src/dashboard/dashboard-panel/index';

afterEach(cleanup);

describe('DashboardPanel', (): void => {
	it('is a region named by its level 2 title, with every slot in order', async (): Promise<void> => {
		const { container } = render(
			<DashboardPanel
				title='Revenue by month'
				description='January to June'
				actions={<button type='button'>Export</button>}
				toolbar={<input aria-label='Search orders' />}
				footer={<a href='/reports/revenue'>Full report</a>}
			>
				<p>Chart</p>
			</DashboardPanel>,
		);

		const region: HTMLElement = screen.getByRole('region', { name: 'Revenue by month' });

		expect(region.tagName).toBe('SECTION');

		expect(
			within(region).getByRole('heading', { level: 2, name: 'Revenue by month' }),
		).toBeDefined();

		expect(
			[...region.querySelectorAll('h2, p, button, input, a')].map((element: Element): string => {
				return element.textContent || (element.getAttribute('aria-label') ?? '');
			}),
		).toEqual([
			'Revenue by month',
			'January to June',
			'Export',
			'Search orders',
			'Chart',
			'Full report',
		]);

		await expectNoAxeViolations(container);
	});

	it('takes another heading level and renders only the slots it is given', (): void => {
		const { container } = render(
			<DashboardPanel title='Orders' headingLevel={3}>
				<p>Table</p>
			</DashboardPanel>,
		);

		expect(screen.getByRole('heading', { level: 3, name: 'Orders' })).toBeDefined();
		expect(container.querySelectorAll('section > *')).toHaveLength(2);
	});
});
