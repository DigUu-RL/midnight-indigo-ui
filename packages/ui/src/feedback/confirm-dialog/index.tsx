'use client';
// Asks the user to confirm an action, stating its consequence, before it happens.
import { useRef, useState } from 'react';
import type { ReactElement, ReactNode, RefObject } from 'react';

import { Button } from '#src/buttons/button/index.tsx';
import type { SemanticIntent } from '#src/tokens/index.ts';
import { Dialog } from '#src/feedback/dialog/index.tsx';
import type { DialogProps } from '#src/feedback/dialog/index.tsx';
import type { ModalOverlayProps } from '#src/feedback/modal-layer/index.tsx';

/** Texts of the confirmation dialog. Name the action instead of the defaults: `'Delete report'`, `'Keep editing'`. */
export interface ConfirmDialogLabels {
	/** Label of the button that performs the action. */
	confirm: string;
	/** Label of the button that gives up. */
	cancel: string;
}

export const defaultConfirmDialogLabels: Readonly<ConfirmDialogLabels> = Object.freeze({
	confirm: 'Confirm',
	cancel: 'Cancel',
});

export interface ConfirmDialogProps
	extends
		Omit<ModalOverlayProps, 'onClose' | 'initialFocus' | 'closeOnEscape'>,
		Pick<DialogProps, 'size' | 'className' | 'style' | 'id'> {
	/** The question, e.g. `'Delete this report?'`. */
	title: ReactNode;
	/** The consequence, e.g. `'It will be removed for everyone. This cannot be undone.'`. */
	description: ReactNode;
	/** Additional content between the description and the buttons. */
	children?: ReactNode;
	/** Meaning of the action; `'error'` marks a destructive one. Defaults to `'official'`. */
	intent?: SemanticIntent;
	/**
	 * Performs the action. While a returned promise is pending, the confirm button is busy and the dialog cannot be
	 * dismissed; if it rejects, the dialog stays open so the parent can show the error.
	 */
	onConfirm: () => void | Promise<void>;
	/** Called on the cancel button and on Escape. */
	onCancel: () => void;
	/** Overrides some or all of `defaultConfirmDialogLabels`. */
	labels?: Partial<ConfirmDialogLabels>;
}

/**
 * An `alertdialog`: it requires a response and does not close on a click outside. Focus starts on the cancel button
 * when the action is destructive (`intent='error'`), so that Enter alone never destroys anything, and on the confirm
 * button otherwise. Escape cancels.
 */
export const ConfirmDialog = ({
	title,
	description,
	children,
	intent = 'official',
	onConfirm,
	onCancel,
	labels,
	...dialogProps
}: ConfirmDialogProps): ReactElement => {
	const texts: ConfirmDialogLabels = { ...defaultConfirmDialogLabels, ...labels };
	const confirmButton: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);
	const cancelButton: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);
	const [pending, setPending] = useState<boolean>(false);

	const confirm = async (): Promise<void> => {
		setPending(true);

		try {
			await onConfirm();
		} finally {
			setPending(false);
		}
	};

	const cancel = (): void => {
		if (!pending) onCancel();
	};

	return (
		<Dialog
			{...dialogProps}
			role='alertdialog'
			title={title}
			description={description}
			size={dialogProps.size ?? 'small'}
			onClose={cancel}
			initialFocus={intent === 'error' ? cancelButton : confirmButton}
			hideCloseButton
			actions={
				<>
					<Button ref={cancelButton} variant='outline' disabled={pending} onClick={cancel}>
						{texts.cancel}
					</Button>

					<Button
						ref={confirmButton}
						intent={intent}
						variant='solid'
						loading={pending}
						onClick={(): void => {
							// A rejection keeps the dialog open; reporting the error is up to `onConfirm`.
							confirm().catch((): void => undefined);
						}}
					>
						{texts.confirm}
					</Button>
				</>
			}
		>
			{children}
		</Dialog>
	);
};
