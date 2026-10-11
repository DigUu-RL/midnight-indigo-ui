'use client';
// Renders content at the end of the document (or of a chosen container), outside the clipping of its ancestors.
import MuiPortal from '@mui/material/Portal';
import type { ReactElement, ReactNode } from 'react';

/** Element that receives an overlay, or a function that returns it. Defaults to `document.body`. */
export type OverlayContainer = Element | (() => Element | null) | null;

export interface PortalProps {
	children?: ReactNode;
	/** Defaults to `document.body`. */
	container?: OverlayContainer | undefined;
	/** Renders the children in place, inside the React and DOM hierarchy of the parent. */
	disabled?: boolean | undefined;
}

/**
 * The children are mounted after hydration, so nothing is rendered on the server. Every overlay of the library
 * already uses it and accepts the same `container`; use it directly for layers of your own, with the `layer` tokens.
 */
export const Portal = ({ children, container, disabled = false }: PortalProps): ReactElement => {
	return (
		<MuiPortal container={container} disablePortal={disabled}>
			{children}
		</MuiPortal>
	);
};
