// Chart definitions: small, typed configurations that describe what to draw, independent of the chart engine. Each
// factory validates its configuration, fills the defaults and returns a frozen definition for `Chart`.
import { assertLabel } from '@/src/shared/appearance';

/** `canvas` (default) draws large datasets faster; `svg` keeps the marks sharp at any zoom and uses less memory. */
export type ChartRenderer = 'canvas' | 'svg';

/** The first and last visible categories, by position from 0. */
export interface ZoomWindow {
	start: number;
	end: number;
}

/** Value of a category: the label of a point on the category axis, or of a slice. */
export type CategoryValue = string | number;

/** Value of a point. `null` or `undefined` is a gap: no value for that category. */
export type PointValue = number | null | undefined;

/**
 * The fields of `Datum` whose values are of type `Value`. Any field name when the datum is `unknown`, so that every
 * definition can be handled as a `ChartDefinition<unknown>`.
 */
export type FieldOf<Datum, Value> = unknown extends Datum
	? string
	: {
			[Key in keyof Datum]-?: Datum[Key] extends Value ? Key : never;
		}[keyof Datum] &
			string;

/** Formats a value for the axis, the tooltip, the summary and the data table. */
export type ValueFormatter = (value: number) => string;

/** Formats a category for the axis, the tooltip, the summary and the data table. */
export type CategoryFormatter = (category: CategoryValue) => string;

export interface ChartSeries<Datum> {
	/** Field of each datum that holds the values of the series. Only numeric fields are accepted. */
	key: FieldOf<Datum, PointValue>;
	/** Name of the series, in the legend, the tooltip, the summary and the data table. Unique in the chart. */
	label: string;
	/** Color of the series, in place of the palette color of its position. */
	color?: string;
	/** Formats the values of this series. Defaults to `formatValue` of the chart. */
	formatValue?: ValueFormatter;
}

/** Interactions of charts with a category axis. */
export interface CartesianInteraction {
	/** Tooltip on pointer hover, touch and keyboard focus. Defaults to `true`. */
	tooltip?: boolean;
	/** Legend whose buttons show and hide each series. Defaults to `true` with more than one series. */
	legend?: boolean;
	/** Zoom and pan of the category axis: wheel, pinch, a slider and buttons. Defaults to `false`. */
	zoom?: boolean;
}

/** Interactions of pie and donut charts: there is no axis to zoom. */
export type PieInteraction = Omit<CartesianInteraction, 'zoom'>;

export interface ValueAxisConfig {
	/** Name of the measure, e.g. `'Revenue (R$)'`, shown along the axis. */
	label?: string;
	/** Lower bound. Defaults to a bound that includes 0 and every value. */
	minimum?: number;
	/** Upper bound. Defaults to a bound that includes every value. */
	maximum?: number;
}

export interface CartesianChartConfig<Datum> {
	/** One datum per category, in the order of the axis. */
	data: readonly Datum[];
	/** Field of each datum that holds its category, e.g. the month. */
	x: FieldOf<Datum, CategoryValue>;
	/** Name of the categories, e.g. `'Month'`: the header of the first column of the data table. */
	categoryLabel?: string;
	series: readonly ChartSeries<Datum>[];
	/** Defaults to `String`. Format dates into labels with the locale and time zone of the application. */
	formatCategory?: CategoryFormatter;
	/** Defaults to the number format of the locale of the chart. */
	formatValue?: ValueFormatter;
	valueAxis?: ValueAxisConfig;
	interaction?: CartesianInteraction;
}

export interface LineChartConfig<Datum> extends CartesianChartConfig<Datum> {
	/** Draws curves instead of straight segments. Defaults to `false`. */
	smooth?: boolean;
}

export interface AreaChartConfig<Datum> extends LineChartConfig<Datum> {
	/** Stacks the series: each area starts where the previous one ends. Defaults to `false`. */
	stacked?: boolean;
}

/** `vertical` draws columns; `horizontal` draws bars, with the categories from top to bottom. */
export type BarOrientation = 'vertical' | 'horizontal';

export interface BarChartConfig<Datum> extends CartesianChartConfig<Datum> {
	/** Defaults to `'vertical'`. */
	orientation?: BarOrientation;
	/** Stacks the series in one bar per category (stacked bar). Defaults to `false`. */
	stacked?: boolean;
}

/** How a series of a composed chart is drawn. */
export type ComposedSeriesType = 'line' | 'area' | 'bar';

/** Value axis of a series of a composed chart: the primary one is on the start side, the secondary on the end. */
export type ValueAxisSide = 'primary' | 'secondary';

export interface ComposedSeries<Datum> extends ChartSeries<Datum> {
	type: ComposedSeriesType;
	/** Defaults to `'primary'`. */
	axis?: ValueAxisSide;
}

export interface ComposedChartConfig<Datum> extends Omit<CartesianChartConfig<Datum>, 'series'> {
	series: readonly ComposedSeries<Datum>[];
	/** Axis of the series with `axis: 'secondary'`, e.g. a rate drawn over amounts. */
	secondaryValueAxis?: ValueAxisConfig;
}

export interface PieChartConfig<Datum> {
	/** One datum per slice. */
	data: readonly Datum[];
	/** Field of each datum that holds the name of its slice. Names must be unique. */
	category: FieldOf<Datum, CategoryValue>;
	/** Field of each datum that holds the size of its slice. Negative values and gaps are left out. */
	value: FieldOf<Datum, PointValue>;
	/** Name of the measure, e.g. `'Visits'`: the header of its column in the data table. */
	valueLabel: string;
	/** Name of the slices, e.g. `'Channel'`: the header of the first column of the data table. */
	categoryLabel?: string;
	/** Draws a ring instead of a disc. Defaults to `false`. */
	donut?: boolean;
	formatCategory?: CategoryFormatter;
	formatValue?: ValueFormatter;
	interaction?: PieInteraction;
}

export interface GaugeChartConfig {
	/** The measured value, or `null` when it is unknown. */
	value: number | null;
	/** Defaults to 0. */
	minimum?: number;
	/** Defaults to 100. */
	maximum?: number;
	formatValue?: ValueFormatter;
}

/** Interaction settings after the defaults are applied. */
export type ResolvedInteraction = Readonly<Required<CartesianInteraction>>;

interface CartesianDefinitionBase<Datum> {
	readonly data: readonly Datum[];
	readonly x: FieldOf<Datum, CategoryValue>;
	readonly categoryLabel: string | undefined;
	readonly formatCategory: CategoryFormatter | undefined;
	readonly formatValue: ValueFormatter | undefined;
	readonly valueAxis: Readonly<ValueAxisConfig>;
	readonly interaction: ResolvedInteraction;
}

export interface LineChartDefinition<Datum> extends CartesianDefinitionBase<Datum> {
	readonly type: 'line';
	readonly series: readonly Readonly<ChartSeries<Datum>>[];
	readonly smooth: boolean;
}

export interface AreaChartDefinition<Datum> extends CartesianDefinitionBase<Datum> {
	readonly type: 'area';
	readonly series: readonly Readonly<ChartSeries<Datum>>[];
	readonly smooth: boolean;
	readonly stacked: boolean;
}

export interface BarChartDefinition<Datum> extends CartesianDefinitionBase<Datum> {
	readonly type: 'bar';
	readonly series: readonly Readonly<ChartSeries<Datum>>[];
	readonly orientation: BarOrientation;
	readonly stacked: boolean;
}

export interface ComposedChartDefinition<Datum> extends CartesianDefinitionBase<Datum> {
	readonly type: 'composed';
	readonly series: readonly Readonly<ComposedSeries<Datum>>[];
	readonly secondaryValueAxis: Readonly<ValueAxisConfig>;
}

export interface PieChartDefinition<Datum> {
	readonly type: 'pie';
	readonly data: readonly Datum[];
	readonly category: FieldOf<Datum, CategoryValue>;
	readonly value: FieldOf<Datum, PointValue>;
	readonly valueLabel: string;
	readonly categoryLabel: string | undefined;
	readonly donut: boolean;
	readonly formatCategory: CategoryFormatter | undefined;
	readonly formatValue: ValueFormatter | undefined;
	readonly interaction: ResolvedInteraction;
}

export interface GaugeChartDefinition {
	readonly type: 'gauge';
	readonly value: number | null;
	readonly minimum: number;
	readonly maximum: number;
	readonly formatValue: ValueFormatter | undefined;
	readonly interaction: ResolvedInteraction;
}

/** Charts with a category axis. */
export type CartesianChartDefinition<Datum> =
	| LineChartDefinition<Datum>
	| AreaChartDefinition<Datum>
	| BarChartDefinition<Datum>
	| ComposedChartDefinition<Datum>;

/** What `Chart` draws: the result of one of the `create*Chart` factories. */
export type ChartDefinition<Datum> =
	CartesianChartDefinition<Datum> | PieChartDefinition<Datum> | GaugeChartDefinition;

export type ChartType = ChartDefinition<unknown>['type'];

const noInteraction: ResolvedInteraction = Object.freeze({
	tooltip: false,
	legend: false,
	zoom: false,
});

const assertUniqueLabels = (labels: readonly string[]): void => {
	const duplicate: string | undefined = labels.find((label: string, index: number): boolean => {
		return labels.indexOf(label) !== index;
	});

	if (duplicate !== undefined) {
		throw new TypeError(`The series label "${duplicate}" is repeated: every series needs its own.`);
	}
};

const assertRange = (minimum: number | undefined, maximum: number | undefined): void => {
	if (minimum !== undefined && maximum !== undefined && minimum >= maximum) {
		throw new RangeError(
			`The minimum (${String(minimum)}) must be less than the maximum (${String(maximum)}).`,
		);
	}
};

const resolveSeries = <Series extends { label: string }>(
	series: readonly Series[],
): readonly Readonly<Series>[] => {
	if (series.length === 0) throw new TypeError('A chart needs at least one series.');

	series.forEach((entry: Series): void => {
		assertLabel(entry.label, 'The label of a chart series');
	});

	assertUniqueLabels(series.map((entry: Series): string => entry.label));
	return Object.freeze(
		series.map((entry: Series): Readonly<Series> => Object.freeze({ ...entry })),
	);
};

const resolveInteraction = (
	interaction: CartesianInteraction | undefined,
	seriesCount: number,
): ResolvedInteraction => {
	return Object.freeze({
		tooltip: interaction?.tooltip ?? true,
		legend: interaction?.legend ?? seriesCount > 1,
		zoom: interaction?.zoom ?? false,
	});
};

const resolveValueAxis = (axis: ValueAxisConfig | undefined): Readonly<ValueAxisConfig> => {
	assertRange(axis?.minimum, axis?.maximum);
	return Object.freeze({ ...axis });
};

const resolveCartesian = <Datum>(
	config: CartesianChartConfig<Datum> | ComposedChartConfig<Datum>,
): CartesianDefinitionBase<Datum> => {
	return {
		data: config.data,
		x: config.x,
		categoryLabel: config.categoryLabel,
		formatCategory: config.formatCategory,
		formatValue: config.formatValue,
		valueAxis: resolveValueAxis(config.valueAxis),
		interaction: resolveInteraction(config.interaction, config.series.length),
	};
};

/** Line chart: values that change along an ordered axis, such as time. */
export const createLineChart = <Datum>(
	config: LineChartConfig<Datum>,
): LineChartDefinition<Datum> => {
	return Object.freeze({
		type: 'line',
		...resolveCartesian(config),
		series: resolveSeries(config.series),
		smooth: config.smooth ?? false,
	});
};

/** Area chart: like a line chart, with the area under each line filled; `stacked` adds the series up. */
export const createAreaChart = <Datum>(
	config: AreaChartConfig<Datum>,
): AreaChartDefinition<Datum> => {
	return Object.freeze({
		type: 'area',
		...resolveCartesian(config),
		series: resolveSeries(config.series),
		smooth: config.smooth ?? false,
		stacked: config.stacked ?? false,
	});
};

/** Column (`vertical`) or bar (`horizontal`) chart, grouped or `stacked`: amounts compared between categories. */
export const createBarChart = <Datum>(config: BarChartConfig<Datum>): BarChartDefinition<Datum> => {
	return Object.freeze({
		type: 'bar',
		...resolveCartesian(config),
		series: resolveSeries(config.series),
		orientation: config.orientation ?? 'vertical',
		stacked: config.stacked ?? false,
	});
};

/** Bars, lines and areas on the same category axis, optionally with a secondary value axis. */
export const createComposedChart = <Datum>(
	config: ComposedChartConfig<Datum>,
): ComposedChartDefinition<Datum> => {
	return Object.freeze({
		type: 'composed',
		...resolveCartesian(config),
		series: resolveSeries(config.series),
		secondaryValueAxis: resolveValueAxis(config.secondaryValueAxis),
	});
};

/** Pie or `donut` chart: the share of each part in a whole. Best with few slices; prefer bars beyond about six. */
export const createPieChart = <Datum>(config: PieChartConfig<Datum>): PieChartDefinition<Datum> => {
	assertLabel(config.valueLabel, 'The value label of a pie chart');

	return Object.freeze({
		type: 'pie',
		data: config.data,
		category: config.category,
		value: config.value,
		valueLabel: config.valueLabel,
		categoryLabel: config.categoryLabel,
		donut: config.donut ?? false,
		formatCategory: config.formatCategory,
		formatValue: config.formatValue,
		interaction: Object.freeze({
			tooltip: config.interaction?.tooltip ?? true,
			legend: config.interaction?.legend ?? true,
			zoom: false,
		}),
	});
};

/** Gauge of one key figure (KPI) on a scale, e.g. a goal reached in percent. */
export const createGaugeChart = (config: GaugeChartConfig): GaugeChartDefinition => {
	const minimum: number = config.minimum ?? 0;
	const maximum: number = config.maximum ?? 100;
	assertRange(minimum, maximum);

	return Object.freeze({
		type: 'gauge',
		value: config.value,
		minimum,
		maximum,
		formatValue: config.formatValue,
		interaction: noInteraction,
	});
};

/** Whether the chart has a category axis. */
export const isCartesian = <Datum>(
	definition: ChartDefinition<Datum>,
): definition is CartesianChartDefinition<Datum> => {
	return definition.type !== 'pie' && definition.type !== 'gauge';
};
