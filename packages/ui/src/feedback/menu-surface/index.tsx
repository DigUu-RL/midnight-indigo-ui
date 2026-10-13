'use client';
// Menu list shared by Menu and ContextMenu: items, keyboard navigation, placement and deferred selection.
import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import type { PopoverPosition } from '@mui/material/Popover';
import { styled, useTheme } from '@mui/material/styles';
import type { CSSObject, Theme } from '@mui/material/styles';
import { useRef } from 'react';
import type { ReactElement, ReactNode, RefObject } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import {
	anchoredRootStyles,
	anchoredSurfaceStyles,
	anchorOrigins,
} from '#src/feedback/anchored-overlay/index.ts';
import type { AnchoredPlacement, AnchorOrigins } from '#src/feedback/anchored-overlay/index.ts';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

const {
	spacing,
	typography,
	radius,
	text,
	border,
	state,
	focus,
	iconSize,
	intent,
}: typeof themeVariables = themeVariables;

/** An action of a menu. */
export interface MenuItemOption {
	/** Unique within the menu; used as the React key. */
	id: string;
	label: string;
	/** Runs after the menu has closed and focus is back on its trigger, so it may open a dialog. */
	onSelect?: (() => void) | undefined;
	/** Decorative icon before the label. */
	icon?: ReactNode;
	/** Keeps the item visible but skipped by the arrow keys. */
	disabled?: boolean | undefined;
	/** Marks an action that deletes or cannot be undone: error colors, besides a label that says so. */
	destructive?: boolean | undefined;
	/** Keyboard shortcut of the same action elsewhere, e.g. `'Control+C'` (`aria-keyshortcuts` syntax). */
	shortcut?: string | undefined;
}

/** A line between groups of items. */
export interface MenuSeparator {
	id: string;
	separator: true;
}

export type MenuEntry = MenuItemOption | MenuSeparator;

/** Which item receives focus when the menu opens: Down, Enter and Space start at the first, Up at the last. */
export type MenuInitialFocus = 'first' | 'last';

export type MenuAnchor = { element: HTMLElement | null } | { position: PopoverPosition };

interface MenuSurfaceProps {
	id: string;
	open: boolean;
	anchor: MenuAnchor;
	placement: AnchoredPlacement;
	items: readonly MenuEntry[];
	initialFocus: MenuInitialFocus;
	/** Name of the menu: the id of its trigger, or a label. */
	name: { 'aria-labelledby': string } | { 'aria-label': string };
	onClose: () => void;
	container?: OverlayContainer | undefined;
}

const isSeparator = (entry: MenuEntry): entry is MenuSeparator => 'separator' in entry;

const Item = styled(MuiMenuItem, { shouldForwardProp: forwardAllBut('destructive') })<{
	destructive: boolean;
}>(({ destructive }: { destructive: boolean }): CSSObject => {
	// A destructive item turns to the soft error pair on hover and focus, whose contrast is audited.
	const highlighted: CSSObject = destructive
		? { backgroundColor: intent.error.containerHover, color: intent.error.onContainer }
		: { backgroundColor: state.hover };

	return {
		display: 'flex',
		alignItems: 'center',
		gap: spacing[2],
		minHeight: '2.25rem',
		paddingBlock: spacing[1],
		paddingInline: spacing[2],
		borderRadius: radius.small,
		...typography.body,
		color: destructive ? intent.error.text : text.primary,
		'&:hover': highlighted,
		'&.Mui-focusVisible': {
			...highlighted,
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: `calc(-1 * ${focus.width})`,
		},
		'&.Mui-disabled': { opacity: 1, color: state.disabledText },
	};
});

const ItemIcon = styled('span')({
	display: 'inline-flex',
	flexShrink: 0,
	fontSize: iconSize.small,
});

const ItemLabel = styled('span')({ flexGrow: 1 });

const Shortcut = styled('span')({
	marginInlineStart: spacing[4],
	...typography.caption,
	color: 'inherit',
});

// `muiSkipListHighlight` tells Material UI's list never to pick the separator as the item focused on open.
const Separator = styled('li', { shouldForwardProp: forwardAllBut('muiSkipListHighlight') })<{
	muiSkipListHighlight: boolean;
}>({
	height: '1px',
	marginBlock: spacing[1],
	backgroundColor: border.default,
});

// Material UI's `Shift+F10` notation reads better as `Shift + F10`; the accessible form is `aria-keyshortcuts`.
const displayShortcut = (shortcut: string): string => shortcut.replaceAll('+', ' + ');

/**
 * Material UI's `Menu` provides the behavior of the WAI-ARIA menu pattern: arrow keys move between enabled items
 * (wrapping), Home and End jump, typing a letter jumps to the matching item, Enter and Space select, Escape and Tab
 * close, and focus returns to where it was. The list and items are styled by this library.
 */
export const MenuSurface = ({
	id,
	open,
	anchor,
	placement,
	items,
	initialFocus,
	name,
	onClose,
	container,
}: MenuSurfaceProps): ReactElement => {
	const theme: Theme = useTheme();
	const origins: AnchorOrigins = anchorOrigins(placement, theme.direction === 'rtl');
	const pendingSelection: RefObject<(() => void) | null> = useRef<(() => void) | null>(null);

	const anchorProps: Record<string, unknown> =
		'element' in anchor
			? { anchorEl: anchor.element, anchorOrigin: origins.anchorOrigin }
			: { anchorReference: 'anchorPosition', anchorPosition: anchor.position };

	return (
		<MuiMenu
			{...anchorProps}
			open={open}
			onClose={onClose}
			variant='menu'
			container={container}
			transformOrigin={'element' in anchor ? origins.transformOrigin : undefined}
			slotProps={{
				root: { sx: anchoredRootStyles },
				paper: { sx: { ...anchoredSurfaceStyles, minWidth: '12rem' } },
				list: { id, ...name, sx: { padding: spacing[1] } },
				transition: {
					onEntering: (element: HTMLElement): void => {
						if (initialFocus !== 'last') return;

						const enabled: HTMLElement[] = [
							...element.querySelectorAll<HTMLElement>(
								'[role="menuitem"]:not([aria-disabled="true"])',
							),
						];

						enabled.at(-1)?.focus();
					},
					onExited: (): void => {
						const selection: (() => void) | null = pendingSelection.current;
						pendingSelection.current = null;
						selection?.();
					},
				},
			}}
		>
			{items.map((entry: MenuEntry): ReactElement => {
				if (isSeparator(entry)) {
					return <Separator key={entry.id} role='separator' muiSkipListHighlight />;
				}

				return (
					<Item
						key={entry.id}
						destructive={entry.destructive === true}
						disabled={entry.disabled === true}
						aria-keyshortcuts={entry.shortcut}
						onClick={(): void => {
							pendingSelection.current = entry.onSelect ?? null;
							onClose();
						}}
					>
						{entry.icon === undefined ? null : <ItemIcon aria-hidden='true'>{entry.icon}</ItemIcon>}
						<ItemLabel>{entry.label}</ItemLabel>

						{entry.shortcut === undefined ? null : (
							<Shortcut aria-hidden='true'>{displayShortcut(entry.shortcut)}</Shortcut>
						)}
					</Item>
				);
			})}
		</MuiMenu>
	);
};
