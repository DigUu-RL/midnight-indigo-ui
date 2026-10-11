'use client';
// Menu of actions on an element, opened with a right click, Shift+F10 or the context menu key.
import type { PopoverPosition } from '@mui/material/Popover';
import { cloneElement, useId, useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';

import { assertLabel } from '#src/shared/appearance.ts';
import type { TriggerProps } from '#src/feedback/anchored-overlay/index.ts';
import { MenuSurface } from '#src/feedback/menu-surface/index.tsx';
import type { MenuEntry } from '#src/feedback/menu-surface/index.tsx';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

interface ContextTargetProps extends TriggerProps {
	onContextMenu?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
}

export interface ContextMenuProps {
	/** Accessible name of the menu, e.g. `'Actions for report.pdf'`. */
	label: string;
	/**
	 * The element the actions apply to. Make it focusable (`tabIndex={0}`, or a native control), so the keyboard can
	 * open the menu too; it keeps its own `onContextMenu` and `onKeyDown`.
	 */
	children: ReactElement<ContextTargetProps>;
	/** Items and separators, in order. */
	items: readonly MenuEntry[];
	/** Shows the browser menu instead, e.g. while the element is disabled. */
	disabled?: boolean;
	/** Element that receives the menu. Defaults to `document.body`. */
	container?: OverlayContainer;
}

// Below the start corner of the element: where the menu of a focused element is expected.
const positionBelow = (element: HTMLElement): PopoverPosition => {
	const bounds: DOMRect = element.getBoundingClientRect();
	const rightToLeft: boolean = getComputedStyle(element).direction === 'rtl';
	return { top: bounds.bottom, left: rightToLeft ? bounds.right : bounds.left };
};

/**
 * Replaces the browser context menu on its child: a right click opens the menu at the pointer, and Shift+F10 or the
 * context menu key open it under the focused element. Inside, it behaves like `Menu`, and focus returns to the
 * element on close. A context menu is hard to discover: offer the same actions somewhere visible as well.
 */
export const ContextMenu = ({
	label,
	children,
	items,
	disabled = false,
	container,
}: ContextMenuProps): ReactElement => {
	const menuId: string = useId();
	const [position, setPosition] = useState<PopoverPosition | null>(null);
	const { onContextMenu, onKeyDown }: ContextTargetProps = children.props;

	const target: ReactElement = cloneElement(children, {
		onContextMenu: (event: MouseEvent<HTMLElement>): void => {
			onContextMenu?.(event);
			if (disabled || event.defaultPrevented) return;
			event.preventDefault();
			setPosition({ top: event.clientY, left: event.clientX });
		},
		onKeyDown: (event: KeyboardEvent<HTMLElement>): void => {
			onKeyDown?.(event);

			const requested: boolean =
				event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);

			if (disabled || event.defaultPrevented || !requested) return;
			event.preventDefault();
			setPosition(positionBelow(event.currentTarget));
		},
	});

	return (
		<>
			{target}
			<MenuSurface
				id={menuId}
				open={position !== null}
				anchor={{ position: position ?? { top: 0, left: 0 } }}
				placement='bottom-start'
				items={items}
				initialFocus='first'
				name={{ 'aria-label': assertLabel(label, 'The label of a ContextMenu') }}
				container={container}
				onClose={(): void => {
					setPosition(null);
				}}
			/>
		</>
	);
};
