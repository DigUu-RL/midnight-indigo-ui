// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useRef, useState } from 'react';
import type { ReactElement, RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Button } from '#src/buttons/button/index.tsx';
import { Dialog } from '#src/feedback/dialog/index.tsx';
import type { DialogProps } from '#src/feedback/dialog/index.tsx';
import type { OverlayCloseReason } from '#src/feedback/modal-layer/index.tsx';

afterEach((): void => {
	cleanup();
});

type HarnessProps = Partial<Omit<DialogProps, 'open'>> & {
	onCloseRequest?: (reason: OverlayCloseReason) => void;
	withInitialFocus?: boolean;
	withFinalFocus?: boolean;
};

const DialogHarness = ({
	onCloseRequest,
	withInitialFocus = false,
	withFinalFocus = false,
	...dialogProps
}: HarnessProps): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);
	const nameField: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
	const heading: RefObject<HTMLHeadingElement | null> = useRef<HTMLHeadingElement>(null);

	return (
		<>
			<h1 ref={heading} tabIndex={-1}>
				Profile
			</h1>
			<Button
				onClick={(): void => {
					setOpen(true);
				}}
			>
				Edit profile
			</Button>
			<Dialog
				title='Edit profile'
				description='Changes apply to your public page.'
				actions={<Button intent='official'>Save</Button>}
				{...dialogProps}
				open={open}
				initialFocus={withInitialFocus ? nameField : undefined}
				finalFocus={withFinalFocus ? heading : undefined}
				onClose={(reason: OverlayCloseReason): void => {
					onCloseRequest?.(reason);
					setOpen(false);
				}}
			>
				<input ref={nameField} aria-label='Name' />
			</Dialog>
		</>
	);
};

const openDialog = async (user: UserEvent): Promise<HTMLElement> => {
	await user.click(screen.getByRole('button', { name: 'Edit profile' }));
	return screen.getByRole('dialog');
};

describe('Dialog', (): void => {
	it('is named by its title, described by its description and modal', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DialogHarness />);
		const dialog: HTMLElement = await openDialog(user);

		expect(screen.getByRole('dialog', { name: 'Edit profile' })).toBe(dialog);
		expect(dialog).toHaveProperty('ariaModal', 'true');
		expect(screen.getByRole('heading', { level: 2, name: 'Edit profile' })).toBeDefined();

		expect(
			document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent,
		).toBe('Changes apply to your public page.');

		await expectNoAxeViolations(document.body);
	});

	it('moves focus into the panel and keeps Tab inside', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DialogHarness />);
		const dialog: HTMLElement = await openDialog(user);

		expect(document.activeElement).toBe(dialog);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
		await user.tab();
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }));
		await user.tab();
		expect(dialog.contains(document.activeElement)).toBe(true);
		await user.tab({ shift: true });
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }));
	});

	it('closes on Escape and returns focus to its trigger', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCloseRequest: Mock<(reason: OverlayCloseReason) => void> = vi.fn();
		render(<DialogHarness onCloseRequest={onCloseRequest} />);
		await openDialog(user);
		await user.keyboard('{Escape}');

		expect(onCloseRequest).toHaveBeenCalledWith('escape');
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Edit profile' }));
	});

	it('closes with its close button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCloseRequest: Mock<(reason: OverlayCloseReason) => void> = vi.fn();
		render(<DialogHarness onCloseRequest={onCloseRequest} labels={{ close: 'Fechar' }} />);
		await openDialog(user);
		await user.click(screen.getByRole('button', { name: 'Fechar' }));

		expect(onCloseRequest).toHaveBeenCalledWith('close-button');
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('ignores clicks outside unless asked, and never a drag that ends outside', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCloseRequest: Mock<(reason: OverlayCloseReason) => void> = vi.fn();
		const { unmount } = render(<DialogHarness onCloseRequest={onCloseRequest} />);
		const dialog: HTMLElement = await openDialog(user);
		const scrim: HTMLElement = dialog.parentElement ?? document.body;

		await user.click(scrim);
		expect(onCloseRequest).not.toHaveBeenCalled();
		unmount();

		render(<DialogHarness onCloseRequest={onCloseRequest} closeOnOutsideClick />);
		const dismissible: HTMLElement = await openDialog(user);
		const dismissibleScrim: HTMLElement = dismissible.parentElement ?? document.body;

		await user.pointer([
			{ keys: '[MouseLeft>]', target: dismissible },
			{ keys: '[/MouseLeft]', target: dismissibleScrim },
		]);

		expect(onCloseRequest).not.toHaveBeenCalled();
		await user.click(dismissibleScrim);
		expect(onCloseRequest).toHaveBeenCalledWith('outside');
	});

	it('honors closeOnEscape={false}', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DialogHarness closeOnEscape={false} />);
		await openDialog(user);
		await user.keyboard('{Escape}');

		expect(screen.getByRole('dialog')).toBeDefined();
	});

	it('focuses initialFocus on open and finalFocus on close', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DialogHarness withInitialFocus withFinalFocus />);
		await openDialog(user);

		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }));
		await user.keyboard('{Escape}');
		expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
	});

	it('supports the alertdialog role and a hidden close button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DialogHarness role='alertdialog' hideCloseButton />);
		await user.click(screen.getByRole('button', { name: 'Edit profile' }));

		expect(screen.getByRole('alertdialog', { name: 'Edit profile' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
	});

	it('stacks on the dialog layer, over the scrim token', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DialogHarness size='large' />);
		const dialog: HTMLElement = await openDialog(user);
		const scrim: HTMLElement = dialog.parentElement ?? document.body;

		expect(scrim.parentElement?.style.zIndex).toBe('var(--mi-layer-dialog)');
		expect(styleRulesOf(scrim).join('')).toContain('background-color:var(--mi-backdrop-scrim);');
		expect(styleRulesOf(dialog).join('')).toContain('max-width:48rem;');
		expect(styleRulesOf(dialog).join('')).toContain('background-color:var(--mi-surface-overlay);');
	});
});
