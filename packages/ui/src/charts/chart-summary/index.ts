// Text alternatives of a chart: the summary read by assistive technologies, the description of one point reached by
// the keyboard, and the rows of the data table. Every sentence comes whole from the labels, so it can be translated.
import type { ChartLabels } from '@/src/charts/chart-labels/index';
import type {
	CartesianModel,
	ChartModel,
	ModelSeries,
	PieModel,
	PieSlice,
} from '@/src/charts/chart-model/index';

export interface DataTableContent {
	headers: readonly string[];
	/** The first cell of each row names it: the category or the slice. */
	rows: readonly (readonly string[])[];
}

interface Extreme {
	value: number;
	index: number;
}

const percentFormatter = (locale: string | undefined): Intl.NumberFormat => {
	return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
};

/** Joins the parts of a list as the locale does, e.g. "Revenue: 10, Costs: 8". */
export const joinList = (parts: readonly string[], locale: string | undefined): string => {
	return new Intl.ListFormat(locale, { type: 'unit', style: 'long' }).format(parts);
};

const extremesOf = (values: readonly (number | null)[]): [Extreme, Extreme] | null => {
	return values.reduce<[Extreme, Extreme] | null>(
		(
			found: [Extreme, Extreme] | null,
			value: number | null,
			index: number,
		): [Extreme, Extreme] | null => {
			if (value === null) return found;

			if (found === null) {
				return [
					{ value, index },
					{ value, index },
				];
			}

			const [lowest, highest]: [Extreme, Extreme] = found;

			return [
				value < lowest.value ? { value, index } : lowest,
				value > highest.value ? { value, index } : highest,
			];
		},
		null,
	);
};

const valueText = (
	value: number | null,
	format: (value: number) => string,
	labels: ChartLabels,
): string => {
	return value === null ? labels.noValue : format(value);
};

const shareOf = (slice: PieSlice, model: PieModel, locale: string | undefined): string => {
	return percentFormatter(locale).format(model.total === 0 ? 0 : slice.value / model.total);
};

const cartesianSummary = (model: CartesianModel, labels: ChartLabels): string[] => {
	const { categories }: CartesianModel = model;
	const first: string = categories[0] ?? '';
	const last: string = categories.at(-1) ?? '';

	const seriesSentences: string[] = model.series.map((series: ModelSeries): string => {
		const extremes: [Extreme, Extreme] | null = extremesOf(series.values);
		if (extremes === null) return labels.seriesNoValues(series.label);

		const [lowest, highest]: [Extreme, Extreme] = extremes;

		return labels.seriesRange(
			series.label,
			series.format(lowest.value),
			categories[lowest.index] ?? '',
			series.format(highest.value),
			categories[highest.index] ?? '',
		);
	});

	return [labels.categoryRange(categories.length, first, last), ...seriesSentences];
};

const pieSummary = (model: PieModel, labels: ChartLabels, locale: string | undefined): string[] => {
	return [
		...model.slices.map((slice: PieSlice): string => {
			return labels.slice(slice.name, model.format(slice.value), shareOf(slice, model, locale));
		}),
		labels.total(model.format(model.total)),
	];
};

/** A few sentences about the whole chart: its extent, and the lowest and highest values of each series. */
export const summarizeChart = (
	model: ChartModel,
	labels: ChartLabels,
	locale: string | undefined,
): string => {
	if (model.kind === 'gauge') {
		return model.value === null
			? labels.empty
			: labels.gauge(
					model.format(model.value),
					model.format(model.minimum),
					model.format(model.maximum),
				);
	}

	return (
		model.kind === 'pie' ? pieSummary(model, labels, locale) : cartesianSummary(model, labels)
	).join(' ');
};

/** What the keyboard announces on reaching the point at `index`, among the visible series. */
export const describePoint = (
	model: ChartModel,
	index: number,
	hidden: ReadonlySet<string>,
	labels: ChartLabels,
	locale: string | undefined,
): string => {
	if (model.kind === 'gauge') return '';

	if (model.kind === 'pie') {
		const slice: PieSlice | undefined = model.slices[index];
		if (slice === undefined) return '';

		const values: string[] = [
			labels.seriesValue(model.valueLabel, model.format(slice.value)),
			labels.seriesValue(labels.share, shareOf(slice, model, locale)),
		];

		return labels.point(slice.name, joinList(values, locale), index + 1, model.slices.length);
	}

	const values: string[] = model.series
		.filter((series: ModelSeries): boolean => !hidden.has(series.label))
		.map((series: ModelSeries): string => {
			return labels.seriesValue(
				series.label,
				valueText(series.values[index] ?? null, series.format, labels),
			);
		});

	return labels.point(
		model.categories[index] ?? '',
		joinList(values, locale),
		index + 1,
		model.categories.length,
	);
};

/** The data of the chart as a table: one row per category (or slice), one column per series. */
export const tabulateChart = (
	model: ChartModel,
	labels: ChartLabels,
	locale: string | undefined,
): DataTableContent => {
	if (model.kind === 'gauge') return { headers: [], rows: [] };

	if (model.kind === 'pie') {
		return {
			headers: [model.categoryLabel ?? labels.category, model.valueLabel, labels.share],
			rows: model.slices.map((slice: PieSlice): string[] => {
				return [slice.name, model.format(slice.value), shareOf(slice, model, locale)];
			}),
		};
	}

	return {
		headers: [
			model.categoryLabel ?? labels.category,
			...model.series.map((series: ModelSeries): string => series.label),
		],
		rows: model.categories.map((category: string, index: number): string[] => {
			return [
				category,
				...model.series.map((series: ModelSeries): string => {
					return valueText(series.values[index] ?? null, series.format, labels);
				}),
			];
		}),
	};
};
