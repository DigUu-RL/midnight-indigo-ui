'use client';
// Modal layer shared by Dialog and Drawer: portal, scrim, focus trap and restoration, Escape and outside clicks.
import Modal from '@mui/material/Modal';
import { keyframes, styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useEffect, useMemo, useRef } from 'react';
import type { MouseEvent, ReactElement, ReactNode, Ref, RefCallback, RefObject } from 'react';

import { IconButton } from '#src/buttons/icon-button/index.tsx';
import { forwardAllBut } from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { mergeReferences } from '#src/shared/merge-references.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

const { backdrop, layer, motion, spacing, typography, text }: typeof themeVariables =
	themeVariables;

type Keyframes = ReturnType<typeof keyframes>;

/** What asked a modal overlay to close: the Escape key, a click outside the panel or its close button. */
export type OverlayCloseReason = 'escape' | 'outside' | 'close-button';

/** Props shared by the modal overlays (Dialog, ConfirmDialog, Drawer). */
export interface ModalOverlayProps {
	/** Shows the overlay. The parent owns this state and sets it to `false` in `onClose`. */
	open: boolean;
	/** Called when the user asks to close; the overlay closes only when the parent sets `open` to `false`. */
	onClose?: ((reason: OverlayCloseReason) => void) | undefined;
	/** Escape asks to close. Defaults to `true`. */
	closeOnEscape?: boolean | undefined;
	/**
	 * Element focused when the overlay opens. Defaults to the panel itself, so that its name and description are read
	 * first; point it to the first field of a short form, or to the least destructive action.
	 */
	initialFocus?: RefObject<HTMLElement | null> | undefined;
	/**
	 * Element focused when the overlay closes. Defaults to the element that had focus before it opened (usually its
	 * trigger); set it when that element no longer exists, e.g. after deleting the row that opened it.
	 */
	finalFocus?: RefObject<HTMLElement | null> | undefined;
	/** Element that receives the overlay. Defaults to `document.body`. */
	container?: OverlayContainer | undefined;
}

interface ModalLayerProps extends Omit<ModalOverlayProps, 'initialFocus'> {
	/** Stacking layer from the `layer` tokens. */
	layer: 'dialog' | 'drawer';
	/** Placement of the panel on the scrim. */
	scrimStyles: CSSObject;
	/** Clicking the scrim asks to close. */
	closeOnOutsideClick: boolean;
	/** The panel, with `tabIndex={-1}`, `data-mui-focusable` and the ref of `useModalPanelReference`. */
	children: ReactElement;
}

const fadeIn: Keyframes = keyframes({ from: { opacity: 0 } });

const Scrim = styled('div', { shouldForwardProp: forwardAllBut('placement') })<{
	placement: CSSObject;
}>(({ placement }: { placement: CSSObject }): CSSObject => {
	return {
		position: 'absolute',
		inset: 0,
		display: 'flex',
		boxSizing: 'border-box',
		backgroundColor: backdrop.scrim,
		outline: 'none',
		animationName: fadeIn,
		animationDuration: motion.duration.moderate,
		animationTimingFunction: motion.easing.enter,
		...placement,
	};
});

/**
 * Ref of the panel of a modal overlay, merged with the one given by the consumer. It runs when the panel is attached,
 * before the focus trap looks for a target, and moves focus to `initialFocus`; without it, the focus trap focuses the
 * panel (marked `data-mui-focusable`). The ref keeps its identity across renders, so this happens once per opening.
 */
export const useModalPanelReference = (
	initialFocus: RefObject<HTMLElement | null> | undefined,
	forwardedReference: Ref<HTMLDivElement> | undefined,
): RefCallback<HTMLDivElement> => {
	return useMemo((): RefCallback<HTMLDivElement> => {
		const focusInitialTarget = (panel: HTMLDivElement | null): void => {
			if (panel !== null) initialFocus?.current?.focus();
		};

		return mergeReferences<HTMLDivElement>(forwardedReference, focusInitialTarget);
	}, [initialFocus, forwardedReference]);
};

/**
 * Material UI's `Modal` provides the behavior: it renders through a portal, hides the rest of the page from assistive
 * technologies, locks the page scroll, traps focus (Tab and Shift+Tab cycle inside) and restores it on close, and
 * stacks nested overlays so that Escape closes only the topmost one. The scrim and the panel are this library's.
 */
export const ModalLayer = ({
	open,
	onClose,
	closeOnEscape = true,
	closeOnOutsideClick,
	finalFocus,
	container,
	layer: layerName,
	scrimStyles,
	children,
}: ModalLayerProps): ReactElement => {
	const pointerDownOnScrim: RefObject<boolean> = useRef<boolean>(false);
	const wasOpen: RefObject<boolean> = useRef<boolean>(open);

	useEffect((): void => {
		if (wasOpen.current && !open) finalFocus?.current?.focus();
		wasOpen.current = open;
	}, [open, finalFocus]);

	const handleModalClose = (_: unknown, reason: 'backdropClick' | 'escapeKeyDown'): void => {
		if (reason === 'escapeKeyDown' && closeOnEscape) onClose?.('escape');
	};

	// Both ends of the click must be on the scrim: a text selection that starts in the panel and ends outside of it is
	// not a request to close.
	const handleScrimMouseDown = (event: MouseEvent<HTMLDivElement>): void => {
		pointerDownOnScrim.current = event.target === event.currentTarget;
	};

	const handleScrimClick = (event: MouseEvent<HTMLDivElement>): void => {
		const outside: boolean = pointerDownOnScrim.current && event.target === event.currentTarget;
		pointerDownOnScrim.current = false;
		if (outside && closeOnOutsideClick) onClose?.('outside');
	};

	return (
		<Modal
			open={open}
			onClose={handleModalClose}
			container={container}
			disableRestoreFocus={finalFocus !== undefined}
			hideBackdrop
			style={{ zIndex: layer[layerName] }}
		>
			<Scrim
				placement={scrimStyles}
				tabIndex={-1}
				onMouseDown={handleScrimMouseDown}
				onClick={handleScrimClick}
			>
				{children}
			</Scrim>
		</Modal>
	);
};

const Header = styled('div')({
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: spacing[3],
});

const Title = styled('h2')({
	margin: 0,
	...typography.headingSmall,
	color: text.primary,
	overflowWrap: 'anywhere',
});

const Description = styled('div')({
	...typography.body,
	color: text.secondary,
});

// Pulls the close button into the corner, so its 32 px target does not push the title down.
const CloseSlot = styled('div')({
	flexShrink: 0,
	marginBlock: `calc(-1 * ${spacing[1]})`,
	marginInlineEnd: `calc(-1 * ${spacing[2]})`,
});

const Body = styled('div')({ flexGrow: 1 });

const Actions = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	justifyContent: 'flex-end',
	gap: spacing[3],
});

interface OverlaySectionsProps {
	titleId: string;
	descriptionId: string;
	title: ReactNode;
	description: ReactNode;
	children: ReactNode;
	actions: ReactNode;
	/** Name of the close button of the header; `undefined` leaves it out. */
	closeLabel: string | undefined;
	onClose: (() => void) | undefined;
}

/** Header (title and close button), description, body and actions of a modal panel. */
export const OverlaySections = ({
	titleId,
	descriptionId,
	title,
	description,
	children,
	actions,
	closeLabel,
	onClose,
}: OverlaySectionsProps): ReactElement => {
	return (
		<>
			<Header>
				<Title id={titleId}>{title}</Title>
				{closeLabel === undefined ? null : (
					<CloseSlot>
						<IconButton label={closeLabel} size='small' onClick={onClose}>
							<Glyph name='close' />
						</IconButton>
					</CloseSlot>
				)}
			</Header>
			{description === undefined ? null : (
				<Description id={descriptionId}>{description}</Description>
			)}
			{children === undefined ? null : <Body>{children}</Body>}
			{actions === undefined ? null : <Actions>{actions}</Actions>}
		</>
	);
};
