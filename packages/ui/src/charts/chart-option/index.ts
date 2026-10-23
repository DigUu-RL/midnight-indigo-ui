// Translates a chart model into an Apache ECharts option. Pure: the same model, appearance and view state always give
// the same option, so it is tested without the engine. Only types are imported from ECharts, which are erased.
import type {
	BarSeriesOption,
	GaugeSeriesOption,
	LineSeriesOption,
	PieSeriesOption,
} from 'echarts/charts';
import type {
	DataZoomComponentOption,
	GridComponentOption,
	LegendComponentOption,
	TooltipComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

import type {
	ValueAxisConfig,
	ValueFormatter,
	ZoomWindow,
} from '@/src/charts/chart-factories/index';
import type {
	CartesianModel,
	ChartModel,
	GaugeModel,
	ModelSeries,
	PieModel,
} from '@/src/charts/chart-model/index';
import type { DesignTokens } from '@/src/tokens/index';

export type EngineOption = ComposeOption<
	| BarSeriesOption
	| GaugeSeriesOption
	| LineSeriesOption
	| PieSeriesOption
	| DataZoomComponentOption
	| GridComponentOption
	| LegendComponentOption
	| TooltipComponentOption
>;

type SeriesOption = BarSeriesOption | LineSeriesOption;

type DecalOption = NonNullable<NonNullable<BarSeriesOption['itemStyle']>['decal']>;

export interface ChartAppearance {
	/** One color per series (or slice), in order: the palette already resolved and repeated if needed. */
	colors: readonly string[];
	tokens: Readonly<DesignTokens>;
	/** Fills bars, areas and slices with a pattern per series, besides the color. */
	patterns: boolean;
	animation: boolean;
	/** Shows the pointer cursor over the marks, which can be clicked. */
	selectable: boolean;
	/** Size of the axis and label texts, in pixels. */
	fontSize: number;
}

export interface ChartViewState {
	/** Labels of the hidden series, or names of the hidden slices. */
	hidden: ReadonlySet<string>;
	/** The visible categories, or `null` for all of them. */
	zoom: ZoomWindow | null;
}

/** Shapes that tell the series apart without color: markers, dashes and fill patterns, in assignment order. */
export const seriesMarkers: readonly MarkerShape[] = ['circle', 'rect', 'triangle', 'diamond'];

export type MarkerShape = 'circle' | 'rect' | 'triangle' | 'diamond';

/** Dash pattern of each line, in pixels of dash and gap; empty for a solid line. */
export const seriesDashes: readonly (readonly number[])[] = [[], [8, 4], [2, 3], [10, 3, 2, 3]];

/** Fill patterns: none for the first series, then diagonal lines, dots, horizontal and vertical lines. */
export type FillPattern = 'none' | 'diagonal' | 'dots' | 'horizontal' | 'vertical';

export const seriesPatterns: readonly FillPattern[] = [
	'none',
	'diagonal',
	'dots',
	'horizontal',
	'vertical',
];

/** The item of `list` for the series at `index`, repeating the list as needed. */
export const cyclic = <Item>(list: readonly Item[], index: number): Item => {
	return list[index % list.length] as Item;
};

/** Opacity of the patterns, drawn over the series color in the canvas color, so they read as a texture. */
export const patternOpacity: number = 0.45;

// ECharts takes no decal for a plain fill: 'none' breaks its style pipeline, so the property is left out.
const decalsOf = (patternInk: string): Readonly<Record<FillPattern, DecalOption | undefined>> => {
	return {
		none: undefined,
		diagonal: {
			symbol: 'rect',
			symbolSize: 1,
			dashArrayX: [1, 0],
			dashArrayY: [2, 5],
			rotation: Math.PI / 4,
			color: patternInk,
		},
		dots: { symbol: 'circle', symbolSize: 0.6, dashArrayX: 6, dashArrayY: 6, color: patternInk },
		vertical: {
			symbol: 'rect',
			symbolSize: 1,
			dashArrayX: [2, 4],
			dashArrayY: [1, 0],
			color: patternInk,
		},
		horizontal: {
			symbol: 'rect',
			symbolSize: 1,
			dashArrayX: [1, 0],
			dashArrayY: [2, 4],
			color: patternInk,
		},
	};
};

/** The canvas color at `patternOpacity`, as `#RRGGBBAA`. */
const patternInkOf = (tokens: Readonly<DesignTokens>): string => {
	const alpha: string = Math.round(patternOpacity * 255)
		.toString(16)
		.padStart(2, '0');

	return `${tokens.surface.canvas}${alpha}`;
};

/** The `decal` of the series at `index`, to spread into its item style; empty without a pattern. */
const decalAt = (appearance: ChartAppearance, index: number): { decal?: DecalOption } => {
	const decal: DecalOption | undefined = appearance.patterns
		? decalsOf(patternInkOf(appearance.tokens))[cyclic(seriesPatterns, index)]
		: undefined;

	return decal === undefined ? {} : { decal };
};

const textStyleOf = (
	appearance: ChartAppearance,
): { color: string; fontFamily: string; fontSize: number } => {
	return {
		color: appearance.tokens.chart.label,
		fontFamily: appearance.tokens.fontFamily.sans,
		fontSize: appearance.fontSize,
	};
};

const tooltipOf = (
	appearance: ChartAppearance,
	enabled: boolean,
	trigger: 'axis' | 'item',
): TooltipComponentOption => {
	const { tokens }: ChartAppearance = appearance;

	return {
		show: enabled,
		trigger,
		confine: true,
		backgroundColor: tokens.chart.tooltipSurface,
		borderColor: tokens.border.default,
		textStyle: { ...textStyleOf(appearance), color: tokens.text.primary },
		axisPointer: { type: 'line', lineStyle: { color: tokens.chart.axis } },
		extraCssText: `box-shadow: ${tokens.elevation.overlay};`,
	};
};

// The legend is drawn by `Chart` as buttons; the hidden engine legend only applies which series are shown.
const legendOf = (names: readonly string[], hidden: ReadonlySet<string>): LegendComponentOption => {
	return {
		show: false,
		data: [...names],
		selected: Object.fromEntries(
			names.map((name: string): [string, boolean] => [name, !hidden.has(name)]),
		),
	};
};

const valueAxisOf = (
	appearance: ChartAppearance,
	axis: Readonly<ValueAxisConfig>,
	format: ValueFormatter,
	showGrid: boolean,
): Record<string, unknown> => {
	const { tokens }: ChartAppearance = appearance;

	return {
		type: 'value',
		name: axis.label,
		nameTextStyle: textStyleOf(appearance),
		min: axis.minimum,
		max: axis.maximum,
		axisLabel: { ...textStyleOf(appearance), formatter: format },
		axisLine: { show: false },
		splitLine: { show: showGrid, lineStyle: { color: tokens.chart.grid } },
	};
};

const categoryAxisOf = (
	appearance: ChartAppearance,
	categories: readonly string[],
	boundaryGap: boolean,
	inverse: boolean,
): Record<string, unknown> => {
	const { tokens }: ChartAppearance = appearance;

	return {
		type: 'category',
		data: [...categories],
		boundaryGap,
		inverse,
		axisLabel: { ...textStyleOf(appearance), hideOverlap: true },
		axisLine: { lineStyle: { color: tokens.chart.axis } },
		axisTick: { lineStyle: { color: tokens.chart.axis }, alignWithLabel: true },
		// Emphasizing every series under the pointer redraws them all: too slow for long series, and the tooltip already
		// lists the values.
		axisPointer: { triggerEmphasis: false },
	};
};

const zoomValuesOf = (zoom: ZoomWindow | null, categoryCount: number): Record<string, number> => {
	return { startValue: zoom?.start ?? 0, endValue: zoom?.end ?? Math.max(0, categoryCount - 1) };
};

const dataZoomOf = (
	appearance: ChartAppearance,
	zoom: ZoomWindow | null,
	horizontal: boolean,
	categoryCount: number,
): DataZoomComponentOption[] => {
	const { tokens }: ChartAppearance = appearance;
	const axis: Record<string, number> = horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 };

	const window: Record<string, number> = zoomValuesOf(zoom, categoryCount);

	return [
		{ type: 'inside', ...axis, ...window, filterMode: 'filter', zoomOnMouseWheel: 'ctrl' },
		{
			type: 'slider',
			...axis,
			...window,
			filterMode: 'filter',
			orient: horizontal ? 'vertical' : 'horizontal',
			...(horizontal ? { right: 8, width: 20 } : { bottom: 8, height: 20 }),
			showDetail: false,
			brushSelect: false,
			borderColor: tokens.border.default,
			backgroundColor: tokens.surface.field,
			fillerColor: tokens.intent.official.container,
			handleStyle: { color: tokens.intent.official.main, borderColor: tokens.intent.official.main },
			moveHandleStyle: { color: tokens.intent.official.main },
			dataBackground: {
				lineStyle: { color: tokens.chart.axis },
				areaStyle: { color: tokens.chart.grid },
			},
			selectedDataBackground: {
				lineStyle: { color: tokens.intent.official.main },
				areaStyle: { color: tokens.intent.official.container },
			},
			textStyle: textStyleOf(appearance),
		},
	];
};

const cartesianSeriesOf = (model: CartesianModel, appearance: ChartAppearance): SeriesOption[] => {
	const { definition }: CartesianModel = model;
	const stacked: boolean = 'stacked' in definition && definition.stacked;
	const smooth: boolean = 'smooth' in definition && definition.smooth;
	const pointCount: number = model.categories.length;
	const stack: { stack?: string } = stacked ? { stack: 'total' } : {};

	return model.series.map((series: ModelSeries, index: number): SeriesOption => {
		const color: string = cyclic(appearance.colors, index);

		const common = {
			name: series.label,
			data: [...series.values],
			yAxisIndex: series.axisIndex,
			xAxisIndex: 0,
			color,
			tooltip: {
				valueFormatter: (value: unknown): string => formatTooltipValue(value, series.format),
			},
			emphasis: { focus: 'series' as const },
			cursor: appearance.selectable ? 'pointer' : 'default',
		};

		if (series.type === 'bar') {
			const horizontal: boolean =
				definition.type === 'bar' && definition.orientation === 'horizontal';

			return {
				...common,
				type: 'bar',
				...stack,
				barMaxWidth: 48,
				itemStyle: {
					color,
					borderRadius: stacked ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
					...decalAt(appearance, index),
				},
			};
		}

		const dash: readonly number[] = cyclic(seriesDashes, index);

		return {
			...common,
			type: 'line',
			smooth,
			...stack,
			connectNulls: false,
			// Keeps the shape of long series with about one point per pixel; shorter ones are drawn as they are.
			sampling: 'lttb',
			symbol: cyclic(seriesMarkers, index),
			symbolSize: 7,
			// Markers of every point clutter long series; the tooltip and the keyboard still reach each point.
			showSymbol: pointCount <= 60,
			lineStyle: { color, width: 2, type: dash.length === 0 ? 'solid' : [...dash] },
			// The pattern of an area comes from the item style of its series.
			itemStyle: { color, ...(series.type === 'area' ? decalAt(appearance, index) : {}) },
			...(series.type === 'area'
				? {
						areaStyle: { color, opacity: stacked ? 0.55 : 0.22 },
					}
				: {}),
		};
	});
};

const formatTooltipValue = (value: unknown, format: ValueFormatter): string => {
	return typeof value === 'number' && Number.isFinite(value) ? format(value) : '–';
};

const cartesianOption = (
	model: CartesianModel,
	appearance: ChartAppearance,
	view: ChartViewState,
): EngineOption => {
	const { definition }: CartesianModel = model;
	const horizontal: boolean = definition.type === 'bar' && definition.orientation === 'horizontal';

	const hasBars: boolean = model.series.some(
		(series: ModelSeries): boolean => series.type === 'bar',
	);

	const zoom: boolean = definition.interaction.zoom;

	const formatOfAxis = (axisIndex: 0 | 1): ValueFormatter => {
		const first: ModelSeries | undefined = model.series.find((series: ModelSeries): boolean => {
			return series.axisIndex === axisIndex;
		});

		return first?.format ?? ((value: number): string => String(value));
	};

	const hasSecondary: boolean = model.series.some(
		(series: ModelSeries): boolean => series.axisIndex === 1,
	);

	const valueAxes: Record<string, unknown>[] = [
		valueAxisOf(appearance, definition.valueAxis, formatOfAxis(0), true),
		...(hasSecondary && definition.type === 'composed'
			? [valueAxisOf(appearance, definition.secondaryValueAxis, formatOfAxis(1), false)]
			: []),
	];

	const categoryAxis: Record<string, unknown> = categoryAxisOf(
		appearance,
		model.categories,
		hasBars,
		horizontal,
	);

	const grid: GridComponentOption = {
		left: 8,
		right: horizontal && zoom ? 40 : 16,
		top: definition.valueAxis.label === undefined ? 16 : 32,
		bottom: !horizontal && zoom ? 40 : 8,
	};

	return {
		animation: appearance.animation,
		textStyle: textStyleOf(appearance),
		grid,
		tooltip: tooltipOf(appearance, definition.interaction.tooltip, 'axis'),
		legend: legendOf(
			model.series.map((series: ModelSeries): string => series.label),
			view.hidden,
		),
		xAxis: horizontal ? valueAxes[0] : categoryAxis,
		yAxis: horizontal ? categoryAxis : valueAxes,
		dataZoom: zoom ? dataZoomOf(appearance, view.zoom, horizontal, model.categories.length) : [],
		series: cartesianSeriesOf(model, appearance),
	} as EngineOption;
};

const pieOption = (
	model: PieModel,
	appearance: ChartAppearance,
	view: ChartViewState,
): EngineOption => {
	const { definition }: PieModel = model;
	const names: string[] = model.slices.map((slice: { name: string }): string => slice.name);

	const series: PieSeriesOption = {
		type: 'pie',
		name: model.valueLabel,
		radius: definition.donut ? ['48%', '72%'] : [0, '72%'],
		avoidLabelOverlap: true,
		cursor: appearance.selectable ? 'pointer' : 'default',
		itemStyle: {
			borderColor: appearance.tokens.surface.raised,
			borderWidth: 2,
		},
		// Names next to the slices identify them without the legend or the colors.
		label: { ...textStyleOf(appearance), formatter: '{b}' },
		labelLine: { lineStyle: { color: appearance.tokens.chart.axis } },
		tooltip: {
			valueFormatter: (value: unknown): string => formatTooltipValue(value, model.format),
		},
		data: model.slices.map((slice: { name: string; value: number }, index: number) => {
			return {
				name: slice.name,
				value: slice.value,
				itemStyle: { color: cyclic(appearance.colors, index), ...decalAt(appearance, index) },
			};
		}),
	};

	return {
		animation: appearance.animation,
		textStyle: textStyleOf(appearance),
		tooltip: tooltipOf(appearance, definition.interaction.tooltip, 'item'),
		legend: legendOf(names, view.hidden),
		series: [series],
	};
};

const gaugeOption = (model: GaugeModel, appearance: ChartAppearance): EngineOption => {
	const { tokens }: ChartAppearance = appearance;

	const series: GaugeSeriesOption = {
		type: 'gauge',
		min: model.minimum,
		max: model.maximum,
		startAngle: 210,
		endAngle: -30,
		radius: '90%',
		progress: {
			show: true,
			width: 16,
			roundCap: true,
			itemStyle: { color: cyclic(appearance.colors, 0) },
		},
		axisLine: { roundCap: true, lineStyle: { width: 16, color: [[1, tokens.chart.grid]] } },
		pointer: { show: false },
		axisTick: { show: false },
		splitLine: { show: false },
		axisLabel: { show: false },
		anchor: { show: false },
		title: { show: false },
		detail: {
			valueAnimation: appearance.animation,
			offsetCenter: [0, 0],
			color: tokens.text.primary,
			fontFamily: tokens.fontFamily.sans,
			fontSize: appearance.fontSize * 2.5,
			fontWeight: Number(tokens.fontWeight.semibold),
			formatter: (value: number): string => model.format(value),
		},
		data: [{ value: model.value ?? model.minimum }],
	};

	return { animation: appearance.animation, series: [series] };
};

/** The ECharts option of `model`, drawn with `appearance`, showing what `view` selects. */
export const toEngineOption = (
	model: ChartModel,
	appearance: ChartAppearance,
	view: ChartViewState,
): EngineOption => {
	if (model.kind === 'gauge') return gaugeOption(model, appearance);
	if (model.kind === 'pie') return pieOption(model, appearance, view);
	return cartesianOption(model, appearance, view);
};

/**
 * Only what `view` sets: the shown series and the zoom window. Merged into the option drawn from the same model and
 * appearance, it changes the view without sending the data to the engine again.
 */
export const toViewOption = (model: ChartModel, view: ChartViewState): EngineOption => {
	if (model.kind === 'gauge') return {};

	const names: string[] =
		model.kind === 'pie'
			? model.slices.map((slice: { name: string }): string => slice.name)
			: model.series.map((series: ModelSeries): string => series.label);

	const zoom: Record<string, number> | undefined =
		model.kind === 'cartesian' && model.definition.interaction.zoom
			? zoomValuesOf(view.zoom, model.categories.length)
			: undefined;

	return {
		legend: legendOf(names, view.hidden),
		...(zoom === undefined ? {} : { dataZoom: [zoom, zoom] }),
	};
};
