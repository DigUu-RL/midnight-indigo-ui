'use client';
// Key figure of a dashboard (KPI): what is measured, its value and how it changed.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { forwardAllBut, numericTextStyles, visuallyHiddenStyles } from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import type { GlyphName } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { defaultLoadingLabel } from '#src/data-display/loading-status/index.tsx';
import { Skeleton } from '#src/data-display/skeleton/index.tsx';

const {
	spacing,
	card,
	typography,
	fontWeight,
	radius,
	surface,
	border,
	text,
	intent,
}: typeof themeVariables = themeVariables;

/** Direction of the change. */
export type StatTrend = 'up' | 'down' | 'flat';

/** Whether the change is good news. A rising cost is `negative`, a rising revenue `positive`. */
export type StatSentiment = 'positive' | 'negative' | 'neutral';

export interface StatChange {
	/** The change, formatted for the locale, e.g. `'12%'` or `'R$ 1.200'`. */
	value: string;
	trend: StatTrend;
	/** Defaults to `positive` for `up`, `negative` for `down` and `neutral` for `flat`. */
	sentiment?: StatSentiment;
}

/** Texts of the stat card. Translate them with the rest of the interface. */
export interface StatCardLabels {
	/** Read before the change of each trend, e.g. "Up 12%". The arrow shows the same visually. */
	up: string;
	down: string;
	flat: string;
	/** Announced instead of the value while it loads. */
	loading: string;
}

export const defaultStatCardLabels: Readonly<StatCardLabels> = Object.freeze({
	up: 'Up',
	down: 'Down',
	flat: 'No change',
	loading: defaultLoadingLabel,
});

export interface StatCardProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'> {
	/** What is measured, e.g. `'Revenue'`. It names the card. */
	label: string;
	/** The value, formatted for the locale. */
	value: ReactNode;
	change?: StatChange;
	/** Context of the value or of the change, e.g. `'vs. last month'`. */
	description?: ReactNode;
	/** Decorative icon at the end of the label. */
	icon?: ReactNode;
	/** Shows a placeholder in place of the value and the change. Defaults to `false`. */
	loading?: boolean;
	/** Overrides some or all of `defaultStatCardLabels`. */
	labels?: Partial<StatCardLabels>;
}

const defaultSentiments: Record<StatTrend, StatSentiment> = {
	up: 'positive',
	down: 'negative',
	flat: 'neutral',
};

const trendGlyphs: Record<StatTrend, GlyphName> = {
	up: 'arrowUp',
	down: 'arrowDown',
	flat: 'minus',
};

const sentimentColors: Record<StatSentiment, string> = {
	positive: intent.success.text,
	negative: intent.error.text,
	neutral: text.secondary,
};

const Root = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[2],
	minWidth: 0,
	padding: `${card.paddingBlock} ${card.paddingInline}`,
	border: `1px solid ${border.default}`,
	borderRadius: radius.card,
	backgroundColor: surface.raised,
	color: text.secondary,
});

const Header = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: spacing[2],
});

const Label = styled('p')({ ...typography.label, margin: 0, color: text.secondary });

const IconSlot = styled('span')({ display: 'inline-flex', flexShrink: 0, color: text.muted });

const Value = styled('p')({
	...typography.display,
	...numericTextStyles,
	margin: 0,
	overflowWrap: 'anywhere',
	color: text.primary,
});

const Footer = styled('p')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[2],
	margin: 0,
	...typography.bodySmall,
});

const Change = styled('span', {
	shouldForwardProp: forwardAllBut('sentiment'),
})<{ sentiment: StatSentiment }>(({ sentiment }: { sentiment: StatSentiment }): CSSObject => {
	return {
		display: 'inline-flex',
		alignItems: 'center',
		gap: spacing[1],
		...numericTextStyles,
		fontWeight: fontWeight.semibold,
		color: sentimentColors[sentiment],
	};
});

const HiddenText = styled('span')(visuallyHiddenStyles);

/**
 * A group named by its `label`. The direction of the change is told by an arrow and by text, and its sentiment by
 * color, so neither rests on color alone.
 */
export const StatCard = ({
	label,
	value,
	change,
	description,
	icon,
	loading = false,
	labels,
	...attributes
}: StatCardProps): ReactElement => {
	const texts: StatCardLabels = useComponentLabels('statCard', defaultStatCardLabels, labels);
	const labelId: string = useId();

	return (
		<Root
			{...attributes}
			role='group'
			aria-labelledby={labelId}
			aria-busy={loading ? 'true' : undefined}
		>
			<Header>
				<Label id={labelId}>{label}</Label>
				{icon === undefined ? null : <IconSlot aria-hidden='true'>{icon}</IconSlot>}
			</Header>

			{loading ? (
				<Value>
					<HiddenText>{texts.loading}</HiddenText>
					<Skeleton width='8rem' />
				</Value>
			) : (
				<Value>{value}</Value>
			)}

			{change === undefined && description === undefined ? null : (
				<Footer>
					{change === undefined || loading ? null : (
						<Change sentiment={change.sentiment ?? defaultSentiments[change.trend]}>
							<Glyph name={trendGlyphs[change.trend]} size='small' />
							<HiddenText>{`${texts[change.trend]} `}</HiddenText>
							{change.value}
						</Change>
					)}

					{description === undefined ? null : <span>{description}</span>}
				</Footer>
			)}
		</Root>
	);
};
