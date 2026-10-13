'use client';
// List of actions opened from a button (WAI-ARIA menu button).
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement, RefObject } from 'react';

import { cloneTrigger } from '#src/feedback/anchored-overlay/index.ts';
import type { AnchoredPlacement, TriggerProps } from '#src/feedback/anchored-overlay/index.ts';
import { MenuSurface } from '#src/feedback/menu-surface/index.tsx';
import type { MenuEntry, MenuInitialFocus } from '#src/feedback/menu-surface/index.tsx';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

export type MenuPlacement = AnchoredPlacement;

export interface MenuProps {
	/**
	 * The button that opens the menu, which also names it. It receives `aria-haspopup="menu"`, `aria-expanded`,
	 * `aria-controls` and, when it has none, an `id`.
	 */
	trigger: ReactElement<TriggerProps>;
	/** Items and separators, in order. */
	items: readonly MenuEntry[];
	/** Defaults to `'bottom-start'`; it flips when there is no room. */
	placement?: MenuPlacement;
	/** Element that receives the menu. Defaults to `document.body`. */
	container?: OverlayContainer;
}

/**
 * Follows the menu button pattern of the WAI-ARIA Authoring Practices: Enter, Space and Down open the menu on its
 * first item, Up on its last; inside, the arrow keys, Home, End and typing move between items; Enter or a click
 * selects and closes; Escape and Tab close; focus returns to the button. A click outside closes without selecting.
 */
export const Menu = ({
	trigger,
	items,
	placement = 'bottom-start',
	container,
}: MenuProps): ReactElement => {
	const generatedId: string = useId();
	const menuId: string = useId();
	const triggerId: string = trigger.props.id ?? generatedId;
	const triggerElement: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [initialFocus, setInitialFocus] = useState<MenuInitialFocus>('first');

	// The trigger element is known after the first commit; render again so the anchor is never stale.
	const [, setMounted] = useState<boolean>(false);

	useEffect((): void => {
		setMounted(true);
	}, []);

	const openAt = (focus: MenuInitialFocus): void => {
		setInitialFocus(focus);
		setOpen(true);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		openAt(event.key === 'ArrowDown' ? 'first' : 'last');
	};

	return (
		<>
			{cloneTrigger(trigger, {
				reference: triggerElement,
				attributes: {
					id: triggerId,
					'aria-haspopup': 'menu',
					'aria-expanded': open,
					'aria-controls': open ? menuId : undefined,
				},
				onClick: (): void => {
					openAt('first');
				},
				onKeyDown: handleKeyDown,
			})}

			<MenuSurface
				id={menuId}
				open={open && triggerElement.current !== null}
				anchor={{ element: triggerElement.current }}
				placement={placement}
				items={items}
				initialFocus={initialFocus}
				name={{ 'aria-labelledby': triggerId }}
				container={container}
				onClose={(): void => {
					setOpen(false);
				}}
			/>
		</>
	);
};
