// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, materialRulesOf } from '#test/component-harness.ts';
import { Button } from '#src/buttons/button/index.tsx';
import { Dialog } from '#src/feedback/dialog/index.tsx';
import { Menu } from '#src/feedback/menu/index.tsx';
import type { MenuEntry } from '#src/feedback/menu-surface/index.tsx';

afterEach((): void => {
	cleanup();
});

const createItems = (onSelect: () => void = (): void => undefined): MenuEntry[] => {
	return [
		{ id: 'edit', label: 'Edit', onSelect },
		{ id: 'duplicate', label: 'Duplicate', shortcut: 'Control+D' },
		{ id: 'archive', label: 'Archive', disabled: true },
		{ id: 'separator', separator: true },
		{ id: 'delete', label: 'Delete', destructive: true },
	];
};

const renderMenu = (items: MenuEntry[] = createItems()): HTMLElement => {
	render(<Menu trigger={<Button>Actions</Button>} items={items} />);
	return screen.getByRole('button', { name: 'Actions' });
};

const waitForClosed = async (): Promise<void> => {
	await waitFor((): void => {
		expect(screen.queryByRole('menu')).toBeNull();
	});
};

describe('Menu', (): void => {
	it('marks its trigger and is named by it', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const trigger: HTMLElement = renderMenu();

		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		await user.click(trigger);
		const menu: HTMLElement = screen.getByRole('menu', { name: 'Actions' });

		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
		expect(screen.getAllByRole('menuitem')).toHaveLength(4);
		expect(screen.getByRole('separator')).toBeDefined();

		expect(
			screen.getByRole('menuitem', { name: 'Duplicate' }).getAttribute('aria-keyshortcuts'),
		).toBe('Control+D');

		await expectNoAxeViolations(document.body);
	});

	it('opens on the first item with Enter and Down, on the last with Up', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderMenu();

		await user.tab();
		await user.keyboard('{Enter}');
		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
		await user.keyboard('{Escape}');
		await waitForClosed();

		await user.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
		await user.keyboard('{Escape}');
		await waitForClosed();

		await user.keyboard('{ArrowUp}');

		await waitFor((): void => {
			expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
		});
	});

	it('moves with the arrow keys, skips disabled items and closes with Escape', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const trigger: HTMLElement = renderMenu();

		await user.click(trigger);
		await user.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Duplicate' }));
		await user.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
		await user.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
		await user.keyboard('{End}');
		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));

		await user.keyboard('{Escape}');
		await waitForClosed();
		expect(document.activeElement).toBe(trigger);
	});

	it('selects after closing, with focus back on the trigger', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onSelect: Mock<() => void> = vi.fn();
		const trigger: HTMLElement = renderMenu(createItems(onSelect));

		await user.click(trigger);
		await user.keyboard('{Enter}');
		await waitForClosed();

		await waitFor((): void => {
			expect(onSelect).toHaveBeenCalledOnce();
		});

		expect(document.activeElement).toBe(trigger);
	});

	it('lets a selected item open a dialog that returns focus to the trigger', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const Page = (): ReactElement => {
			const [open, setOpen] = useState<boolean>(false);

			return (
				<>
					<Menu
						trigger={<Button>Row actions</Button>}
						items={[
							{
								id: 'rename',
								label: 'Rename',
								onSelect: (): void => {
									setOpen(true);
								},
							},
						]}
					/>
					<Dialog
						open={open}
						title='Rename'
						onClose={(): void => {
							setOpen(false);
						}}
					/>
				</>
			);
		};

		render(<Page />);
		const trigger: HTMLElement = screen.getByRole('button', { name: 'Row actions' });
		await user.click(trigger);
		await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
		const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Rename' });

		expect(document.activeElement).toBe(dialog);
		await user.keyboard('{Escape}');
		expect(document.activeElement).toBe(trigger);
	});

	it('keeps the trigger handlers and id, and stacks on the popover layer', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onClick: Mock<() => void> = vi.fn();

		render(
			<Menu
				trigger={
					<Button id='more' onClick={onClick}>
						More
					</Button>
				}
				items={createItems()}
			/>,
		);

		await user.click(screen.getByRole('button', { name: 'More' }));
		const menu: HTMLElement = screen.getByRole('menu');
		const root: Element | null = menu.closest('.MuiPopover-root');

		expect(onClick).toHaveBeenCalledOnce();
		expect(menu.getAttribute('aria-labelledby')).toBe('more');
		expect(materialRulesOf(root ?? document.body)).toContain('z-index:var(--mi-layer-popover);');

		expect(materialRulesOf(screen.getByRole('menuitem', { name: 'Delete' }))).toContain(
			'color:var(--mi-intent-error-text);',
		);
	});
});
