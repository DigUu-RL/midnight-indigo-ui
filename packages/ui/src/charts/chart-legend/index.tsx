'use client';
// Legend of a chart as toggle buttons: reachable by the keyboard and by touch, unlike a legend drawn by the engine.
// Each swatch repeats the marker, the dash and the pattern of its series, so a series is not told by color alone.
import { styled } from '@mui/material/styles';
import { useId } from 'react';
import type { ReactElement } from 'react';

import { colorTransitionStyles, focusRingStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { patternOpacity } from '#src/charts/chart-option/index.ts';
import type { FillPattern, MarkerShape } from '#src/charts/chart-option/index.ts';

const { spacing, typography, radius, surface, text, state }: typeof themeVariables = themeVariables;

export interface LegendItem {
	label: string;
	color: string;
	/** `line` draws a segment with its marker; `fill` a square with its pattern. */
	kind: 'line' | 'fill';
	marker: MarkerShape;
	dash: readonly number[];
	pattern: FillPattern;
}

export interface ChartLegendProps {
	/** Name of the group of buttons. */
	label: string;
	items: readonly LegendItem[];
	hidden: ReadonlySet<string>;
	onToggle: (label: string) => void;
}

const List = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	gap: spacing[1],
	margin: 0,
	padding: 0,
});

const ToggleButton = styled('button')({
	display: 'inline-flex',
	alignItems: 'center',
	gap: spacing[2],
	minHeight: '2rem',
	padding: `0 ${spacing[2]}`,
	border: 0,
	borderRadius: radius.small,
	background: 'transparent',
	cursor: 'pointer',
	...typography.bodySmall,
	color: text.primary,
	...colorTransitionStyles,
	...focusRingStyles,
	'&:hover': { backgroundColor: state.hover },
	// A hidden series is struck through and faded: its state is told by the text too, not by color alone.
	'&[aria-pressed="false"]': { color: text.muted, textDecoration: 'line-through' },
	'&[aria-pressed="false"] svg': { opacity: 0.4 },
});

const markerPaths: Record<MarkerShape, string> = {
	circle: 'M12 2.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7z',
	rect: 'M8.75 2.75h6.5v6.5h-6.5z',
	triangle: 'M12 2l4 7.5h-8z',
	diamond: 'M12 1.75l4.25 4.25-4.25 4.25-4.25-4.25z',
};

const PatternTile = ({
	id,
	pattern,
}: {
	id: string;
	pattern: FillPattern;
}): ReactElement | null => {
	const tiles: Record<FillPattern, ReactElement | null> = {
		none: null,
		diagonal: (
			<pattern
				id={id}
				width='4'
				height='4'
				patternUnits='userSpaceOnUse'
				patternTransform='rotate(45)'
			>
				<rect width='1.5' height='4' fill={surface.canvas} fillOpacity={patternOpacity} />
			</pattern>
		),
		dots: (
			<pattern id={id} width='4' height='4' patternUnits='userSpaceOnUse'>
				<circle cx='2' cy='2' r='1' fill={surface.canvas} fillOpacity={patternOpacity} />
			</pattern>
		),
		horizontal: (
			<pattern id={id} width='4' height='4' patternUnits='userSpaceOnUse'>
				<rect width='4' height='1.5' fill={surface.canvas} fillOpacity={patternOpacity} />
			</pattern>
		),
		vertical: (
			<pattern id={id} width='4' height='4' patternUnits='userSpaceOnUse'>
				<rect width='1.5' height='4' fill={surface.canvas} fillOpacity={patternOpacity} />
			</pattern>
		),
	};

	return tiles[pattern];
};

const Swatch = ({ item }: { item: LegendItem }): ReactElement => {
	const patternId: string = useId();

	return (
		<svg width='24' height='12' viewBox='0 0 24 12' aria-hidden='true' focusable='false'>
			{item.kind === 'line' ? (
				<>
					<line
						x1='1'
						y1='6'
						x2='23'
						y2='6'
						stroke={item.color}
						strokeWidth='2'
						strokeDasharray={item.dash.length === 0 ? undefined : item.dash.join(' ')}
					/>

					<path d={markerPaths[item.marker]} fill={item.color} />
				</>
			) : (
				<>
					<defs>
						<PatternTile id={patternId} pattern={item.pattern} />
					</defs>

					<rect x='6' y='0' width='12' height='12' rx='2' fill={item.color} />

					{item.pattern === 'none' ? null : (
						<rect x='6' y='0' width='12' height='12' rx='2' fill={`url(#${patternId})`} />
					)}
				</>
			)}
		</svg>
	);
};

/** One toggle button per series (or slice); pressed while it is shown. */
export const ChartLegend = ({ label, items, hidden, onToggle }: ChartLegendProps): ReactElement => {
	return (
		<List role='group' aria-label={label}>
			{items.map((item: LegendItem): ReactElement => {
				return (
					<ToggleButton
						key={item.label}
						type='button'
						aria-pressed={!hidden.has(item.label)}
						onClick={(): void => {
							onToggle(item.label);
						}}
					>
						<Swatch item={item} />
						{item.label}
					</ToggleButton>
				);
			})}
		</List>
	);
};
