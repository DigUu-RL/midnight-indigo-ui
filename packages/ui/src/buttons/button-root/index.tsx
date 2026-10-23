'use client';
// Native `<button>` shared by `Button` and `IconButton`: appearance, sizes, states and click guarding.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react';

import {
	appearanceStyles,
	colorTransitionStyles,
	controlHeights,
	controlRadii,
	disabledStyles,
	focusRingStyles,
	forwardAllBut,
	interactionStyles,
} from '@/src/shared/appearance';
import type { Appearance, ControlSize } from '@/src/shared/appearance';
import { CircularIndicator } from '@/src/shared/circular-indicator/index';
import { themeVariables } from '@/src/theme/theme-variables';
import type { SemanticIntent } from '@/src/tokens/index';

const { spacing, typography, fontWeight, iconSize }: typeof themeVariables = themeVariables;

/** Attributes of `<button>` that the button components accept; `color` is replaced by `intent`. */
export type NativeButtonAttributes = Omit<ComponentPropsWithRef<'button'>, 'color' | 'children'>;

export interface ButtonRootProps extends NativeButtonAttributes {
	intent: SemanticIntent;
	variant: Appearance;
	size: ControlSize;
	loading: boolean;
	iconOnly: boolean;
	fullWidth: boolean;
	children: ReactNode;
}

interface ButtonStyleProps {
	intent: SemanticIntent;
	variant: Appearance;
	size: ControlSize;
	iconOnly: boolean;
	fullWidth: boolean;
}

const labelSizeStyles: Record<ControlSize, CSSObject> = {
	small: { ...typography.label, gap: spacing[1], paddingInline: spacing[3] },
	medium: { ...typography.label, gap: spacing[2], paddingInline: spacing[4] },
	large: {
		...typography.body,
		fontWeight: fontWeight.medium,
		gap: spacing[2],
		paddingInline: spacing[5],
	},
};

// Icon-only buttons are square; `fontSize` sizes the icons that follow the text (`1em`).
const iconOnlySizeStyles = (size: ControlSize): CSSObject => {
	return {
		width: controlHeights[size],
		padding: 0,
		fontSize: iconSize[size],
		lineHeight: 1,
	};
};

const StyledButton = styled('button', {
	shouldForwardProp: forwardAllBut('intent', 'variant', 'size', 'iconOnly', 'fullWidth'),
})<ButtonStyleProps>(({
	intent,
	variant,
	size,
	iconOnly,
	fullWidth,
}: ButtonStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: fullWidth ? 'flex' : 'inline-flex',
		width: fullWidth ? '100%' : 'auto',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: controlHeights[size],
		margin: 0,
		paddingBlock: spacing[1],
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: controlRadii[size],
		textAlign: 'center',
		textDecoration: 'none',
		cursor: 'pointer',
		userSelect: 'none',
		WebkitTapHighlightColor: 'transparent',
		...labelSizeStyles[size],
		...(iconOnly ? iconOnlySizeStyles(size) : {}),
		...colorTransitionStyles,
		...appearanceStyles(intent, variant),
		...interactionStyles(intent, variant),
		...focusRingStyles,
		'&[aria-busy="true"]': { cursor: 'progress' },
		'&:disabled, &[aria-disabled="true"]:not([aria-busy="true"])': disabledStyles(variant),
	};
});

const Slot = styled('span')({ display: 'inline-flex', flexShrink: 0 });

/** Decorative slot: the label of the button already names it, so slot content is hidden from assistive technologies. */
export const ButtonSlot = ({ children }: { children: ReactNode }): ReactElement | null => {
	return children === undefined || children === null ? null : (
		<Slot aria-hidden='true'>{children}</Slot>
	);
};

/** Ring shown while the operation runs, as a CSS length relative to the font size of the button. */
export const LoadingIndicator = ({ size }: { size: string }): ReactElement => {
	return <CircularIndicator size={size} />;
};

/**
 * While loading, or when marked `aria-disabled`, the button stays focusable (focus is not lost, and the state can be
 * read) but ignores activation, including form submission.
 */
export const ButtonRoot = ({
	intent,
	variant,
	size,
	loading,
	iconOnly,
	fullWidth,
	type = 'button',
	onClick,
	children,
	...buttonAttributes
}: ButtonRootProps): ReactElement => {
	const ariaDisabled: ButtonRootProps['aria-disabled'] = buttonAttributes['aria-disabled'];
	const blocked: boolean = loading || ariaDisabled === true || ariaDisabled === 'true';

	const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
		if (blocked) {
			event.preventDefault();
			return;
		}

		onClick?.(event);
	};

	return (
		<StyledButton
			type={type}
			{...buttonAttributes}
			aria-disabled={blocked ? true : undefined}
			aria-busy={loading ? true : undefined}
			onClick={handleClick}
			intent={intent}
			variant={variant}
			size={size}
			iconOnly={iconOnly}
			fullWidth={fullWidth}
		>
			{children}
		</StyledButton>
	);
};
