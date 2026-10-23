'use client';
// Count or dot attached to the corner of another element, e.g. unread notifications on an icon button.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import {
	appearanceStyles,
	assertLabel,
	forwardAllBut,
	visuallyHiddenStyles,
} from '@/src/shared/appearance';
import type { Appearance } from '@/src/shared/appearance';
import { themeVariables } from '@/src/theme/theme-variables';
import type { SemanticIntent } from '@/src/tokens/index';

const { spacing, typography, fontWeight, radius, surface }: typeof themeVariables = themeVariables;

export type BadgeVariant = Extract<Appearance, 'solid' | 'soft'>;

/**
 * The visual count is hidden from assistive technologies, so the badge states what it means. Give a `label`
 * (`'3 unread messages'`), rendered as hidden text next to the anchor; or mark it `decorative` when the anchor
 * already says it, e.g. an `IconButton` labelled `'Notifications, 3 unread'`.
 */
export type BadgeAccessibility =
	| {
			/** What the badge means, e.g. `'3 unread messages'`, read in place of the visual count. */
			label: string;
			decorative?: never;
	  }
	| {
			/** The anchor already says what the badge means, so the badge is not announced. */
			decorative: true;
			label?: never;
	  };

export type BadgeProps = Omit<ComponentPropsWithRef<'span'>, 'children' | 'content'> &
	BadgeAccessibility & {
		/** Element the badge is attached to. */
		children: ReactNode;
		/** Number or short text. Numbers above `max` show as `max+`. */
		content?: number | string;
		/** Defaults to `99`. */
		max?: number;
		/** Shows a dot instead of `content`. */
		dot?: boolean;
		/** Shows a count of 0, which is hidden by default. */
		showZero?: boolean;
		/** Hides the badge, e.g. when there is nothing new. */
		invisible?: boolean;
		/** Defaults to `'official'`. */
		intent?: SemanticIntent;
		/** Defaults to `'solid'`. */
		variant?: BadgeVariant;
	};

interface IndicatorStyleProps {
	badgeIntent: SemanticIntent;
	badgeVariant: BadgeVariant;
	dot: boolean;
}

const Anchor = styled('span')({
	position: 'relative',
	display: 'inline-flex',
	flexShrink: 0,
	verticalAlign: 'middle',
});

// The ring in the canvas color separates the badge from the anchor and from the background.
const Indicator = styled('span', {
	shouldForwardProp: forwardAllBut('badgeIntent', 'badgeVariant', 'dot'),
})<IndicatorStyleProps>(({ badgeIntent, badgeVariant, dot }: IndicatorStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		position: 'absolute',
		insetBlockStart: 0,
		insetInlineEnd: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: dot ? spacing[2] : '1.25rem',
		height: dot ? spacing[2] : '1.25rem',
		paddingInline: dot ? 0 : spacing[1],
		border: '1px solid transparent',
		borderRadius: radius.pill,
		boxShadow: `0 0 0 2px ${surface.canvas}`,
		transform: 'translate(50%, -50%)',
		pointerEvents: 'none',
		...typography.caption,
		fontWeight: fontWeight.semibold,
		lineHeight: 1,
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
		...appearanceStyles(badgeIntent, badgeVariant),
		'[dir="rtl"] &': { transform: 'translate(-50%, -50%)' },
	};
});

const HiddenLabel = styled('span')(visuallyHiddenStyles);

/** Text shown by the badge, or `undefined` when it is hidden. */
export const formatBadgeContent = (
	content: number | string | undefined,
	max: number,
	showZero: boolean,
): string | undefined => {
	if (content === undefined || content === '') return undefined;
	if (typeof content === 'string') return content;
	if (content === 0 && !showZero) return undefined;
	return content > max ? `${String(max)}+` : String(content);
};

export const Badge = ({
	children,
	content,
	max = 99,
	dot = false,
	showZero = false,
	invisible = false,
	intent = 'official',
	variant = 'solid',
	label,
	decorative,
	...attributes
}: BadgeProps): ReactElement => {
	const text: string | undefined = formatBadgeContent(content, max, showZero);
	const visible: boolean = !invisible && (dot || text !== undefined);
	// A dot has no text, so it needs the 3:1 of main against the surface to be seen.
	const appearance: BadgeVariant = dot ? 'solid' : variant;

	const accessibleLabel: string | undefined =
		decorative === true ? undefined : assertLabel(label, 'The label of a Badge');

	return (
		<Anchor {...attributes}>
			{children}

			{visible ? (
				<Indicator aria-hidden='true' badgeIntent={intent} badgeVariant={appearance} dot={dot}>
					{dot ? null : text}
				</Indicator>
			) : null}

			{visible && accessibleLabel !== undefined ? (
				<HiddenLabel>{accessibleLabel}</HiddenLabel>
			) : null}
		</Anchor>
	);
};
