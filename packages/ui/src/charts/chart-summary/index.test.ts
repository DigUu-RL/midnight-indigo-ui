import { describe, expect, it } from 'vitest';

import {
	createGaugeChart,
	createLineChart,
	createPieChart,
} from '#src/charts/chart-factories/index.ts';
import type { ChartDefinition } from '#src/charts/chart-factories/index.ts';
import { defaultChartLabels } from '#src/charts/chart-labels/index.ts';
import { createChartModel, isEmptyModel } from '#src/charts/chart-model/index.ts';
import type { ChartModel } from '#src/charts/chart-model/index.ts';
import { describePoint, summarizeChart, tabulateChart } from '#src/charts/chart-summary/index.ts';

interface Sale {
	month: string;
	revenue: number;
	costs: number | null;
}

const sales: Sale[] = [
	{ month: 'Jan', revenue: 1200, costs: 800 },
	{ month: 'Feb', revenue: 1500, costs: null },
	{ month: 'Mar', revenue: 900, costs: 700 },
];

const lines = createLineChart({
	data: sales,
	x: 'month',
	categoryLabel: 'Month',
	series: [
		{ key: 'revenue', label: 'Revenue' },
		{ key: 'costs', label: 'Costs', formatValue: (value: number): string => `R$ ${String(value)}` },
	],
});

const modelOf = (definition: ChartDefinition<unknown>, locale: string = 'en-US'): ChartModel => {
	return createChartModel(definition, locale);
};

describe('chart summary', (): void => {
	it('tells the extent of the axis and the lowest and highest value of each series', (): void => {
		expect(summarizeChart(modelOf(lines), defaultChartLabels, 'en-US')).toBe(
			[
				'3 categories, from Jan to Mar.',
				'Revenue ranges from 900 (Mar) to 1,500 (Feb).',
				'Costs ranges from R$ 700 (Mar) to R$ 800 (Jan).',
			].join(' '),
		);
	});

	it('formats numbers with the locale of the chart', (): void => {
		expect(summarizeChart(modelOf(lines, 'pt-BR'), defaultChartLabels, 'pt-BR')).toContain(
			'1.500 (Feb)',
		);
	});

	it('tells the share of each slice of a pie, leaving out gaps and negative values', (): void => {
		const pie = createPieChart({
			data: [...sales, { month: 'Apr', revenue: -5, costs: null }],
			category: 'month',
			value: 'costs',
			valueLabel: 'Costs',
		});

		expect(summarizeChart(modelOf(pie), defaultChartLabels, 'en-US')).toBe(
			'Jan: 800 (53.3%). Mar: 700 (46.7%). Total: 1,500.',
		);
	});

	it('tells the value of a gauge on its scale', (): void => {
		expect(
			summarizeChart(modelOf(createGaugeChart({ value: 62 })), defaultChartLabels, 'en-US'),
		).toBe('62, on a scale from 0 to 100.');
	});

	it('describes one point with the values of the visible series', (): void => {
		expect(describePoint(modelOf(lines), 1, new Set<string>(), defaultChartLabels, 'en-US')).toBe(
			'Feb: Revenue: 1,500, Costs: no value (2 of 3)',
		);

		expect(
			describePoint(modelOf(lines), 0, new Set<string>(['Costs']), defaultChartLabels, 'en-US'),
		).toBe('Jan: Revenue: 1,200 (1 of 3)');
	});

	it('lays the data out as a table with a row per category', (): void => {
		expect(tabulateChart(modelOf(lines), defaultChartLabels, 'en-US')).toEqual({
			headers: ['Month', 'Revenue', 'Costs'],
			rows: [
				['Jan', '1,200', 'R$ 800'],
				['Feb', '1,500', 'no value'],
				['Mar', '900', 'R$ 700'],
			],
		});
	});

	it('finds a chart empty when it has only gaps', (): void => {
		const gaps = createLineChart({
			data: [{ month: 'Jan', costs: null }],
			x: 'month',
			series: [{ key: 'costs', label: 'Costs' }],
		});

		expect(isEmptyModel(modelOf(gaps))).toBe(true);
		expect(isEmptyModel(modelOf(createGaugeChart({ value: null })))).toBe(true);
		expect(isEmptyModel(modelOf(lines))).toBe(false);
	});
});
