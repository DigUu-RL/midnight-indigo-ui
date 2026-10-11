'use client';
// Action with a visible text label.
import type { ReactElement, ReactNode } from 'react';

import type { Appearance, ControlSize } from '../../shared/appearance.ts';
import type { SemanticIntent } from '../../tokens/index.ts';
import { ButtonRoot, ButtonSlot, LoadingIndicator } from '../button-root/index.tsx';
import type { NativeButtonAttributes } from '../button-root/index.tsx';

export type ButtonVariant = Appearance;

export type ButtonSize = ControlSize;

export interface ButtonProps extends NativeButtonAttributes {
	/** Visible label; it is also the accessible name. */
	children: ReactNode;
	/** Meaning of the action. Defaults to `'default'`; mark the main action of a view with `'official'`. */
	intent?: SemanticIntent;
	/** Emphasis. Defaults to `'soft'`. */
	variant?: ButtonVariant;
	/** Defaults to `'medium'`. Every size is at least 32 px high, above the WCAG 2.2 minimum target. */
	size?: ButtonSize;
	/**
	 * Operation in progress: shows a ring in place of `startIcon`, sets `aria-busy` and ignores activation, but the
	 * button keeps its look and its focus. Use it instead of `disabled`, which means the action is unavailable.
	 */
	loading?: boolean;
	/** Decorative content before the label, typically an `Icon`. */
	startIcon?: ReactNode;
	/** Decorative content after the label. */
	endIcon?: ReactNode;
	/** Takes the full width of its container. */
	fullWidth?: boolean;
}

/**
 * Native `<button>` with `type="button"` by default; pass `type="submit"` in forms. Other attributes, `ref`
 * included, reach the element.
 */
export const Button = ({
	children,
	intent = 'default',
	variant = 'soft',
	size = 'medium',
	loading = false,
	startIcon,
	endIcon,
	fullWidth = false,
	...buttonAttributes
}: ButtonProps): ReactElement => {
	return (
		<ButtonRoot
			{...buttonAttributes}
			intent={intent}
			variant={variant}
			size={size}
			loading={loading}
			iconOnly={false}
			fullWidth={fullWidth}
		>
			<ButtonSlot>{loading ? <LoadingIndicator size='1.25em' /> : startIcon}</ButtonSlot>
			{children}
			<ButtonSlot>{endIcon}</ButtonSlot>
		</ButtonRoot>
	);
};
