// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { ContextMenu } from '@/src/feedback/context-menu/index';
import type { ContextMenuProps } from '@/src/feedback/context-menu/index';

afterEach((): void => {
	cleanup();
});

const renderContextMenu = (props: Partial<ContextMenuProps> = {}): HTMLElement => {
	render(
		<ContextMenu
			label='Actions for report.pdf'
			items={[
				{ id: 'open', label: 'Open' },
				{ id: 'delete', label: 'Delete', destructive: true },
			]}
			{...props}
		>
			<div tabIndex={0}>report.pdf</div>
		</ContextMenu>,
	);

	return screen.getByText('report.pdf');
};

describe('ContextMenu', (): void => {
	it('opens at the pointer on a right click, named by its label', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const target: HTMLElement = renderContextMenu();

		await user.pointer({ keys: '[MouseRight]', target });
		const menu: HTMLElement = screen.getByRole('menu', { name: 'Actions for report.pdf' });

		expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Open' }));
		expect(menu).toBeDefined();
		await expectNoAxeViolations(document.body);
	});

	it('opens with Shift+F10 and the context menu key, and returns focus to the element', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const target: HTMLElement = renderContextMenu();

		await user.tab();
		await user.keyboard('{Shift>}{F10}{/Shift}');
		expect(screen.getByRole('menu')).toBeDefined();
		await user.keyboard('{Escape}');

		await waitFor((): void => {
			expect(screen.queryByRole('menu')).toBeNull();
		});

		expect(document.activeElement).toBe(target);
		fireEvent.keyDown(target, { key: 'ContextMenu' });
		expect(screen.getByRole('menu')).toBeDefined();
	});

	it('leaves the browser menu alone when disabled or prevented by the child', (): void => {
		const target: HTMLElement = renderContextMenu({ disabled: true });
		const event: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

		target.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('keeps the handlers of its child', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onContextMenu: Mock<() => void> = vi.fn();

		render(
			<ContextMenu label='Actions' items={[{ id: 'open', label: 'Open' }]}>
				<button type='button' onContextMenu={onContextMenu}>
					File
				</button>
			</ContextMenu>,
		);

		await user.pointer({
			keys: '[MouseRight]',
			target: screen.getByRole('button', { name: 'File' }),
		});

		expect(onContextMenu).toHaveBeenCalledOnce();
		expect(screen.getByRole('menu')).toBeDefined();
	});
});
