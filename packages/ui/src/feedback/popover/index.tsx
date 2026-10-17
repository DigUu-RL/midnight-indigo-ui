'use client';
// Panel of interactive content anchored to the button that opens it: filters, a short form, details.
import MuiPopover from '@mui/material/Popover';
import { styled, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { useEffect, useId, useRef, useState } from 'react';
import type { ReactElement, ReactNode, RefCallback, RefObject } from 'react';

import { assertLabel, prettyWrapStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import {
	anchoredRootStyles,
	anchoredSurfaceStyles,
	anchorOrigins,
	cloneTrigger,
} from '#src/feedback/anchored-overlay/index.ts';
import type {
	AnchoredPlacement,
	AnchorOrigins,
	TriggerProps,
} from '#src/feedback/anchored-overlay/index.ts';
import { useModalPanelReference } from '#src/feedback/modal-layer/index.tsx';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

const { spacing, typography, text }: typeof themeVariables = themeVariables;

export type PopoverPlacement = AnchoredPlacement;

/** A popover is named by a visible `title`, or by a `label` when its content already makes the purpose clear. */
export type PopoverName = { title: string; label?: never } | { label: string; title?: never };

export type PopoverProps = PopoverName & {
	/** The button that opens and closes the popover; it receives `aria-haspopup`, `aria-expanded` and `aria-controls`. */
	trigger: ReactElement<TriggerProps>;
	children: ReactNode;
	/** Open state, when the parent controls it. */
	open?: boolean | undefined;
	/** Initial open state when uncontrolled. */
	defaultOpen?: boolean | undefined;
	/** Called with the requested state, on the trigger, Escape or a click outside. */
	onOpenChange?: ((open: boolean) => void) | undefined;
	/** Defaults to `'bottom-start'`; it flips when there is no room. */
	placement?: PopoverPlacement | undefined;
	/** Clicking outside closes. Defaults to `true`; disable it when the popover holds input that would be lost. */
	closeOnOutsideClick?: boolean | undefined;
	/** Element focused on open. Defaults to the popover itself. */
	initialFocus?: RefObject<HTMLElement | null> | undefined;
	/** Element that receives the popover. Defaults to `document.body`. */
	container?: OverlayContainer | undefined;
};

// The paper is the default focus target of the Material UI focus trap.
const focusTargetAttributes: Record<string, string> = { 'data-mui-focusable': '' };

const Title = styled('div')({
	marginBlockEnd: spacing[3],
	...typography.headingSmall,
	...prettyWrapStyles,
	color: text.primary,
});

/**
 * Modal while open, as in Material UI, which provides the behavior: focus moves into it and stays there, the page
 * behind is hidden from assistive technologies, and Escape or a click outside closes it and returns focus to the
 * trigger. It is a `dialog` named by its `title` or `label`.
 */
export const Popover = ({
	trigger,
	children,
	title,
	label,
	open,
	defaultOpen = false,
	onOpenChange,
	placement = 'bottom-start',
	closeOnOutsideClick = true,
	initialFocus,
	container,
}: PopoverProps): ReactElement => {
	const theme: Theme = useTheme();
	const popoverId: string = useId();
	const titleId: string = useId();
	const triggerElement: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
	const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
	const isOpen: boolean = open ?? uncontrolledOpen;

	// Attached with the content, before the focus trap looks for a target; see `useModalPanelReference`.
	const contentReference: RefCallback<HTMLDivElement> = useModalPanelReference(
		initialFocus,
		undefined,
	);

	// The trigger element is known after the first commit; render once more so a popover open from the start opens.
	const [, setMounted] = useState<boolean>(false);

	useEffect((): void => {
		setMounted(true);
	}, []);

	const origins: AnchorOrigins = anchorOrigins(placement, theme.direction === 'rtl');

	const setOpen = (next: boolean): void => {
		if (open === undefined) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	const nameAttributes: Record<string, string> =
		title === undefined
			? { 'aria-label': assertLabel(label, 'The label of a Popover') }
			: { 'aria-labelledby': titleId };

	return (
		<>
			{cloneTrigger(trigger, {
				reference: triggerElement,
				attributes: {
					'aria-haspopup': 'dialog',
					'aria-expanded': isOpen,
					'aria-controls': isOpen ? popoverId : undefined,
				},
				onClick: (): void => {
					setOpen(!isOpen);
				},
			})}

			<MuiPopover
				open={isOpen && triggerElement.current !== null}
				anchorEl={triggerElement.current}
				anchorOrigin={origins.anchorOrigin}
				transformOrigin={origins.transformOrigin}
				container={container}
				onClose={(_: unknown, reason: 'backdropClick' | 'escapeKeyDown'): void => {
					if (reason === 'escapeKeyDown' || closeOnOutsideClick) setOpen(false);
				}}
				slotProps={{
					root: { sx: anchoredRootStyles },
					paper: {
						id: popoverId,
						role: 'dialog',
						tabIndex: -1,
						...focusTargetAttributes,
						...nameAttributes,
						sx: { ...anchoredSurfaceStyles, width: '20rem', padding: spacing[4] },
					},
				}}
			>
				<div ref={contentReference}>
					{title === undefined ? null : <Title id={titleId}>{title}</Title>}
					{children}
				</div>
			</MuiPopover>
		</>
	);
};
