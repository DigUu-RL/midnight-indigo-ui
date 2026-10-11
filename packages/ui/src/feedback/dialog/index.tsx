'use client';
// Modal dialog: a task or a decision that interrupts the page until it is completed or dismissed.
import { keyframes, styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode, RefCallback } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import {
	ModalLayer,
	OverlaySections,
	useModalPanelReference,
} from '#src/feedback/modal-layer/index.tsx';
import type { ModalOverlayProps } from '#src/feedback/modal-layer/index.tsx';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	border,
	elevation,
	motion,
}: typeof themeVariables = themeVariables;

type Keyframes = ReturnType<typeof keyframes>;

export type DialogSize = 'small' | 'medium' | 'large';

/** Texts of the dialog. Translate them with the rest of the interface. */
export interface DialogLabels {
	/** Name of the close button in the header. */
	close: string;
}

export const defaultDialogLabels: Readonly<DialogLabels> = Object.freeze({ close: 'Close' });

export interface DialogProps
	extends ModalOverlayProps, Omit<ComponentPropsWithRef<'div'>, 'title' | 'role' | 'children'> {
	/** Visible title and accessible name of the dialog (a level 2 heading). */
	title: ReactNode;
	/** Text under the title, read with the name when the dialog opens (`aria-describedby`). */
	description?: ReactNode;
	/** Content of the dialog. */
	children?: ReactNode;
	/** Buttons at the end of the dialog, the main action last. */
	actions?: ReactNode;
	/** Maximum width: 24, 32 or 48 rem. Defaults to `'medium'`. */
	size?: DialogSize;
	/**
	 * Clicking outside the panel asks to close. Defaults to `false`, since a dialog often holds a form whose input would
	 * be lost; enable it for dialogs that only show information.
	 */
	closeOnOutsideClick?: boolean;
	/** Hides the close button of the header; Escape and the actions still close. */
	hideCloseButton?: boolean;
	/** `'alertdialog'` for an urgent message that requires a response. Defaults to `'dialog'`. */
	role?: 'dialog' | 'alertdialog';
	/** Overrides some or all of `defaultDialogLabels`. */
	labels?: Partial<DialogLabels>;
}

const maximumWidths: Record<DialogSize, string> = {
	small: '24rem',
	medium: '32rem',
	large: '48rem',
};

const enter: Keyframes = keyframes({ from: { opacity: 0, transform: 'scale(0.96)' } });

const centered: CSSObject = {
	alignItems: 'center',
	justifyContent: 'center',
	padding: spacing[4],
};

const Panel = styled('div', { shouldForwardProp: forwardAllBut('dialogSize') })<{
	dialogSize: DialogSize;
}>(({ dialogSize }: { dialogSize: DialogSize }): CSSObject => {
	return {
		display: 'flex',
		flexDirection: 'column',
		gap: spacing[4],
		boxSizing: 'border-box',
		width: '100%',
		maxWidth: maximumWidths[dialogSize],
		maxHeight: '100%',
		// The panel scrolls as a whole and is focusable, so a long dialog can be read with the keyboard.
		overflowY: 'auto',
		padding: spacing[6],
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: border.default,
		borderRadius: radius.extraLarge,
		backgroundColor: surface.overlay,
		boxShadow: elevation.high,
		color: text.primary,
		...typography.body,
		outline: 'none',
		animationName: enter,
		animationDuration: motion.duration.moderate,
		animationTimingFunction: motion.easing.enter,
	};
});

/**
 * Follows the dialog (modal) pattern of the WAI-ARIA Authoring Practices: named by its title and described by its
 * description, focus moves into it on open (the panel, or `initialFocus`), Tab and Shift+Tab stay inside, Escape
 * closes and focus returns to the element that opened it (or `finalFocus`). The page behind is inert and does not
 * scroll. Closing is always the parent's decision: every request comes through `onClose` with its reason.
 */
export const Dialog = ({
	open,
	onClose,
	closeOnEscape,
	initialFocus,
	finalFocus,
	container,
	title,
	description,
	children,
	actions,
	size = 'medium',
	closeOnOutsideClick = false,
	hideCloseButton = false,
	role = 'dialog',
	labels,
	ref,
	...attributes
}: DialogProps): ReactElement => {
	const texts: DialogLabels = { ...defaultDialogLabels, ...labels };
	const titleId: string = useId();
	const descriptionId: string = useId();
	const panelReference: RefCallback<HTMLDivElement> = useModalPanelReference(initialFocus, ref);

	return (
		<ModalLayer
			open={open}
			onClose={onClose}
			closeOnEscape={closeOnEscape}
			closeOnOutsideClick={closeOnOutsideClick}
			finalFocus={finalFocus}
			container={container}
			layer='dialog'
			scrimStyles={centered}
		>
			<Panel
				{...attributes}
				ref={panelReference}
				tabIndex={-1}
				data-mui-focusable=''
				role={role}
				aria-modal='true'
				aria-labelledby={titleId}
				aria-describedby={description === undefined ? undefined : descriptionId}
				dialogSize={size}
			>
				<OverlaySections
					titleId={titleId}
					descriptionId={descriptionId}
					title={title}
					description={description}
					actions={actions}
					closeLabel={hideCloseButton ? undefined : texts.close}
					onClose={(): void => onClose?.('close-button')}
				>
					{children}
				</OverlaySections>
			</Panel>
		</ModalLayer>
	);
};
