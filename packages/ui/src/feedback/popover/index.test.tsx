// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useRef } from 'react';
import type { ReactElement, RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, materialRulesOf } from '#test/component-harness.ts';
import { Button } from '#src/buttons/button/index.tsx';
import { Popover } from '#src/feedback/popover/index.tsx';
import type { PopoverProps } from '#src/feedback/popover/index.tsx';

afterEach((): void => {
	cleanup();
});

type HarnessProps = Partial<Omit<PopoverProps, 'initialFocus'>> & { focusField?: boolean };

const FiltersPopover = ({ focusField = false, ...props }: HarnessProps): ReactElement => {
	const field: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

	return (
		<Popover
			title='Filters'
			trigger={<Button>Filters</Button>}
			{...(props as Record<string, never>)}
			initialFocus={focusField ? field : undefined}
		>
			<input ref={field} aria-label='Owner' />
			<Button>Apply</Button>
		</Popover>
	);
};

const waitForClosed = async (): Promise<void> => {
	await waitFor((): void => {
		expect(screen.queryByRole('dialog')).toBeNull();
	});
};

describe('Popover', (): void => {
	it('is a dialog named by its title and controlled by its trigger', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<FiltersPopover />);
		const trigger: HTMLElement = screen.getByRole('button', { name: 'Filters' });

		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		await user.click(trigger);
		const popover: HTMLElement = screen.getByRole('dialog', { name: 'Filters' });

		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-controls')).toBe(popover.id);
		expect(document.activeElement).toBe(popover);
		await expectNoAxeViolations(document.body);
	});

	it('keeps Tab inside, closes on Escape and returns focus to the trigger', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<FiltersPopover />);
		const trigger: HTMLElement = screen.getByRole('button', { name: 'Filters' });

		await user.click(trigger);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Owner' }));
		await user.tab();
		await user.tab();
		expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);

		await user.keyboard('{Escape}');
		await waitForClosed();
		expect(document.activeElement).toBe(trigger);
	});

	it('closes on a click outside unless asked not to', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onOpenChange: Mock<(open: boolean) => void> = vi.fn();
		const { unmount } = render(<FiltersPopover onOpenChange={onOpenChange} />);

		await user.click(screen.getByRole('button', { name: 'Filters' }));
		await user.click(document.querySelector('.MuiBackdrop-root') ?? document.body);
		await waitForClosed();
		expect(onOpenChange).toHaveBeenLastCalledWith(false);
		unmount();

		render(<FiltersPopover closeOnOutsideClick={false} />);
		await user.click(screen.getByRole('button', { name: 'Filters' }));
		await user.click(document.querySelector('.MuiBackdrop-root') ?? document.body);
		expect(screen.getByRole('dialog')).toBeDefined();
	});

	it('focuses initialFocus, accepts a label instead of a title, and can be controlled', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const { unmount } = render(<FiltersPopover focusField />);

		await user.click(screen.getByRole('button', { name: 'Filters' }));
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Owner' }));
		unmount();

		render(
			<Popover label='Quick filters' open trigger={<Button>Filters</Button>}>
				<p>Content</p>
			</Popover>,
		);

		expect(await screen.findByRole('dialog', { name: 'Quick filters' })).toBeDefined();
	});

	it('stacks on the popover layer with the overlay surface', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<FiltersPopover />);
		await user.click(screen.getByRole('button', { name: 'Filters' }));
		const popover: HTMLElement = screen.getByRole('dialog');

		expect(materialRulesOf(popover.closest('.MuiPopover-root') ?? document.body)).toContain(
			'z-index:var(--mi-layer-popover);',
		);

		expect(materialRulesOf(popover)).toContain('background-color:var(--mi-surface-overlay);');
	});
});
