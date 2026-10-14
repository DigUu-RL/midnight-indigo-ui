// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
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
import { Sidebar, SidebarMenuButton } from '#src/navigation/sidebar/index.tsx';
import type { SidebarEntry, SidebarProps } from '#src/navigation/sidebar/index.tsx';

afterEach((): void => {
	cleanup();
	resetViewport();
});

const icon: ReactElement = <svg />;

const createItems = (onCreate: () => void = (): void => undefined): SidebarEntry[] => {
	return [
		{ id: 'home', label: 'Home', icon, href: '/', current: true },
		{
			id: 'reports',
			label: 'Reports',
			items: [
				{ id: 'sales', label: 'Sales', icon, href: '/reports/sales' },
				{ id: 'costs', label: 'Costs', icon, href: '/reports/costs' },
			],
		},
		{ id: 'new-report', label: 'New report', icon, onSelect: onCreate },
	];
};

type HarnessProps = Partial<Omit<SidebarProps, 'mobileOpen' | 'onMobileOpenChange'>> & {
	onMobileOpenChange?: (open: boolean) => void;
};

const SidebarHarness = ({ onMobileOpenChange, ...props }: HarnessProps): ReactElement => {
	const [mobileOpen, setMobileOpen] = useState<boolean>(false);

	const changeMobileOpen = (open: boolean): void => {
		setMobileOpen(open);
		onMobileOpenChange?.(open);
	};

	return (
		<>
			<header>
				<SidebarMenuButton open={mobileOpen} onOpenChange={changeMobileOpen} />
			</header>

			<Sidebar
				label='Main navigation'
				items={createItems()}
				{...props}
				mobileOpen={mobileOpen}
				onMobileOpenChange={changeMobileOpen}
			/>

			<main>Content</main>
		</>
	);
};

const renderAt = (width: number, element: ReactElement): void => {
	setViewportWidth(width);
	render(element);
	applyViewportStyles();
};

describe('Sidebar on wide viewports', (): void => {
	it('is a named navigation landmark with links, groups and actions', async (): Promise<void> => {
		renderAt(1024, <SidebarHarness />);
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'Main navigation' });
		const reports: HTMLElement = within(navigation).getByRole('list', { name: 'Reports' });

		expect(
			within(navigation).getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
		).toBe('page');

		expect(
			within(navigation).getByRole('link', { name: 'Sales' }).hasAttribute('aria-current'),
		).toBe(false);

		expect(within(reports).getAllByRole('link')).toHaveLength(2);
		expect(within(navigation).getByRole('button', { name: 'New report' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull();
		await expectNoAxeViolations(document.body);
	});

	it('collapses to a rail that keeps every name and stays in the tab order', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCollapsedChange: Mock<(collapsed: boolean) => void> = vi.fn();
		renderAt(1024, <SidebarHarness onCollapsedChange={onCollapsedChange} />);
		const toggle: HTMLElement = screen.getByRole('button', { name: 'Collapse navigation' });
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'Main navigation' });

		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(toggle.getAttribute('aria-controls')).toBe(navigation.id);
		await user.click(toggle);

		expect(onCollapsedChange).toHaveBeenCalledWith(true);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(toggle.getAttribute('aria-label')).toBe('Expand navigation');

		for (const name of ['Home', 'Sales', 'Costs']) {
			expect(within(navigation).getByRole('link', { name })).toBeDefined();
		}

		expect(within(navigation).getByRole('list', { name: 'Reports' })).toBeDefined();
		expect(styleRulesOf(navigation.parentElement as Element).join('')).toContain('width:4.5rem;');
		await user.click(document.body);
		await user.tab();

		expect(document.activeElement).toBe(within(navigation).getByRole('link', { name: 'Home' }));
		await user.tab();
		expect(document.activeElement).toBe(within(navigation).getByRole('link', { name: 'Sales' }));
		await expectNoAxeViolations(document.body);
	});

	it('repeats the names of the rail in tooltips, only while collapsed', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderAt(1024, <SidebarHarness defaultCollapsed />);
		const home: HTMLElement = screen.getByRole('link', { name: 'Home' });

		await user.click(document.body);
		await user.tab();

		expect(document.activeElement).toBe(home);
		expect((await screen.findByRole('tooltip')).textContent).toBe('Home');
		expect(home.hasAttribute('aria-describedby')).toBe(false);
		await user.click(screen.getByRole('button', { name: 'Expand navigation' }));
		await user.click(document.body);

		await waitFor((): void => {
			expect(screen.queryByRole('tooltip')).toBeNull();
		});

		await user.tab();
		expect(document.activeElement).toBe(home);

		await new Promise<void>((resolve: () => void): void => {
			setTimeout(resolve, 400);
		});

		expect(screen.queryByRole('tooltip')).toBeNull();
	});

	it('can be controlled', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCollapsedChange: Mock<(collapsed: boolean) => void> = vi.fn();
		renderAt(1024, <SidebarHarness collapsed onCollapsedChange={onCollapsedChange} />);
		const toggle: HTMLElement = screen.getByRole('button', { name: 'Expand navigation' });

		await user.click(toggle);

		expect(onCollapsedChange).toHaveBeenCalledWith(false);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
	});

	it('keeps its form without the collapse button when it is not collapsible', (): void => {
		renderAt(1024, <SidebarHarness collapsed collapsible={false} />);
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'Main navigation' });

		expect(screen.queryByRole('button', { name: 'Expand navigation' })).toBeNull();
		expect(within(navigation).getByRole('link', { name: 'Home' })).toBeDefined();
		expect(styleRulesOf(navigation.parentElement as Element).join('')).toContain('width:4.5rem;');
	});

	it('runs the action of an item', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCreate: Mock<() => void> = vi.fn();
		renderAt(1024, <SidebarHarness items={createItems(onCreate)} />);

		await user.click(screen.getByRole('button', { name: 'New report' }));
		expect(onCreate).toHaveBeenCalledOnce();
	});
});

describe('Sidebar on narrow viewports', (): void => {
	it('is replaced by a menu button that opens the same items in a drawer', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderAt(390, <SidebarHarness />);
		const menuButton: HTMLElement = screen.getByRole('button', { name: 'Open navigation' });

		expect(screen.queryByRole('navigation')).toBeNull();
		expect(menuButton.getAttribute('aria-haspopup')).toBe('dialog');
		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
		await user.click(menuButton);
		const drawer: HTMLElement = screen.getByRole('dialog', { name: 'Main navigation' });

		const navigation: HTMLElement = within(drawer).getByRole('navigation', {
			name: 'Main navigation',
		});

		expect(
			within(navigation).getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
		).toBe('page');

		expect(within(navigation).getAllByRole('link')).toHaveLength(3);
		expect(within(drawer).queryByRole('button', { name: 'Collapse navigation' })).toBeNull();
		await expectNoAxeViolations(document.body);
		await user.keyboard('{Escape}');

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(menuButton);
		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes the drawer once an item is chosen and returns focus to the menu button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCreate: Mock<() => void> = vi.fn();
		renderAt(390, <SidebarHarness items={createItems(onCreate)} />);
		const menuButton: HTMLElement = screen.getByRole('button', { name: 'Open navigation' });

		await user.click(menuButton);
		await user.click(screen.getByRole('button', { name: 'New report' }));

		expect(onCreate).toHaveBeenCalledOnce();
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(menuButton);
	});

	it('closes the drawer when the viewport grows past the breakpoint', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onMobileOpenChange: Mock<(open: boolean) => void> = vi.fn();
		renderAt(390, <SidebarHarness onMobileOpenChange={onMobileOpenChange} />);

		await user.click(screen.getByRole('button', { name: 'Open navigation' }));
		resizeViewport(1024);

		expect(onMobileOpenChange).toHaveBeenLastCalledWith(false);
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull();
	});

	it('moves the breakpoint with permanentFrom', (): void => {
		renderAt(
			1024,
			<>
				<SidebarMenuButton
					open={false}
					onOpenChange={(): void => undefined}
					permanentFrom='large'
				/>

				<Sidebar
					label='Main navigation'
					items={createItems()}
					mobileOpen={false}
					onMobileOpenChange={(): void => undefined}
					permanentFrom='large'
				/>
			</>,
		);

		expect(screen.queryByRole('navigation')).toBeNull();
		expect(screen.getByRole('button', { name: 'Open navigation' })).toBeDefined();
		resizeViewport(1280);
		expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
	});
});

describe('Sidebar labels', (): void => {
	it('are translatable', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const labels: SidebarProps['labels'] = {
			collapse: 'Recolher navegação',
			expand: 'Expandir navegação',
			close: 'Fechar navegação',
		};

		renderAt(1024, <SidebarHarness label='Navegação principal' labels={labels} />);
		await user.click(screen.getByRole('button', { name: 'Recolher navegação' }));

		expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Expandir navegação' })).toBeDefined();
		cleanup();
		renderAt(390, <SidebarHarness labels={labels} />);
		await user.click(screen.getByRole('button', { name: 'Open navigation' }));
		expect(screen.getByRole('button', { name: 'Fechar navegação' })).toBeDefined();
	});
});
