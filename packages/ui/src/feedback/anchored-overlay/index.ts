// Pieces shared by the overlays anchored to a trigger (Popover, Menu, ContextMenu): placement, surface and trigger.
import type { PopoverOrigin } from '@mui/material/Popover';
import type { CSSObject } from '@mui/material/styles';
import { cloneElement } from 'react';
import type {
	KeyboardEvent,
	KeyboardEventHandler,
	MouseEvent,
	MouseEventHandler,
	ReactElement,
	Ref,
} from 'react';

import { mergeReferences } from '#src/shared/merge-references.ts';
import { scrollbarStyles } from '#src/theme/native-styles.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const {
	spacing,
	radius,
	surface,
	text,
	border,
	elevation,
	typography,
	layer,
}: typeof themeVariables = themeVariables;

/** Where an anchored overlay opens, relative to its trigger. `start` and `end` follow the reading direction. */
export type AnchoredPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export interface AnchorOrigins {
	anchorOrigin: PopoverOrigin;
	transformOrigin: PopoverOrigin;
}

/** Material UI origins of a placement: the overlay touches the trigger edge on the requested side. */
export const anchorOrigins = (
	placement: AnchoredPlacement,
	rightToLeft: boolean,
): AnchorOrigins => {
	const below: boolean = placement.startsWith('bottom');
	const alignedToStart: boolean = placement.endsWith('start');
	const horizontal: 'left' | 'right' = alignedToStart === rightToLeft ? 'right' : 'left';

	return {
		anchorOrigin: { vertical: below ? 'bottom' : 'top', horizontal },
		transformOrigin: { vertical: below ? 'top' : 'bottom', horizontal },
	};
};

/** Root of an anchored overlay: above dialogs and drawers, so it also works inside them. */
export const anchoredRootStyles: CSSObject = { zIndex: layer.popover };

/** Surface of an anchored overlay, replacing the Material UI paper look. It scrolls when its content is taller. */
export const anchoredSurfaceStyles: CSSObject = {
	...scrollbarStyles,
	boxSizing: 'border-box',
	maxWidth: `calc(100vw - 2 * ${spacing[4]})`,
	marginBlock: spacing[1],
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: border.default,
	borderRadius: radius.large,
	backgroundColor: surface.overlay,
	// Material UI lightens dark papers with a gradient; the surface tokens already set the elevation.
	backgroundImage: 'none',
	boxShadow: elevation.medium,
	color: text.primary,
	...typography.body,
	outline: 'none',
};

/** Props a trigger may already have; the overlay composes its own handlers with them. */
export interface TriggerProps {
	id?: string | undefined;
	ref?: Ref<HTMLElement> | undefined;
	onClick?: MouseEventHandler<HTMLElement> | undefined;
	onKeyDown?: KeyboardEventHandler<HTMLElement> | undefined;
}

export interface TriggerBehavior {
	reference: Ref<HTMLElement>;
	attributes: Record<string, string | boolean | undefined>;
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * Clones the trigger with the overlay attributes (`aria-haspopup`, `aria-expanded`, `aria-controls`), its ref merged
 * with the overlay's, and the overlay handlers run after its own unless it prevented the default.
 */
export const cloneTrigger = (
	trigger: ReactElement<TriggerProps>,
	{ reference, attributes, onClick, onKeyDown }: TriggerBehavior,
): ReactElement => {
	const {
		ref: ownReference,
		onClick: ownClick,
		onKeyDown: ownKeyDown,
	}: TriggerProps = trigger.props;

	return cloneElement(trigger, {
		...attributes,
		ref: mergeReferences(ownReference, reference),
		onClick: (event: MouseEvent<HTMLElement>): void => {
			ownClick?.(event);
			if (!event.defaultPrevented) onClick?.(event);
		},
		onKeyDown: (event: KeyboardEvent<HTMLElement>): void => {
			ownKeyDown?.(event);
			if (!event.defaultPrevented) onKeyDown?.(event);
		},
	});
};
