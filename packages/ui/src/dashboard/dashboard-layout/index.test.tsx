// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import {
	applyViewportStyles,
	resetViewport,
	resizeViewport,
	setViewportWidth,
} from '#test/viewport.ts';
import { DashboardLayout } from '#src/dashboard/dashboard-layout/index.tsx';
import type {
	DashboardLayoutProps,
	DashboardNavigation,
} from '#src/dashboard/dashboard-layout/index.tsx';
import { Breadcrumbs } from '#src/navigation/breadcrumbs/index.tsx';
import { ComponentLabelsProvider } from '#src/shared/component-labels/index.tsx';

afterEach((): void => {
	cleanup();
	resetViewport();
});

const icon: ReactElement = <svg />;

const navigation: DashboardNavigation = {
	label: 'Main navigation',
	items: [
		{ id: 'overview', label: 'Overview', icon, href: '/', current: true },
		{
			id: 'reports',
			label: 'Reports',
			items: [{ id: 'sales', label: 'Sales', icon, href: '/reports/sales' }],
		},
	],
	footer: <a href='/account'>Account</a>,
};

const renderLayout = (width: number, props: Partial<DashboardLayoutProps> = {}): void => {
	setViewportWidth(width);

	render(
		<DashboardLayout
			navigation={navigation}
			brand={<a href='/'>Acme</a>}
			topbar={<button type='button'>Notifications</button>}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ id: 'home', label: 'Home', href: '/' },
						{ id: 'overview', label: 'Overview' },
					]}
				/>
			}
			{...props}
		>
			<h1>Overview</h1>
			<button type='button'>Export</button>
		</DashboardLayout>,
	);

	applyViewportStyles();
};

describe('DashboardLayout on wide viewports', (): void => {
	it('has a banner, the navigation, the breadcrumbs and the main content', async (): Promise<void> => {
		renderLayout(1280);
		const banner: HTMLElement = screen.getByRole('banner');
		const main: HTMLElement = screen.getByRole('main');

		expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
		expect(within(banner).getByRole('button', { name: 'Notifications' })).toBeDefined();
		expect(within(banner).queryByRole('button', { name: 'Open navigation' })).toBeNull();
		expect(within(banner).queryByRole('link', { name: 'Acme' })).toBeNull();
		expect(within(main).getByRole('navigation', { name: 'Breadcrumb' })).toBeDefined();
		expect(within(main).getByRole('heading', { level: 1, name: 'Overview' })).toBeDefined();
		expect(screen.getAllByRole('link', { name: 'Acme' })).toHaveLength(1);
		await expectNoAxeViolations(document.body);
	});

	it('starts with a skip link that moves the focus to the main content', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderLayout(1280);
		const main: HTMLElement = screen.getByRole('main');

		await user.tab();
		const skipLink: HTMLElement = screen.getByRole('link', { name: 'Skip to main content' });

		expect(document.activeElement).toBe(skipLink);
		expect(skipLink.getAttribute('href')).toBe(`#${main.id}`);
		await user.keyboard('{Enter}');

		expect(document.activeElement).toBe(main);
		await user.tab();
		expect(document.activeElement).toBe(within(main).getByRole('link', { name: 'Home' }));
	});

	it('is navigable by keyboard in the order of the page', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderLayout(1280);
		const order: string[] = [];

		for (let step: number = 0; step < 9; step += 1) {
			await user.tab();

			// Icon buttons are named by `aria-label`; everything else by its text.
			order.push(
				document.activeElement?.getAttribute('aria-label') ??
					document.activeElement?.textContent ??
					'',
			);
		}

		expect(order).toEqual([
			'Skip to main content',
			'Acme',
			'Overview',
			'Sales',
			'Account',
			'Collapse navigation',
			'Notifications',
			'Home',
			'Export',
		]);
	});

	it('hides the top bar from the breakpoint up when it has nothing to show there', (): void => {
		renderLayout(1280, { topbar: undefined });
		expect(screen.queryByRole('banner')).toBeNull();
		resizeViewport(390);
		expect(screen.getByRole('banner')).toBeDefined();
	});

	it('keeps the sidebar in view while the page scrolls', (): void => {
		renderLayout(1280);

		const slot: Element = screen.getByRole('navigation', { name: 'Main navigation' }).parentElement
			?.parentElement as Element;

		const rules: string = styleRulesOf(slot).join('');

		expect(rules).toContain('position:sticky;');
		expect(rules).toContain('height:100dvh;');
	});
});

describe('DashboardLayout sidebar variants', (): void => {
	const sidebarRules = (): string => {
		const sidebar: Element = screen.getByRole('navigation', { name: 'Main navigation' })
			.parentElement as Element;

		return styleRulesOf(sidebar).join('');
	};

	it('collapses to a rail by default, controlled or not', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCollapsedChange: Mock<(collapsed: boolean) => void> = vi.fn();
		renderLayout(1280, { onCollapsedChange });

		await user.click(screen.getByRole('button', { name: 'Collapse navigation' }));

		expect(onCollapsedChange).toHaveBeenCalledWith(true);
		expect(sidebarRules()).toContain('width:4.5rem;');
		expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeDefined();
	});

	it('is always the full column with expanded', (): void => {
		renderLayout(1280, { sidebarVariant: 'expanded', collapsed: true });

		expect(screen.queryByRole('button', { name: /navigation$/ })).toBeNull();
		expect(sidebarRules()).toContain('width:16rem;');
	});

	it('is always a rail with rail, which keeps every name', async (): Promise<void> => {
		renderLayout(1280, { sidebarVariant: 'rail' });
		const sidebar: HTMLElement = screen.getByRole('navigation', { name: 'Main navigation' });

		expect(screen.queryByRole('button', { name: /navigation$/ })).toBeNull();
		expect(sidebarRules()).toContain('width:4.5rem;');
		expect(within(sidebar).getByRole('link', { name: 'Sales' })).toBeDefined();
		await expectNoAxeViolations(document.body);
	});
});

describe('DashboardLayout on narrow viewports', (): void => {
	it('shows the brand and a menu button that opens the navigation in a drawer', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderLayout(390);
		const banner: HTMLElement = screen.getByRole('banner');
		const menuButton: HTMLElement = within(banner).getByRole('button', { name: 'Open navigation' });

		expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull();
		expect(within(banner).getByRole('link', { name: 'Acme' })).toBeDefined();
		await expectNoAxeViolations(document.body);
		await user.click(menuButton);
		const drawer: HTMLElement = screen.getByRole('dialog', { name: 'Main navigation' });

		expect(within(drawer).getByRole('link', { name: 'Overview' })).toBeDefined();
		expect(within(drawer).getByRole('link', { name: 'Account' })).toBeDefined();
		await expectNoAxeViolations(document.body);
		await user.keyboard('{Escape}');

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(menuButton);
	});

	it('closes the drawer once a page is chosen', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onNavigationOpenChange: Mock<(open: boolean) => void> = vi.fn();
		renderLayout(390, { onNavigationOpenChange });

		await user.click(screen.getByRole('button', { name: 'Open navigation' }));
		expect(onNavigationOpenChange).toHaveBeenLastCalledWith(true);

		// jsdom cannot load another document; a router would navigate on the client instead.
		document.addEventListener(
			'click',
			(event: MouseEvent): void => {
				event.preventDefault();
			},
			{ once: true },
		);

		await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Sales' }));

		expect(onNavigationOpenChange).toHaveBeenLastCalledWith(false);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('can have the drawer controlled', (): void => {
		renderLayout(390, { navigationOpen: true, onNavigationOpenChange: (): void => undefined });
		expect(screen.getByRole('dialog', { name: 'Main navigation' })).toBeDefined();
	});

	it('moves the breakpoint with permanentFrom', (): void => {
		renderLayout(1024, { permanentFrom: 'large' });
		expect(screen.getByRole('button', { name: 'Open navigation' })).toBeDefined();
		resizeViewport(1280);
		expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull();
		expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
	});
});

describe('DashboardLayout texts', (): void => {
	it('come from labels, from the navigation and from a provider', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		renderLayout(390, {
			labels: { skipToContent: 'Pular para o conteúdo' },
			navigation: { ...navigation, label: 'Navegação principal', labels: { open: 'Abrir menu' } },
		});

		expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toBeDefined();
		await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
		expect(screen.getByRole('dialog', { name: 'Navegação principal' })).toBeDefined();
		cleanup();
		setViewportWidth(1280);

		render(
			<ComponentLabelsProvider
				labels={{
					dashboardLayout: { skipToContent: 'Ir para o conteúdo' },
					sidebar: { collapse: 'Recolher' },
				}}
			>
				<DashboardLayout navigation={navigation}>Content</DashboardLayout>
			</ComponentLabelsProvider>,
		);

		applyViewportStyles();
		expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Recolher' })).toBeDefined();
	});
});
