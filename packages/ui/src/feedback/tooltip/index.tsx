'use client';
// Short supplementary text about a control, shown while it is hovered or focused.
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import MuiTooltip from '@mui/material/Tooltip';
import type { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip';
import { useEffect, useRef } from 'react';
import type { ReactElement, RefObject } from 'react';

import { themeVariables } from '#src/theme/theme-variables.ts';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	border,
	elevation,
	layer,
}: typeof themeVariables = themeVariables;

/** Side of the control where the tooltip appears. `start` and `end` follow the reading direction. */
export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';

export interface TooltipProps {
	/**
	 * Supplementary text, such as a keyboard shortcut or the full form of a truncated label. Plain text only: a tooltip
	 * cannot be focused, so links and buttons inside it would be out of reach.
	 */
	content: string;
	/**
	 * A focusable element that already has an accessible name of its own (e.g. an `IconButton` with its `label`). The
	 * tooltip describes it; it never names it, so nothing essential is lost when the tooltip is not shown.
	 */
	children: ReactElement;
	/** Defaults to `'top'`; it flips when there is no room. */
	placement?: TooltipPlacement;
	/** Milliseconds of hover before the tooltip appears; focus shows it at once. Defaults to 300. */
	delay?: number;
	/** Element that receives the tooltip. Defaults to `document.body`. */
	container?: OverlayContainer;
}

const physicalPlacements: Record<
	TooltipPlacement,
	(rightToLeft: boolean) => MuiTooltipProps['placement']
> = {
	top: (): MuiTooltipProps['placement'] => 'top',
	bottom: (): MuiTooltipProps['placement'] => 'bottom',
	start: (rightToLeft: boolean): MuiTooltipProps['placement'] => (rightToLeft ? 'right' : 'left'),
	end: (rightToLeft: boolean): MuiTooltipProps['placement'] => (rightToLeft ? 'left' : 'right'),
};

const tooltipStyles: SxProps<Theme> = {
	maxWidth: '20rem',
	marginBlock: 0,
	paddingBlock: spacing[1],
	paddingInline: spacing[2],
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: border.default,
	borderRadius: radius.small,
	backgroundColor: surface.overlay,
	boxShadow: elevation.medium,
	color: text.primary,
	...typography.caption,
	overflowWrap: 'anywhere',
};

// Accessible name sources of the trigger, leaving out `title`: Material UI copies the tooltip text there.
const hasOwnName = (element: Element): boolean => {
	const named: boolean =
		(element.getAttribute('aria-label') ?? '').trim() !== '' ||
		element.hasAttribute('aria-labelledby');

	return named || element.textContent.trim() !== '';
};

/**
 * Material UI's `Tooltip` provides the behavior: it opens on hover (after `delay`) and on keyboard focus, stays open
 * while the pointer moves onto it, closes on Escape, blur and pointer leave, and links its text to the trigger with
 * `aria-describedby` while open. Focus always stays on the trigger. A trigger without a name of its own is reported
 * in the console, since a tooltip must not be the only source of its name. A disabled control does not receive the
 * pointer and focus events, so wrap it in a focusable element or explain why it is disabled in visible text.
 */
export const Tooltip = (props: TooltipProps): ReactElement => {
	return <TooltipBase {...props} role='description' />;
};

interface TooltipBaseProps extends TooltipProps {
	/**
	 * `description` is the public contract. `name` is for library components whose trigger shows its name only in the
	 * tooltip, such as the items of a collapsed navigation rail: the trigger is named by the same text instead.
	 */
	role: 'description' | 'name';
	/** Keeps the trigger as it is but never shows the tooltip, e.g. while the rail is expanded. */
	disabled?: boolean;
}

/** Shared by `Tooltip` and the library components that need the naming variant. Not public. */
export const TooltipBase = ({
	content,
	children,
	placement = 'top',
	delay = 300,
	container,
	role,
	disabled = false,
}: TooltipBaseProps): ReactElement => {
	const theme: Theme = useTheme();
	const trigger: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);

	useEffect((): void => {
		if (role === 'name' || trigger.current === null || hasOwnName(trigger.current)) return;

		console.error(
			`[Midnight Indigo: UI] The trigger of the tooltip "${content}" has no accessible name of its own. ` +
				'Name it with visible text or a label; the tooltip only describes it.',
		);
	}, [content, role]);

	return (
		<MuiTooltip
			ref={trigger}
			title={content}
			describeChild={role === 'description'}
			placement={physicalPlacements[placement](theme.direction === 'rtl')}
			enterDelay={delay}
			enterNextDelay={delay}
			disableHoverListener={disabled}
			disableFocusListener={disabled}
			disableTouchListener={disabled}
			slotProps={{
				popper: { container, sx: { zIndex: layer.tooltip } },
				tooltip: { sx: tooltipStyles },
			}}
		>
			{children}
		</MuiTooltip>
	);
};
