// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { Button } from '@/src/buttons/button/index';
import { Drawer } from '@/src/feedback/drawer/index';
import type { DrawerPlacement, DrawerProps } from '@/src/feedback/drawer/index';
import { Menu } from '@/src/feedback/menu/index';

afterEach((): void => {
	cleanup();
});

const DrawerHarness = (props: Partial<Omit<DrawerProps, 'open' | 'onClose'>>): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button
				onClick={(): void => {
					setOpen(true);
				}}
			>
				Show details
			</Button>

			<Drawer
				title='Order #1042'
				description='Placed today.'
				actions={<Button>Refund</Button>}
				{...props}
				open={open}
				onClose={(): void => {
					setOpen(false);
				}}
			>
				<Menu trigger={<Button>More</Button>} items={[{ id: 'print', label: 'Print' }]} />
			</Drawer>
		</>
	);
};

describe('Drawer', (): void => {
	it('is a modal dialog named by its title, focused on open and restored on close', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DrawerHarness />);
		const trigger: HTMLElement = screen.getByRole('button', { name: 'Show details' });

		await user.click(trigger);
		const drawer: HTMLElement = screen.getByRole('dialog', { name: 'Order #1042' });

		expect(drawer).toHaveProperty('ariaModal', 'true');
		expect(document.activeElement).toBe(drawer);
		await expectNoAxeViolations(document.body);

		await user.click(screen.getByRole('button', { name: 'Close' }));
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('closes only the menu opened inside it on the first Escape', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DrawerHarness />);

		await user.click(screen.getByRole('button', { name: 'Show details' }));
		await user.click(screen.getByRole('button', { name: 'More' }));
		expect(screen.getByRole('menu')).toBeDefined();
		await user.keyboard('{Escape}');

		expect(screen.getByRole('dialog', { name: 'Order #1042' })).toBeDefined();
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('dialog', { name: 'Order #1042' })).toBeNull();
	});

	it.each<[DrawerPlacement, string]>([
		['start', 'border-inline-end:1px solid var(--mi-border-default);'],
		['end', 'border-inline-start:1px solid var(--mi-border-default);'],
		['bottom', 'border-block-start:1px solid var(--mi-border-default);'],
	])(
		'slides from the %s edge on the drawer layer',
		async (placement: DrawerPlacement, edge: string): Promise<void> => {
			const user: UserEvent = userEvent.setup();
			render(<DrawerHarness placement={placement} />);
			await user.click(screen.getByRole('button', { name: 'Show details' }));
			const drawer: HTMLElement = screen.getByRole('dialog');
			const rules: string = styleRulesOf(drawer).join('');

			expect(rules).toContain(edge);
			expect(rules).toContain('animation-duration:var(--mi-motion-duration-slow);');
			expect(drawer.parentElement?.parentElement?.style.zIndex).toBe('var(--mi-layer-drawer)');
		},
	);

	it('mirrors the horizontal slide in right-to-left documents', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DrawerHarness placement='start' />);
		await user.click(screen.getByRole('button', { name: 'Show details' }));

		const rules: string[] = styleRulesOf(screen.getByRole('dialog'));
		const animationName: RegExp = /;animation-name:([\w-]+);/;

		const mirrored: string | undefined = rules.find((rule: string): boolean => {
			return rule.startsWith('[dir="rtl"] &{');
		});

		expect(mirrored?.match(animationName)?.[1]).toBeDefined();
		expect(mirrored?.match(animationName)?.[1]).not.toBe(rules[0]?.match(animationName)?.[1]);
	});
});
