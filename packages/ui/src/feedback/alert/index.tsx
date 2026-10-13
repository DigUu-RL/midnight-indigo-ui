'use client';
// Message about the page or a task, in one of the semantic intents, with an optional action and dismissal.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import {
	appearanceStyles,
	assertLabel,
	colorTransitionStyles,
	focusRingStyles,
	forwardAllBut,
} from '#src/shared/appearance.ts';
import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { Glyph, intentGlyphs } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';

const {
	spacing,
	typography,
	fontWeight,
	radius,
	text,
	state,
	iconSize,
	intent: intentVariables,
}: typeof themeVariables = themeVariables;

/** Emphasis of the alert: `soft` tints the background, `outline` draws the boundary and `solid` fills it. */
export type AlertVariant = 'soft' | 'outline' | 'solid';

/**
 * How assistive technologies learn about the alert. `'none'` (default) for messages that are part of the page from
 * the start; `'polite'` (`role="status"`) for an outcome that appears after an action; `'assertive'`
 * (`role="alert"`) only for a problem that needs attention now. The alert is announced when it appears, once.
 */
export type AlertAnnouncement = 'none' | 'polite' | 'assertive';

/** Texts of the alert. Translate them with the rest of the interface. */
export interface AlertLabels {
	/** Name of the button that dismisses the alert. */
	dismiss: string;
}

export const defaultAlertLabels: Readonly<AlertLabels> = Object.freeze({ dismiss: 'Dismiss' });

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'role'> {
	/** Meaning of the message; it also picks the icon, so the meaning never rests on color. Defaults to `'info'`. */
	intent?: SemanticIntent;
	/** Defaults to `'soft'`. */
	variant?: AlertVariant;
	/** Short summary, shown in bold before the message. */
	title?: ReactNode;
	/** The message. */
	children?: ReactNode;
	/** Action related to the message, typically a small `Button`. */
	action?: ReactNode;
	/** Decorative icon in place of the intent glyph. */
	icon?: ReactNode;
	/** Defaults to `'none'`. */
	announce?: AlertAnnouncement;
	/** Shows a dismiss button that calls it. Removing the alert is up to the parent. */
	onDismiss?: () => void;
	/** Overrides some or all of `defaultAlertLabels`. */
	labels?: Partial<AlertLabels>;
}

interface AlertStyleProps {
	alertIntent: SemanticIntent;
	alertVariant: AlertVariant;
}

const roles: Record<AlertAnnouncement, 'alert' | 'status' | undefined> = {
	none: undefined,
	polite: 'status',
	assertive: 'alert',
};

// Content colors: the message keeps the pair audited for each variant; an outline alert writes in `text.primary` and
// marks its intent with the icon and the boundary.
const contentColors = (intent: SemanticIntent, variant: AlertVariant): CSSObject => {
	return variant === 'outline'
		? { ...appearanceStyles(intent, 'outline'), color: text.primary }
		: appearanceStyles(intent, variant);
};

const iconColors: Record<AlertVariant, (intent: SemanticIntent) => string> = {
	soft: (intent: SemanticIntent): string => intentVariables[intent].onContainer,
	outline: (intent: SemanticIntent): string => intentVariables[intent].text,
	solid: (intent: SemanticIntent): string => intentVariables[intent].contrastText,
};

// The dismiss button takes the color of the message, and on hover the background whose pair with it is audited.
const dismissHoverBackgrounds: Record<AlertVariant, (intent: SemanticIntent) => string> = {
	soft: (intent: SemanticIntent): string => intentVariables[intent].containerHover,
	outline: (): string => state.hover,
	solid: (intent: SemanticIntent): string => intentVariables[intent].hover,
};

const Root = styled('div', {
	shouldForwardProp: forwardAllBut('alertIntent', 'alertVariant'),
})<AlertStyleProps>(({ alertIntent, alertVariant }: AlertStyleProps): CSSObject => {
	return {
		display: 'flex',
		alignItems: 'flex-start',
		gap: spacing[3],
		boxSizing: 'border-box',
		paddingBlock: spacing[3],
		paddingInline: spacing[4],
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: radius.medium,
		...typography.bodySmall,
		...contentColors(alertIntent, alertVariant),
		'& > [data-alert-icon]': {
			display: 'inline-flex',
			flexShrink: 0,
			// Centered on the first line of text.
			paddingBlock: `calc((${typography.bodySmall.lineHeight} * 1em - ${iconSize.medium}) / 2)`,
			fontSize: iconSize.medium,
			color: iconColors[alertVariant](alertIntent),
		},
	};
});

const Content = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	flexGrow: 1,
	minWidth: 0,
	overflowWrap: 'anywhere',
});

const Title = styled('div')({ fontWeight: fontWeight.semibold });

const Actions = styled('div')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[2],
	flexShrink: 0,
	marginBlock: `calc(-1 * ${spacing[1]})`,
});

const DismissButton = styled('button', {
	shouldForwardProp: forwardAllBut('alertIntent', 'alertVariant'),
})<AlertStyleProps>(({ alertIntent, alertVariant }: AlertStyleProps): CSSObject => {
	return {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '2rem',
		height: '2rem',
		padding: 0,
		border: 'none',
		borderRadius: radius.medium,
		backgroundColor: 'transparent',
		color: 'inherit',
		fontSize: iconSize.small,
		cursor: 'pointer',
		...colorTransitionStyles,
		...focusRingStyles,
		'&:hover': { backgroundColor: dismissHoverBackgrounds[alertVariant](alertIntent) },
	};
});

/**
 * Static by default; `announce` makes it a live message. Its icon follows the intent (see `intentGlyphs`), so success,
 * warning and error differ in shape as well as in color.
 */
export const Alert = ({
	intent = 'info',
	variant = 'soft',
	title,
	children,
	action,
	icon,
	announce = 'none',
	onDismiss,
	labels,
	...attributes
}: AlertProps): ReactElement => {
	const texts: AlertLabels = useComponentLabels('alert', defaultAlertLabels, labels);

	return (
		<Root {...attributes} role={roles[announce]} alertIntent={intent} alertVariant={variant}>
			<span data-alert-icon='' aria-hidden='true'>
				{icon ?? <Glyph name={intentGlyphs[intent]} />}
			</span>

			<Content>
				{title === undefined ? null : <Title>{title}</Title>}
				{children === undefined ? null : <div>{children}</div>}
			</Content>

			{action === undefined && onDismiss === undefined ? null : (
				<Actions>
					{action}

					{onDismiss === undefined ? null : (
						<DismissButton
							type='button'
							aria-label={assertLabel(texts.dismiss, 'The dismiss label of an Alert')}
							alertIntent={intent}
							alertVariant={variant}
							onClick={onDismiss}
						>
							<Glyph name='close' />
						</DismissButton>
					)}
				</Actions>
			)}
		</Root>
	);
};
