// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { Button } from '@/src/buttons/button/index';
import { ConfirmDialog } from '@/src/feedback/confirm-dialog/index';
import type { ConfirmDialogProps } from '@/src/feedback/confirm-dialog/index';

afterEach((): void => {
	cleanup();
});

type HarnessProps = Partial<Pick<ConfirmDialogProps, 'intent' | 'onConfirm'>> & {
	onCancelled?: () => void;
};

const DeleteReport = ({ intent = 'error', onConfirm, onCancelled }: HarnessProps): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button
				onClick={(): void => {
					setOpen(true);
				}}
			>
				Delete report
			</Button>

			<ConfirmDialog
				open={open}
				intent={intent}
				title='Delete this report?'
				description='It will be removed for everyone. This cannot be undone.'
				labels={{ confirm: 'Delete', cancel: 'Keep report' }}
				onConfirm={async (): Promise<void> => {
					await onConfirm?.();
					setOpen(false);
				}}
				onCancel={(): void => {
					onCancelled?.();
					setOpen(false);
				}}
			/>
		</>
	);
};

describe('ConfirmDialog', (): void => {
	it('is an alertdialog named by the question and described by the consequence', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<DeleteReport />);
		await user.click(screen.getByRole('button', { name: 'Delete report' }));
		const dialog: HTMLElement = screen.getByRole('alertdialog', { name: 'Delete this report?' });

		expect(
			document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent,
		).toBe('It will be removed for everyone. This cannot be undone.');

		expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
		await expectNoAxeViolations(document.body);
	});

	it('starts on the cancel button of a destructive action, on confirm otherwise', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const { unmount } = render(<DeleteReport />);

		await user.click(screen.getByRole('button', { name: 'Delete report' }));
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep report' }));
		unmount();

		render(<DeleteReport intent='official' />);
		await user.click(screen.getByRole('button', { name: 'Delete report' }));
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete' }));
	});

	it('cancels on Escape and returns focus to the trigger', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCancelled: Mock<() => void> = vi.fn();
		render(<DeleteReport onCancelled={onCancelled} />);

		await user.click(screen.getByRole('button', { name: 'Delete report' }));
		await user.keyboard('{Escape}');

		expect(onCancelled).toHaveBeenCalledOnce();
		expect(screen.queryByRole('alertdialog')).toBeNull();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete report' }));
	});

	it('stays busy and undismissable while the action runs', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCancelled: Mock<() => void> = vi.fn();
		let finish: () => void = (): void => undefined;

		const onConfirm = (): Promise<void> => {
			return new Promise<void>((resolve: () => void): void => {
				finish = resolve;
			});
		};

		render(<DeleteReport onConfirm={onConfirm} onCancelled={onCancelled} />);
		await user.click(screen.getByRole('button', { name: 'Delete report' }));
		await user.click(screen.getByRole('button', { name: 'Delete' }));

		expect(screen.getByRole('button', { name: 'Delete' }).getAttribute('aria-busy')).toBe('true');
		expect(screen.getByRole('button', { name: 'Keep report' })).toHaveProperty('disabled', true);
		await user.keyboard('{Escape}');
		expect(onCancelled).not.toHaveBeenCalled();

		await act(async (): Promise<void> => {
			finish();
			await Promise.resolve();
		});

		expect(screen.queryByRole('alertdialog')).toBeNull();
	});

	it('stays open when the action fails', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const onConfirm = (): Promise<void> => {
			return Promise.reject(new Error('Network error'));
		};

		render(<DeleteReport onConfirm={onConfirm} />);
		await user.click(screen.getByRole('button', { name: 'Delete report' }));
		await user.click(screen.getByRole('button', { name: 'Delete' }));

		expect(screen.getByRole('alertdialog')).toBeDefined();
		expect(screen.getByRole('button', { name: 'Delete' }).hasAttribute('aria-busy')).toBe(false);
	});
});
