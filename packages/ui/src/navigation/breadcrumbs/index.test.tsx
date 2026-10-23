// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { Breadcrumbs } from '@/src/navigation/breadcrumbs/index';
import type { BreadcrumbItem } from '@/src/navigation/breadcrumbs/index';

afterEach((): void => {
	cleanup();
});

const trail: BreadcrumbItem[] = [
	{ id: 'home', label: 'Home', href: '/' },
	{ id: 'projects', label: 'Projects', href: '/projects' },
	{ id: 'atlas', label: 'Atlas', href: '/projects/atlas' },
	{ id: 'members', label: 'Members', href: '/projects/atlas/members' },
	{ id: 'settings', label: 'Settings' },
];

describe('Breadcrumbs', (): void => {
	it('is a named landmark with an ordered list that ends on the current page', async (): Promise<void> => {
		render(<Breadcrumbs items={trail} />);
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'Breadcrumb' });

		const items: HTMLElement[] = within(within(navigation).getByRole('list')).getAllByRole(
			'listitem',
		);

		const current: HTMLElement = screen.getByText('Settings');

		expect(navigation.querySelector('ol')).not.toBeNull();
		expect(items).toHaveLength(5);
		expect(within(navigation).getAllByRole('link')).toHaveLength(4);
		expect(current.getAttribute('aria-current')).toBe('page');
		expect(current.closest('a')).toBeNull();
		expect(navigation.querySelectorAll('[aria-hidden="true"] svg')).toHaveLength(4);
		expect(items[0]?.querySelector('[aria-hidden="true"]')).toBeNull();
		await expectNoAxeViolations(document.body);
	});

	it('marks a linked last item as the current page', (): void => {
		render(
			<Breadcrumbs
				items={[
					{ id: 'home', label: 'Home', href: '/' },
					{ id: 'reports', label: 'Reports', href: '/reports' },
				]}
			/>,
		);

		expect(screen.getByRole('link', { name: 'Reports' }).getAttribute('aria-current')).toBe('page');
		expect(screen.getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);
	});

	it('collapses the middle levels past maxItems into a button that reveals them', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<Breadcrumbs items={trail} maxItems={3} />);
		const expand: HTMLElement = screen.getByRole('button', { name: 'Show 2 more levels' });

		expect(screen.getAllByRole('listitem')).toHaveLength(4);
		expect(screen.queryByRole('link', { name: 'Projects' })).toBeNull();
		expect(screen.getByRole('link', { name: 'Home' })).toBeDefined();
		expect(screen.getByRole('link', { name: 'Members' })).toBeDefined();
		await expectNoAxeViolations(document.body);
		await user.tab();
		await user.tab();

		expect(document.activeElement).toBe(expand);
		await user.keyboard('{Enter}');

		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getAllByRole('listitem')).toHaveLength(5);
		expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Projects' }));
	});

	it('shows at least the first and the current page', (): void => {
		render(<Breadcrumbs items={trail} maxItems={1} />);

		expect(screen.getAllByRole('listitem')).toHaveLength(3);
		expect(screen.getByRole('button', { name: 'Show 3 more levels' })).toBeDefined();
	});

	it('takes translated labels', (): void => {
		render(
			<Breadcrumbs
				items={trail}
				maxItems={2}
				labels={{
					navigation: 'Trilha',
					expand: (hiddenCount: number): string => `Mostrar mais ${String(hiddenCount)} níveis`,
				}}
			/>,
		);

		expect(screen.getByRole('navigation', { name: 'Trilha' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Mostrar mais 3 níveis' })).toBeDefined();
	});
});
