// The data of a chart definition read once: formatted categories and numeric values by series. The engine option, the
// summary, the data table and the keyboard navigation are all derived from this model, so they always agree.
import { isCartesian } from '@/src/charts/chart-factories/index';
import type {
	CartesianChartDefinition,
	CategoryFormatter,
	CategoryValue,
	ChartDefinition,
	ComposedSeries,
	ComposedSeriesType,
	PieChartDefinition,
	ValueFormatter,
} from '@/src/charts/chart-factories/index';

export interface ModelSeries {
	label: string;
	/** The value of each category, `null` for a gap. */
	values: readonly (number | null)[];
	format: ValueFormatter;
	type: ComposedSeriesType;
	/** 0 for the primary value axis, 1 for the secondary. */
	axisIndex: 0 | 1;
	color: string | undefined;
}

export interface CartesianModel {
	kind: 'cartesian';
	definition: CartesianChartDefinition<unknown>;
	categories: readonly string[];
	categoryLabel: string | undefined;
	series: readonly ModelSeries[];
}

export interface PieSlice {
	name: string;
	value: number;
	/** Position of the datum of the slice in `data`. */
	datumIndex: number;
}

export interface PieModel {
	kind: 'pie';
	definition: PieChartDefinition<unknown>;
	slices: readonly PieSlice[];
	total: number;
	format: ValueFormatter;
	valueLabel: string;
	categoryLabel: string | undefined;
}

export interface GaugeModel {
	kind: 'gauge';
	value: number | null;
	minimum: number;
	maximum: number;
	format: ValueFormatter;
}

export type ChartModel = CartesianModel | PieModel | GaugeModel;

const toNumber = (value: unknown): number | null => {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const fieldOf = (datum: unknown, field: string): unknown => {
	return typeof datum === 'object' && datum !== null
		? (datum as Record<string, unknown>)[field]
		: undefined;
};

const defaultCategoryFormatter: CategoryFormatter = (category: CategoryValue): string => {
	return String(category);
};

/** The number format of `locale` (the runtime locale when `undefined`). */
export const createNumberFormatter = (locale: string | undefined): ValueFormatter => {
	const format: Intl.NumberFormat = new Intl.NumberFormat(locale);
	return (value: number): string => format.format(value);
};

const categoriesOf = (
	data: readonly unknown[],
	field: string,
	format: CategoryFormatter,
): string[] => {
	return data.map((datum: unknown): string => {
		const category: unknown = fieldOf(datum, field);

		return typeof category === 'string' || typeof category === 'number' ? format(category) : '';
	});
};

const cartesianModel = (
	definition: CartesianChartDefinition<unknown>,
	defaultFormat: ValueFormatter,
): CartesianModel => {
	const chartFormat: ValueFormatter = definition.formatValue ?? defaultFormat;
	const lineType: ComposedSeriesType = definition.type === 'area' ? 'area' : 'line';
	const seriesType: ComposedSeriesType = definition.type === 'bar' ? 'bar' : lineType;

	return {
		kind: 'cartesian',
		definition,
		categories: categoriesOf(
			definition.data,
			definition.x,
			definition.formatCategory ?? defaultCategoryFormatter,
		),
		categoryLabel: definition.categoryLabel,
		// Only the series of a composed chart have their own `type` and `axis`.
		series: (definition.series as readonly Readonly<Partial<ComposedSeries<unknown>>>[]).map(
			(series: Readonly<Partial<ComposedSeries<unknown>>>): ModelSeries => {
				const key: string = series.key ?? '';

				return {
					label: series.label ?? '',
					values: definition.data.map((datum: unknown): number | null => {
						return toNumber(fieldOf(datum, key));
					}),
					format: series.formatValue ?? chartFormat,
					type: series.type ?? seriesType,
					axisIndex: series.axis === 'secondary' ? 1 : 0,
					color: series.color,
				};
			},
		),
	};
};

const pieModel = (
	definition: PieChartDefinition<unknown>,
	defaultFormat: ValueFormatter,
): PieModel => {
	const names: string[] = categoriesOf(
		definition.data,
		definition.category,
		definition.formatCategory ?? defaultCategoryFormatter,
	);

	const slices: PieSlice[] = definition.data.flatMap(
		(datum: unknown, datumIndex: number): PieSlice[] => {
			const value: number | null = toNumber(fieldOf(datum, definition.value));
			const name: string = names[datumIndex] ?? '';

			return value === null || value < 0 ? [] : [{ name, value, datumIndex }];
		},
	);

	return {
		kind: 'pie',
		definition,
		slices,
		total: slices.reduce((sum: number, slice: PieSlice): number => sum + slice.value, 0),
		format: definition.formatValue ?? defaultFormat,
		valueLabel: definition.valueLabel,
		categoryLabel: definition.categoryLabel,
	};
};

/** Reads the data of `definition`; values that are not finite numbers become gaps. */
export const createChartModel = (
	definition: ChartDefinition<unknown>,
	locale: string | undefined,
): ChartModel => {
	const defaultFormat: ValueFormatter = createNumberFormatter(locale);

	if (isCartesian(definition)) return cartesianModel(definition, defaultFormat);
	if (definition.type === 'pie') return pieModel(definition, defaultFormat);

	return {
		kind: 'gauge',
		value: definition.value,
		minimum: definition.minimum,
		maximum: definition.maximum,
		format: definition.formatValue ?? defaultFormat,
	};
};

/** Whether there is nothing to draw: no category, no slice, or only gaps. */
export const isEmptyModel = (model: ChartModel): boolean => {
	if (model.kind === 'gauge') return model.value === null;
	if (model.kind === 'pie') return model.total === 0;

	return model.series.every((series: ModelSeries): boolean => {
		return series.values.every((value: number | null): boolean => value === null);
	});
};

/** Number of points the keyboard moves between: categories, or slices. */
export const pointCountOf = (model: ChartModel): number => {
	if (model.kind === 'gauge') return 0;
	return model.kind === 'pie' ? model.slices.length : model.categories.length;
};
