// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Tabs } from '#src/navigation/tabs/index.tsx';
import type { TabItem, TabsProps } from '#src/navigation/tabs/index.tsx';

afterEach((): void => {
	cleanup();
});

const items: TabItem[] = [
	{ id: 'summary', label: 'Summary', content: <p>Summary panel</p> },
	{ id: 'revenue', label: 'Revenue', content: <p>Revenue panel</p> },
	{ id: 'archive', label: 'Archive', content: <p>Archive panel</p>, disabled: true },
	{ id: 'costs', label: 'Costs', content: <input aria-label='Budget' /> },
];

const renderTabs = (props: Partial<TabsProps> = {}): void => {
	render(
		<>
			<button type='button'>Before</button>
			<Tabs label='Report sections' items={items} {...props} />
		</>,
	);
};

const selectedTab = (): HTMLElement => screen.getByRole('tab', { selected: true });

describe('Tabs', (): void => {
	it('links a named tablist, its tabs and their panels', async (): Promise<void> => {
		renderTabs();
		const tablist: HTMLElement = screen.getByRole('tablist', { name: 'Report sections' });
		const summary: HTMLElement = screen.getByRole('tab', { name: 'Summary' });
		const panel: HTMLElement = screen.getByRole('tabpanel', { name: 'Summary' });

		expect(tablist.children).toHaveLength(4);
		expect(summary.getAttribute('aria-selected')).toBe('true');
		expect(summary.getAttribute('aria-controls')).toBe(panel.id);
		expect(panel.textContent).toBe('Summary panel');
		expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
		expect(screen.getByRole('tab', { name: 'Archive' }).getAttribute('aria-disabled')).toBe('true');
		await expectNoAxeViolations(document.body);
	});

	it('marks the selected tab with a brand indigo bar', (): void => {
		renderTabs();
		const rules: string = styleRulesOf(selectedTab()).join('');

		expect(rules).toContain(
			'&[aria-selected="true"]::after,&[aria-current="page"]::after{background-color:var(--mi-intent-brand-main);}',
		);

		expect(rules).not.toContain('--mi-intent-official-');
	});

	it('is a single tab stop that leads to the panel', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderTabs();

		await user.tab();
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Summary' }));
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('tabpanel'));
		await user.tab({ shift: true });
		expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Summary' }));
	});

	it('moves and selects with the arrow keys, skipping disabled tabs and wrapping', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onValueChange: Mock<(value: string) => void> = vi.fn();
		renderTabs({ onValueChange });
		await user.click(screen.getByRole('tab', { name: 'Summary' }));

		await user.keyboard('{ArrowRight}');
		expect(selectedTab()).toBe(document.activeElement);
		expect(selectedTab().textContent).toBe('Revenue');
		await user.keyboard('{ArrowRight}');
		expect(selectedTab().textContent).toBe('Costs');
		await user.keyboard('{ArrowRight}');
		expect(selectedTab().textContent).toBe('Summary');
		await user.keyboard('{ArrowLeft}');
		expect(selectedTab().textContent).toBe('Costs');
		await user.keyboard('{Home}');
		expect(selectedTab().textContent).toBe('Summary');
		await user.keyboard('{End}');

		expect(selectedTab().textContent).toBe('Costs');
		expect(screen.getByRole('tabpanel', { name: 'Costs' })).toBeDefined();

		expect(onValueChange.mock.calls).toEqual([
			['revenue'],
			['costs'],
			['summary'],
			['costs'],
			['summary'],
			['costs'],
		]);
	});

	it('waits for Enter or Space with manual activation', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderTabs({ activation: 'manual' });
		await user.click(screen.getByRole('tab', { name: 'Summary' }));

		await user.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Revenue' }));
		expect(selectedTab().textContent).toBe('Summary');
		await user.keyboard('{Enter}');
		expect(selectedTab().textContent).toBe('Revenue');
		await user.keyboard('{ArrowRight}');
		await user.keyboard(' ');
		expect(selectedTab().textContent).toBe('Costs');
	});

	it('follows the reading direction', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<div style={{ direction: 'rtl' }}>
				<Tabs label='Report sections' items={items} style={{ direction: 'rtl' }} />
			</div>,
		);

		await user.click(screen.getByRole('tab', { name: 'Summary' }));
		await user.keyboard('{ArrowLeft}');
		expect(selectedTab().textContent).toBe('Revenue');
	});

	it('does not select a disabled tab', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderTabs();

		await user.click(screen.getByRole('tab', { name: 'Archive' }));
		expect(selectedTab().textContent).toBe('Summary');
	});

	it('can be controlled, falling back to the first enabled tab', (): void => {
		const { rerender } = render(<Tabs label='Report sections' items={items} value='costs' />);

		expect(selectedTab().textContent).toBe('Costs');
		rerender(<Tabs label='Report sections' items={items} value='archive' />);
		expect(selectedTab().textContent).toBe('Summary');
	});

	it('keeps hidden panels mounted on request', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderTabs({ defaultValue: 'costs', keepMounted: true });

		await user.type(screen.getByRole('textbox', { name: 'Budget' }), '1200');
		await user.click(screen.getByRole('tab', { name: 'Summary' }));
		await user.click(screen.getByRole('tab', { name: 'Costs' }));

		expect(screen.getByRole('textbox', { name: 'Budget' })).toHaveProperty('value', '1200');
	});
});
