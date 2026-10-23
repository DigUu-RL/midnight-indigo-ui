import { describe, expect, it } from 'vitest';

import {
	createBarChart,
	createComposedChart,
	createGaugeChart,
	createLineChart,
	createPieChart,
} from '@/src/charts/chart-factories/index';
import type { ChartDefinition } from '@/src/charts/chart-factories/index';
import { createChartModel } from '@/src/charts/chart-model/index';
import { toEngineOption } from '@/src/charts/chart-option/index';
import type { ChartAppearance, ChartViewState } from '@/src/charts/chart-option/index';
import { tokens } from '@/src/tokens/index';

interface Visit {
	day: string;
	organic: number;
	paid: number | null;
	referral: number;
}

const visits: Visit[] = Array.from({ length: 10 }, (_: unknown, index: number): Visit => {
	return {
		day: `D${String(index + 1)}`,
		organic: 100 + index,
		paid: index === 3 ? null : 50,
		referral: 20,
	};
});

const appearance: ChartAppearance = {
	colors: tokens.chart.series,
	tokens,
	patterns: true,
	animation: true,
	selectable: false,
	fontSize: 12,
};

const allVisible: ChartViewState = { hidden: new Set<string>(), zoom: null };

type OptionRecord = Record<string, unknown> & { series: Record<string, unknown>[] };

const optionOf = (
	definition: ChartDefinition<unknown>,
	view: ChartViewState = allVisible,
	look: ChartAppearance = appearance,
): OptionRecord => {
	return toEngineOption(
		createChartModel(definition, 'en-US'),
		look,
		view,
	) as unknown as OptionRecord;
};

const threeSeries = createLineChart({
	data: visits,
	x: 'day',
	series: [
		{ key: 'organic', label: 'Organic' },
		{ key: 'paid', label: 'Paid' },
		{ key: 'referral', label: 'Referral' },
	],
	interaction: { zoom: true },
});

describe('engine option', (): void => {
	it('gives each series its own color, marker and dash, from the theme tokens', (): void => {
		const { series } = optionOf(threeSeries);

		expect(series.map((entry: Record<string, unknown>): unknown => entry.color)).toEqual(
			tokens.chart.series.slice(0, 3),
		);

		expect(series.map((entry: Record<string, unknown>): unknown => entry.symbol)).toEqual([
			'circle',
			'rect',
			'triangle',
		]);

		expect(series.map((entry: Record<string, unknown>): unknown => entry.lineStyle)).toEqual([
			{ color: tokens.chart.series[0], width: 2, type: 'solid' },
			{ color: tokens.chart.series[1], width: 2, type: [8, 4] },
			{ color: tokens.chart.series[2], width: 2, type: [2, 3] },
		]);
	});

	it('repeats a short custom palette, and keeps gaps as null', (): void => {
		const { series } = optionOf(threeSeries, allVisible, {
			...appearance,
			colors: ['#111111', '#222222'],
		});

		expect(series.map((entry: Record<string, unknown>): unknown => entry.color)).toEqual([
			'#111111',
			'#222222',
			'#111111',
		]);

		expect((series[1]?.data as unknown[])[3]).toBeNull();
	});

	it('hides series through the engine legend, which the chart replaces with buttons', (): void => {
		const { legend } = optionOf(threeSeries, { hidden: new Set<string>(['Paid']), zoom: null });

		expect(legend).toEqual({
			show: false,
			data: ['Organic', 'Paid', 'Referral'],
			selected: { Organic: true, Paid: false, Referral: true },
		});
	});

	it('zooms the category axis with a slider and the wheel, on the requested window', (): void => {
		const zooms = optionOf(threeSeries, { hidden: new Set<string>(), zoom: { start: 2, end: 5 } })
			.dataZoom as Record<string, unknown>[];

		expect(zooms.map((zoom: Record<string, unknown>): unknown => zoom.type)).toEqual([
			'inside',
			'slider',
		]);

		expect(zooms[0]).toMatchObject({
			xAxisIndex: 0,
			startValue: 2,
			endValue: 5,
			zoomOnMouseWheel: 'ctrl',
		});

		expect(
			optionOf(
				createLineChart({ data: visits, x: 'day', series: [{ key: 'organic', label: 'Organic' }] }),
			).dataZoom,
		).toEqual([]);
	});

	it('fills bars with a pattern per series, but not the first, unless patterns are off', (): void => {
		const bars = createBarChart({
			data: visits,
			x: 'day',
			stacked: true,
			series: [
				{ key: 'organic', label: 'Organic' },
				{ key: 'paid', label: 'Paid' },
			],
		});

		const [first, second] = optionOf(bars).series as [
			Record<string, Record<string, unknown>>,
			Record<string, Record<string, unknown>>,
		];

		expect(first.itemStyle?.decal).toBeUndefined();
		expect(second.itemStyle?.decal).toMatchObject({ symbol: 'rect', rotation: Math.PI / 4 });
		expect(second.stack).toBe('total');

		const plain = optionOf(bars, allVisible, { ...appearance, patterns: false })
			.series[1] as Record<string, Record<string, unknown>>;

		expect(plain.itemStyle?.decal).toBeUndefined();
	});

	it('puts the categories on the vertical axis of a horizontal bar chart, first at the top', (): void => {
		const option: OptionRecord = optionOf(
			createBarChart({
				data: visits,
				x: 'day',
				orientation: 'horizontal',
				series: [{ key: 'organic', label: 'Organic' }],
			}),
		);

		expect(option.yAxis).toMatchObject({ type: 'category', inverse: true });
		expect(option.xAxis).toMatchObject({ type: 'value' });
	});

	it('adds a secondary value axis for the series of a composed chart that ask for it', (): void => {
		const option: OptionRecord = optionOf(
			createComposedChart({
				data: visits,
				x: 'day',
				series: [
					{ key: 'organic', label: 'Organic', type: 'bar' },
					{ key: 'referral', label: 'Referral', type: 'line', axis: 'secondary' },
				],
			}),
		);

		expect(option.yAxis).toHaveLength(2);

		expect(
			option.series.map((entry: Record<string, unknown>): unknown => entry.yAxisIndex),
		).toEqual([0, 1]);
	});

	it('names each slice of a pie and colors it from the palette', (): void => {
		const [pie] = optionOf(
			createPieChart({
				data: visits.slice(0, 3),
				category: 'day',
				value: 'organic',
				valueLabel: 'Visits',
			}),
		).series as [Record<string, unknown>];

		expect(pie.data).toEqual([
			{ name: 'D1', value: 100, itemStyle: { color: tokens.chart.series[0] } },
			expect.objectContaining({ name: 'D2', value: 101 }),
			expect.objectContaining({ name: 'D3', value: 102 }),
		]);
	});

	it('draws a gauge with its formatted value and no animation under reduced motion', (): void => {
		const option: OptionRecord = optionOf(
			createGaugeChart({ value: 62, formatValue: (value: number): string => `${String(value)}%` }),
			allVisible,
			{ ...appearance, animation: false },
		);

		const detail = option.series[0]?.detail as { formatter: (value: number) => string };

		expect(option.animation).toBe(false);
		expect(detail.formatter(62)).toBe('62%');
		expect(option.series[0]).toMatchObject({ min: 0, max: 100, data: [{ value: 62 }] });
	});

	it('formats tooltip values with the formatter of each series', (): void => {
		const definition = createLineChart({
			data: visits,
			x: 'day',
			formatValue: (value: number): string => `${String(value)} visits`,
			series: [
				{ key: 'organic', label: 'Organic' },
				{
					key: 'paid',
					label: 'Paid',
					formatValue: (value: number): string => `R$ ${String(value)}`,
				},
			],
		});

		const formatters = optionOf(definition).series.map((entry: Record<string, unknown>) => {
			return (entry.tooltip as { valueFormatter: (value: unknown) => string }).valueFormatter;
		});

		expect(formatters[0]?.(5)).toBe('5 visits');
		expect(formatters[1]?.(5)).toBe('R$ 5');
		expect(formatters[1]?.(null)).toBe('–');
	});
});
