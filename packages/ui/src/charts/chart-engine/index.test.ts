// @vitest-environment jsdom
// The real engine, drawing with its SVG renderer (jsdom has no canvas): every factory produces an option that ECharts
// accepts and draws without a warning.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { createChartInstance } from '@/src/charts/chart-engine/index';
import type { ChartEngineInstance } from '@/src/charts/chart-engine/index';
import {
	createAreaChart,
	createBarChart,
	createComposedChart,
	createGaugeChart,
	createLineChart,
	createPieChart,
} from '@/src/charts/chart-factories/index';
import type { ChartDefinition } from '@/src/charts/chart-factories/index';
import { createChartModel } from '@/src/charts/chart-model/index';
import { toEngineOption } from '@/src/charts/chart-option/index';
import type { ChartAppearance, EngineOption } from '@/src/charts/chart-option/index';
import { tokens } from '@/src/tokens/index';

interface Sale {
	month: string;
	revenue: number;
	costs: number | null;
	margin: number;
}

const sales: Sale[] = [
	{ month: 'Jan', revenue: 120, costs: 80, margin: 0.33 },
	{ month: 'Feb', revenue: 150, costs: null, margin: 0.4 },
	{ month: 'Mar', revenue: 90, costs: 70, margin: 0.22 },
	{ month: 'Apr', revenue: 180, costs: 95, margin: 0.47 },
];

const appearance: ChartAppearance = {
	colors: tokens.chart.series,
	tokens,
	patterns: true,
	animation: false,
	selectable: true,
	fontSize: 12,
};

const definitions: [string, ChartDefinition<unknown>][] = [
	[
		'line',
		createLineChart({
			data: sales,
			x: 'month',
			series: [
				{ key: 'revenue', label: 'Revenue' },
				{ key: 'costs', label: 'Costs' },
			],
			interaction: { zoom: true },
		}),
	],
	[
		'stacked area',
		createAreaChart({
			data: sales,
			x: 'month',
			stacked: true,
			series: [
				{ key: 'revenue', label: 'Revenue' },
				{ key: 'costs', label: 'Costs' },
			],
		}),
	],
	[
		'horizontal stacked bar',
		createBarChart({
			data: sales,
			x: 'month',
			orientation: 'horizontal',
			stacked: true,
			series: [
				{ key: 'revenue', label: 'Revenue' },
				{ key: 'costs', label: 'Costs' },
			],
			interaction: { zoom: true },
		}),
	],
	[
		'composed',
		createComposedChart({
			data: sales,
			x: 'month',
			series: [
				{ key: 'revenue', label: 'Revenue', type: 'bar' },
				{ key: 'margin', label: 'Margin', type: 'line', axis: 'secondary' },
			],
		}),
	],
	[
		'donut',
		createPieChart({
			data: sales,
			category: 'month',
			value: 'revenue',
			valueLabel: 'Revenue',
			donut: true,
		}),
	],
	['gauge', createGaugeChart({ value: 62 })],
];

const definitionNamed = (name: string): ChartDefinition<unknown> => {
	const found: [string, ChartDefinition<unknown>] | undefined = definitions.find(
		([candidate]: [string, ChartDefinition<unknown>]): boolean => candidate === name,
	);

	if (found === undefined) throw new Error(`No "${name}" definition.`);
	return found[1];
};

const createElement = (): HTMLDivElement => {
	const element: HTMLDivElement = document.createElement('div');
	Object.defineProperty(element, 'clientWidth', { configurable: true, value: 640 });
	Object.defineProperty(element, 'clientHeight', { configurable: true, value: 320 });
	document.body.append(element);

	return element;
};

const noEvents = { onItemClick: (): void => undefined, onZoom: (): void => undefined };

let warnings: MockInstance<(...data: unknown[]) => void>;
let errors: MockInstance<(...data: unknown[]) => void>;

beforeEach((): void => {
	// jsdom has no canvas: without a context, the engine measures text with its own estimate, silently.
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
	warnings = vi.spyOn(console, 'warn');
	errors = vi.spyOn(console, 'error');
});

afterEach((): void => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe('chart engine adapter', (): void => {
	it.each(definitions)(
		'draws a %s chart from its option',
		(_: string, definition: ChartDefinition<unknown>): void => {
			const element: HTMLDivElement = createElement();
			const instance: ChartEngineInstance = createChartInstance(element, 'svg', noEvents);

			const option: EngineOption = toEngineOption(
				createChartModel(definition, 'en-US'),
				appearance,
				{
					hidden: new Set<string>(),
					zoom: null,
				},
			);

			instance.update(option, true);

			expect(element.querySelector('svg')).not.toBeNull();
			expect(element.querySelectorAll('path').length).toBeGreaterThan(0);
			expect(warnings).not.toHaveBeenCalled();
			expect(errors).not.toHaveBeenCalled();

			instance.dispose();
		},
	);

	it('merges an update, and replaces the option when the chart changes shape', (): void => {
		const element: HTMLDivElement = createElement();
		const instance: ChartEngineInstance = createChartInstance(element, 'svg', noEvents);
		const line: ChartDefinition<unknown> = definitionNamed('line');
		const gauge: ChartDefinition<unknown> = definitionNamed('gauge');
		const view = { hidden: new Set<string>(), zoom: null };

		instance.update(toEngineOption(createChartModel(line, 'en-US'), appearance, view), true);
		instance.update(toEngineOption(createChartModel(line, 'en-US'), appearance, view), false);
		instance.update(toEngineOption(createChartModel(gauge, 'en-US'), appearance, view), true);

		expect(element.textContent).toContain('62');
		expect(element.textContent).not.toContain('Jan');
		expect(errors).not.toHaveBeenCalled();

		instance.dispose();
	});

	it('shows the tooltip of a point on request, and releases the drawing on dispose', (): void => {
		const element: HTMLDivElement = createElement();
		const instance: ChartEngineInstance = createChartInstance(element, 'svg', noEvents);
		const line: ChartDefinition<unknown> = definitionNamed('line');

		instance.update(
			toEngineOption(createChartModel(line, 'en-US'), appearance, {
				hidden: new Set<string>(),
				zoom: null,
			}),
			true,
		);

		instance.showPoint({ category: 2, axis: 'x' });
		expect(element.textContent).toContain('Mar');

		instance.hidePoint();
		instance.dispose();

		expect(element.querySelector('svg')).toBeNull();
	});
});
