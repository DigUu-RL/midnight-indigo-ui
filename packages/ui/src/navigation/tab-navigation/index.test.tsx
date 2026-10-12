// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations } from '#test/component-harness.ts';
import { TabNavigation } from '#src/navigation/tab-navigation/index.tsx';

afterEach((): void => {
	cleanup();
});

const renderNavigation = (): void => {
	render(
		<TabNavigation
			label='Project sections'
			items={[
				{ id: 'overview', label: 'Overview', href: '/atlas' },
				{ id: 'members', label: 'Members', href: '/atlas/members', current: true },
				{ id: 'settings', label: 'Settings', href: '/atlas/settings' },
			]}
		/>,
	);
};

describe('TabNavigation', (): void => {
	it('is a named navigation landmark with a list of links, not a tablist', async (): Promise<void> => {
		renderNavigation();
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'Project sections' });

		expect(within(navigation).getAllByRole('listitem')).toHaveLength(3);
		expect(within(navigation).getAllByRole('link')).toHaveLength(3);
		expect(screen.queryByRole('tablist')).toBeNull();
		expect(screen.queryByRole('tab')).toBeNull();
		expect(screen.getByRole('link', { name: 'Members' }).getAttribute('aria-current')).toBe('page');
		expect(screen.getByRole('link', { name: 'Overview' }).hasAttribute('aria-current')).toBe(false);
		await expectNoAxeViolations(document.body);
	});

	it('puts every link in the tab order', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderNavigation();

		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Overview' }));
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Members' }));
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Settings' }));
	});

	it('looks like the tabs and scrolls sideways instead of wrapping', (): void => {
		renderNavigation();
		const link: HTMLElement = screen.getByRole('link', { name: 'Members' });
		const row: Element = screen.getByRole('list');

		expect(declarationsOf(link, '&[aria-selected="true"],&[aria-current="page"]')).toContain(
			'color:var(--mi-text-primary);',
		);

		expect(declarationsOf(row, '&')).toContain('overflow-x:auto;');
		expect(declarationsOf(link, '&')).toContain('white-space:nowrap;');
	});
});
