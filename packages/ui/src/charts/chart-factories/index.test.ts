import { describe, expect, expectTypeOf, it } from 'vitest';

import {
	createAreaChart,
	createBarChart,
	createComposedChart,
	createGaugeChart,
	createLineChart,
	createPieChart,
	isCartesian,
} from '@/src/charts/chart-factories/index';
import type {
	BarChartDefinition,
	ChartSeries,
	FieldOf,
	LineChartDefinition,
	PointValue,
} from '@/src/charts/chart-factories/index';

interface Sale {
	month: string;
	revenue: number;
	costs: number | null;
	region: string;
	date: Date;
}

const sales: Sale[] = [
	{ month: 'Jan', revenue: 120, costs: 80, region: 'North', date: new Date(0) },
	{ month: 'Feb', revenue: 150, costs: null, region: 'South', date: new Date(0) },
];

describe('chart factories', (): void => {
	it('infer the datum from the data and accept only fitting fields', (): void => {
		expectTypeOf<FieldOf<Sale, PointValue>>().toEqualTypeOf<'revenue' | 'costs'>();
		expectTypeOf<FieldOf<Sale, string | number>>().toEqualTypeOf<'month' | 'revenue' | 'region'>();

		const chart: LineChartDefinition<Sale> = createLineChart({
			data: sales,
			x: 'month',
			series: [{ key: 'revenue', label: 'Revenue' }],
		});

		expectTypeOf(chart).toEqualTypeOf<LineChartDefinition<Sale>>();
		expectTypeOf<ChartSeries<Sale>['key']>().toEqualTypeOf<'revenue' | 'costs'>();

		// @ts-expect-error A text field cannot be a series.
		createLineChart({ data: sales, x: 'month', series: [{ key: 'region', label: 'Region' }] });

		// @ts-expect-error A date is not a category: format it into a label first.
		createLineChart({ data: sales, x: 'date', series: [{ key: 'revenue', label: 'Revenue' }] });
	});

	it('fill the defaults predictably and freeze the definition', (): void => {
		const chart: BarChartDefinition<Sale> = createBarChart({
			data: sales,
			x: 'month',
			series: [
				{ key: 'revenue', label: 'Revenue' },
				{ key: 'costs', label: 'Costs' },
			],
		});

		expect(chart).toMatchObject({
			type: 'bar',
			orientation: 'vertical',
			stacked: false,
			valueAxis: {},
			interaction: { tooltip: true, legend: true, zoom: false },
		});

		expect(Object.isFrozen(chart)).toBe(true);
		expect(Object.isFrozen(chart.series[0])).toBe(true);
		expect(Object.isFrozen(chart.interaction)).toBe(true);
	});

	it('show the legend by default only with more than one series', (): void => {
		const single: LineChartDefinition<Sale> = createLineChart({
			data: sales,
			x: 'month',
			series: [{ key: 'revenue', label: 'Revenue' }],
		});

		expect(single.interaction.legend).toBe(false);

		expect(
			createAreaChart({
				data: sales,
				x: 'month',
				series: [{ key: 'revenue', label: 'Revenue' }],
				interaction: { legend: true, zoom: true },
			}).interaction,
		).toEqual({ tooltip: true, legend: true, zoom: true });
	});

	it('keep the options of each type', (): void => {
		expect(
			createComposedChart({
				data: sales,
				x: 'month',
				series: [
					{ key: 'revenue', label: 'Revenue', type: 'bar' },
					{ key: 'costs', label: 'Costs', type: 'line', axis: 'secondary' },
				],
				secondaryValueAxis: { label: 'Costs' },
			}),
		).toMatchObject({ type: 'composed', secondaryValueAxis: { label: 'Costs' } });

		const pie = createPieChart({
			data: sales,
			category: 'month',
			value: 'revenue',
			valueLabel: 'Revenue',
		});

		expect(pie).toMatchObject({
			type: 'pie',
			donut: false,
			interaction: { tooltip: true, legend: true, zoom: false },
		});

		expect(isCartesian(pie)).toBe(false);
		expect(createGaugeChart({ value: 40 })).toMatchObject({ minimum: 0, maximum: 100, value: 40 });
	});

	it('reject configurations that cannot be drawn or read', (): void => {
		expect((): unknown => createLineChart({ data: sales, x: 'month', series: [] })).toThrow(
			'A chart needs at least one series.',
		);

		expect((): unknown => {
			return createLineChart({
				data: sales,
				x: 'month',
				series: [
					{ key: 'revenue', label: 'Total' },
					{ key: 'costs', label: 'Total' },
				],
			});
		}).toThrow('The series label "Total" is repeated');

		expect((): unknown => {
			return createLineChart({ data: sales, x: 'month', series: [{ key: 'revenue', label: ' ' }] });
		}).toThrow(TypeError);

		expect((): unknown => createGaugeChart({ value: 1, minimum: 10, maximum: 10 })).toThrow(
			RangeError,
		);

		expect((): unknown => {
			return createPieChart({ data: sales, category: 'month', value: 'revenue', valueLabel: '' });
		}).toThrow(TypeError);
	});
});
