'use client';
// Modal panel that slides from an edge of the screen: details, filters or a secondary task beside the page.
import { keyframes, styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode, RefCallback } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import {
	ModalLayer,
	OverlaySections,
	useModalPanelReference,
} from '#src/feedback/modal-layer/index.tsx';
import type { ModalOverlayProps } from '#src/feedback/modal-layer/index.tsx';

const { spacing, typography, surface, text, border, elevation, motion }: typeof themeVariables =
	themeVariables;

type Keyframes = ReturnType<typeof keyframes>;

/** Edge the drawer slides from. `start` and `end` follow the reading direction. */
export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';

export type DrawerSize = 'small' | 'medium' | 'large';

/** Texts of the drawer. Translate them with the rest of the interface. */
export interface DrawerLabels {
	/** Name of the close button in the header. */
	close: string;
}

export const defaultDrawerLabels: Readonly<DrawerLabels> = Object.freeze({ close: 'Close' });

export interface DrawerProps
	extends ModalOverlayProps, Omit<ComponentPropsWithRef<'div'>, 'title' | 'role' | 'children'> {
	/** Visible title and accessible name of the drawer (a level 2 heading). */
	title: ReactNode;
	/** Text under the title, read with the name when the drawer opens (`aria-describedby`). */
	description?: ReactNode;
	children?: ReactNode;
	/** Buttons at the end of the drawer, the main action last. */
	actions?: ReactNode;
	/** Defaults to `'end'`. */
	placement?: DrawerPlacement;
	/** Width (20, 28 or 40 rem) at `start` and `end`, maximum height (40, 60 or 85%) at `top` and `bottom`. */
	size?: DrawerSize;
	/** Clicking outside the panel asks to close. Defaults to `false`; enable it when the drawer holds no input. */
	closeOnOutsideClick?: boolean;
	/** Overrides some or all of `defaultDrawerLabels`. */
	labels?: Partial<DrawerLabels>;
}

interface PanelStyleProps {
	drawerPlacement: DrawerPlacement;
	drawerSize: DrawerSize;
}

const widths: Record<DrawerSize, string> = { small: '20rem', medium: '28rem', large: '40rem' };
const heights: Record<DrawerSize, string> = { small: '40%', medium: '60%', large: '85%' };

const slideFrom = (transform: string): Keyframes => keyframes({ from: { transform } });

const slides: Record<DrawerPlacement, Keyframes> = {
	start: slideFrom('translateX(-100%)'),
	end: slideFrom('translateX(100%)'),
	top: slideFrom('translateY(-100%)'),
	bottom: slideFrom('translateY(100%)'),
};

// In right-to-left documents `start` is the right edge, so the horizontal slides are mirrored.
const mirroredSlides: Partial<Record<DrawerPlacement, Keyframes>> = {
	start: slides.end,
	end: slides.start,
};

const scrimPlacements: Record<DrawerPlacement, CSSObject> = {
	start: { justifyContent: 'flex-start' },
	end: { justifyContent: 'flex-end' },
	top: { flexDirection: 'column', justifyContent: 'flex-start' },
	bottom: { flexDirection: 'column', justifyContent: 'flex-end' },
};

const borderSides: Record<DrawerPlacement, string> = {
	start: 'borderInlineEnd',
	end: 'borderInlineStart',
	top: 'borderBlockEnd',
	bottom: 'borderBlockStart',
};

const Panel = styled('div', {
	shouldForwardProp: forwardAllBut('drawerPlacement', 'drawerSize'),
})<PanelStyleProps>(({ drawerPlacement, drawerSize }: PanelStyleProps): CSSObject => {
	const horizontal: boolean = drawerPlacement === 'start' || drawerPlacement === 'end';
	const mirrored: Keyframes | undefined = mirroredSlides[drawerPlacement];

	return {
		display: 'flex',
		flexDirection: 'column',
		gap: spacing[4],
		boxSizing: 'border-box',
		...(horizontal
			? { width: widths[drawerSize], maxWidth: '100%', height: '100%' }
			: { width: '100%', maxHeight: heights[drawerSize] }),
		overflowY: 'auto',
		padding: spacing[6],
		[borderSides[drawerPlacement]]: `1px solid ${border.default}`,
		backgroundColor: surface.overlay,
		boxShadow: elevation.high,
		color: text.primary,
		...typography.body,
		outline: 'none',
		animationName: slides[drawerPlacement],
		animationDuration: motion.duration.slow,
		animationTimingFunction: motion.easing.enter,
		...(mirrored === undefined ? {} : { '[dir="rtl"] &': { animationName: mirrored } }),
	};
});

/** A modal dialog anchored to an edge: same focus, Escape and naming behavior as `Dialog`. */
export const Drawer = ({
	open,
	onClose,
	closeOnEscape,
	initialFocus,
	finalFocus,
	container,
	title,
	description,
	children,
	actions,
	placement = 'end',
	size = 'medium',
	closeOnOutsideClick = false,
	labels,
	ref,
	...attributes
}: DrawerProps): ReactElement => {
	const texts: DrawerLabels = { ...defaultDrawerLabels, ...labels };
	const titleId: string = useId();
	const descriptionId: string = useId();
	const panelReference: RefCallback<HTMLDivElement> = useModalPanelReference(initialFocus, ref);

	return (
		<ModalLayer
			open={open}
			onClose={onClose}
			closeOnEscape={closeOnEscape}
			closeOnOutsideClick={closeOnOutsideClick}
			finalFocus={finalFocus}
			container={container}
			layer='drawer'
			scrimStyles={scrimPlacements[placement]}
		>
			<Panel
				{...attributes}
				ref={panelReference}
				tabIndex={-1}
				data-mui-focusable=''
				role='dialog'
				aria-modal='true'
				aria-labelledby={titleId}
				aria-describedby={description === undefined ? undefined : descriptionId}
				drawerPlacement={placement}
				drawerSize={size}
			>
				<OverlaySections
					titleId={titleId}
					descriptionId={descriptionId}
					title={title}
					description={description}
					actions={actions}
					closeLabel={texts.close}
					onClose={(): void => onClose?.('close-button')}
				>
					{children}
				</OverlaySections>
			</Panel>
		</ModalLayer>
	);
};
