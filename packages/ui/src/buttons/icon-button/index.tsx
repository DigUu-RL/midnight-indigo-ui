'use client';
// Action shown only as an icon, named by a required label.
import type { ReactElement, ReactNode } from 'react';

import { assertLabel } from '../../shared/appearance.ts';
import type { Appearance, ControlSize } from '../../shared/appearance.ts';
import type { SemanticIntent } from '../../tokens/index.ts';
import { ButtonRoot, ButtonSlot, LoadingIndicator } from '../button-root/index.tsx';
import type { NativeButtonAttributes } from '../button-root/index.tsx';

export type IconButtonVariant = Appearance;

export type IconButtonSize = ControlSize;

export interface IconButtonProps extends Omit<NativeButtonAttributes, 'aria-label'> {
	/** Accessible name, e.g. `'Close'`: what the action does, not what the icon shows. Cannot be blank. */
	label: string;
	/** The icon. It is hidden from assistive technologies, since `label` names the button. */
	children: ReactNode;
	/** Defaults to `'default'`. */
	intent?: SemanticIntent;
	/** Defaults to `'ghost'`. */
	variant?: IconButtonVariant;
	/** Square side of 32, 40 or 48 px; the icons take the matching `iconSize` token. Defaults to `'medium'`. */
	size?: IconButtonSize;
	/** Operation in progress: the icon becomes a ring; see `Button`. */
	loading?: boolean;
}

export const IconButton = ({
	label,
	children,
	intent = 'default',
	variant = 'ghost',
	size = 'medium',
	loading = false,
	...buttonAttributes
}: IconButtonProps): ReactElement => {
	return (
		<ButtonRoot
			{...buttonAttributes}
			aria-label={assertLabel(label, 'The label of an IconButton')}
			intent={intent}
			variant={variant}
			size={size}
			loading={loading}
			iconOnly
			fullWidth={false}
		>
			<ButtonSlot>{loading ? <LoadingIndicator size='1em' /> : children}</ButtonSlot>
		</ButtonRoot>
	);
};
