// @vitest-environment jsdom
// `Chart` with a stand-in for the engine module, which records what the component asks of it. The real engine is
// tested with these options in `chart-engine`, and in the browser suite.
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { Chart } from '@/src/charts/chart/index';
import type {
	ChartEngineEvents,
	ChartEngineInstance,
	ChartPoint,
} from '@/src/charts/chart-engine/index';
import {
	createGaugeChart,
	createLineChart,
	createPieChart,
} from '@/src/charts/chart-factories/index';
import type {
	LineChartDefinition,
	PieChartDefinition,
	ZoomWindow,
} from '@/src/charts/chart-factories/index';
import type { EngineOption } from '@/src/charts/chart-option/index';

interface FakeInstance {
	instance: ChartEngineInstance;
	events: ChartEngineEvents;
	update: Mock<(option: EngineOption, replace: boolean) => void>;
	showPoint: Mock<(point: ChartPoint) => void>;
	hidePoint: Mock<() => void>;
	dispose: Mock<() => void>;
}

const created: FakeInstance[] = [];

const createChartInstance: Mock<
	(element: HTMLElement, renderer: string, events: ChartEngineEvents) => ChartEngineInstance
> = vi.fn(
	(_element: HTMLElement, _renderer: string, events: ChartEngineEvents): ChartEngineInstance => {
		const fake: FakeInstance = {
			events,
			update: vi.fn(),
			showPoint: vi.fn(),
			hidePoint: vi.fn(),
			dispose: vi.fn(),
			instance: undefined as unknown as ChartEngineInstance,
		};

		fake.instance = {
			update: fake.update,
			showPoint: fake.showPoint,
			hidePoint: fake.hidePoint,
			dispose: fake.dispose,
		};

		created.push(fake);
		return fake.instance;
	},
);

vi.mock('@/src/charts/chart-engine/index', () => ({ createChartInstance }));

interface Sale {
	month: string;
	revenue: number;
	costs: number | null;
}

const sales: Sale[] = [
	{ month: 'Jan', revenue: 120, costs: 80 },
	{ month: 'Feb', revenue: 150, costs: null },
	{ month: 'Mar', revenue: 90, costs: 70 },
	{ month: 'Apr', revenue: 180, costs: 95 },
	{ month: 'May', revenue: 160, costs: 90 },
	{ month: 'Jun', revenue: 200, costs: 110 },
];

const lineOf = (data: Sale[] = sales, zoom: boolean = false): LineChartDefinition<Sale> => {
	return createLineChart({
		data,
		x: 'month',
		categoryLabel: 'Month',
		series: [
			{ key: 'revenue', label: 'Revenue' },
			{ key: 'costs', label: 'Costs' },
		],
		interaction: { zoom },
	});
};

const salesChart: LineChartDefinition<Sale> = lineOf();

const lastInstance = (): FakeInstance => {
	const fake: FakeInstance | undefined = created.at(-1);
	if (fake === undefined) throw new Error('No engine instance was created.');
	return fake;
};

const lastOption = (): Record<string, unknown> => {
	return lastInstance().update.mock.lastCall?.[0] as Record<string, unknown>;
};

const drawn = async (): Promise<FakeInstance> => {
	await waitFor((): void => {
		expect(createChartInstance).toHaveBeenCalled();
	});

	return lastInstance();
};

const surfaceOf = (name: string): HTMLElement => {
	return within(screen.getByRole('figure', { name })).getByRole('group', { name });
};

const status = (): HTMLElement => screen.getByRole('status');

beforeEach((): void => {
	created.length = 0;
	createChartInstance.mockClear();
});

afterEach((): void => {
	cleanup();
});

describe('Chart', (): void => {
	it('is a figure named by its title and described by a summary of the data', async (): Promise<void> => {
		const { container }: RenderResult = render(
			<Chart
				chart={salesChart}
				title='Sales'
				description='Revenue and costs in 2026.'
				locale='en-US'
			/>,
		);

		const surface: HTMLElement = surfaceOf('Sales');

		expect(screen.getByText('Revenue and costs in 2026.')).toBeDefined();
		expect(surface.getAttribute('tabindex')).toBe('0');

		const description: string = (surface.getAttribute('aria-describedby') ?? '')
			.split(' ')
			.map((id: string): string => document.getElementById(id)?.textContent ?? '')
			.join(' ');

		expect(description).toContain('6 categories, from Jan to Jun.');
		expect(description).toContain('Revenue ranges from 90 (Mar) to 200 (Jun).');
		expect(description).toContain('Use the arrow keys to move between points');

		await drawn();
		await expectNoAxeViolations(container);
	});

	it('creates one engine instance, updates it with new data and disposes it on unmount', async (): Promise<void> => {
		const { rerender, unmount }: RenderResult = render(<Chart chart={salesChart} title='Sales' />);
		const fake: FakeInstance = await drawn();

		expect(fake.update).toHaveBeenLastCalledWith(expect.any(Object), true);

		rerender(<Chart chart={salesChart} title='Sales' description='Updated' />);
		rerender(<Chart chart={lineOf(sales.slice(0, 4))} title='Sales' />);

		expect(createChartInstance).toHaveBeenCalledTimes(1);
		expect(fake.update).toHaveBeenLastCalledWith(expect.any(Object), false);

		expect((lastOption().xAxis as { data: string[] }).data).toEqual(['Jan', 'Feb', 'Mar', 'Apr']);

		unmount();
		expect(fake.dispose).toHaveBeenCalledTimes(1);
	});

	it('moves between points with the keyboard, showing and announcing each one', async (): Promise<void> => {
		render(<Chart chart={salesChart} title='Sales' locale='en-US' />);
		const fake: FakeInstance = await drawn();
		const surface: HTMLElement = surfaceOf('Sales');

		surface.focus();
		fireEvent.keyDown(surface, { key: 'ArrowRight' });

		expect(status().textContent).toBe('Jan: Revenue: 120, Costs: 80 (1 of 6)');
		expect(fake.showPoint).toHaveBeenLastCalledWith({ category: 0, axis: 'x' });

		fireEvent.keyDown(surface, { key: 'ArrowRight' });
		expect(status().textContent).toBe('Feb: Revenue: 150, Costs: no value (2 of 6)');

		fireEvent.keyDown(surface, { key: 'End' });
		expect(fake.showPoint).toHaveBeenLastCalledWith({ category: 5, axis: 'x' });

		fireEvent.keyDown(surface, { key: 'ArrowRight' });
		expect(fake.showPoint).toHaveBeenLastCalledWith({ category: 5, axis: 'x' });

		fireEvent.keyDown(surface, { key: 'Home' });
		expect(fake.showPoint).toHaveBeenLastCalledWith({ category: 0, axis: 'x' });

		fireEvent.keyDown(surface, { key: 'Escape' });
		expect(fake.hidePoint).toHaveBeenCalled();
	});

	it('shows and hides series with the legend buttons', async (): Promise<void> => {
		const handleHidden: Mock<(hidden: readonly string[]) => void> = vi.fn();
		render(<Chart chart={salesChart} title='Sales' onHiddenChange={handleHidden} />);
		await drawn();

		const legend: HTMLElement = screen.getByRole('group', { name: 'Series' });
		const costs: HTMLElement = within(legend).getByRole('button', { name: 'Costs' });

		expect(costs.getAttribute('aria-pressed')).toBe('true');

		fireEvent.click(costs);

		expect(costs.getAttribute('aria-pressed')).toBe('false');
		expect(handleHidden).toHaveBeenLastCalledWith(['Costs']);
		expect(lastOption().legend).toMatchObject({ selected: { Revenue: true, Costs: false } });

		const surface: HTMLElement = surfaceOf('Sales');
		fireEvent.keyDown(surface, { key: 'ArrowRight' });

		expect(status().textContent).toBe('Jan: Revenue: 120 (1 of 6)');
	});

	it('zooms with buttons, keys and the engine, keeping the zoom when the data changes', async (): Promise<void> => {
		const handleZoom: Mock<(window: ZoomWindow | null) => void> = vi.fn();

		const { rerender }: RenderResult = render(
			<Chart chart={lineOf(sales, true)} title='Sales' onZoomChange={handleZoom} />,
		);

		const fake: FakeInstance = await drawn();
		const zoomOut: HTMLElement = screen.getByRole('button', { name: 'Zoom out' });

		expect(zoomOut.hasAttribute('disabled')).toBe(true);

		fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

		expect(handleZoom).toHaveBeenLastCalledWith({ start: 1, end: 3 });
		expect(status().textContent).toBe('Showing Feb to Apr.');
		expect((lastOption().dataZoom as object[])[0]).toMatchObject({ startValue: 1, endValue: 3 });

		act((): void => {
			fake.events.onZoom({ start: 2, end: 5 });
		});

		expect(handleZoom).toHaveBeenLastCalledWith({ start: 2, end: 5 });

		rerender(<Chart chart={lineOf([...sales], true)} title='Sales' onZoomChange={handleZoom} />);
		expect((lastOption().dataZoom as object[])[0]).toMatchObject({ startValue: 2, endValue: 5 });

		const surface: HTMLElement = surfaceOf('Sales');
		fireEvent.keyDown(surface, { key: 'Home' });

		expect(handleZoom).toHaveBeenLastCalledWith({ start: 0, end: 3 });

		fireEvent.keyDown(surface, { key: '-' });
		expect(handleZoom).toHaveBeenLastCalledWith(null);

		expect(zoomOut.hasAttribute('disabled')).toBe(true);
		expect(fake.update).toHaveBeenLastCalledWith(expect.any(Object), false);
	});

	it('reports the datum selected by pointer or by Enter', async (): Promise<void> => {
		const handleSelect: Mock = vi.fn();
		render(<Chart chart={salesChart} title='Sales' onSelect={handleSelect} />);
		const fake: FakeInstance = await drawn();

		act((): void => {
			fake.events.onItemClick(1, 2);
		});

		expect(handleSelect).toHaveBeenLastCalledWith({ datum: sales[2], index: 2, series: 'Costs' });

		const surface: HTMLElement = surfaceOf('Sales');
		fireEvent.keyDown(surface, { key: 'ArrowRight' });
		fireEvent.keyDown(surface, { key: 'Enter' });

		expect(handleSelect).toHaveBeenLastCalledWith({ datum: sales[0], index: 0, series: 'Revenue' });

		expect(lastOption().series).toEqual(
			expect.arrayContaining([expect.objectContaining({ cursor: 'pointer' })]),
		);
	});

	it('selects slices of a pie by the position of their datum, skipping hidden slices', async (): Promise<void> => {
		const handleSelect: Mock = vi.fn();

		const pie: PieChartDefinition<Sale> = createPieChart({
			data: sales,
			category: 'month',
			value: 'costs',
			valueLabel: 'Costs',
		});

		render(
			<Chart
				chart={pie}
				title='Costs'
				onSelect={handleSelect}
				defaultHidden={['Jan']}
				locale='en-US'
			/>,
		);

		await drawn();

		const surface: HTMLElement = surfaceOf('Costs');
		fireEvent.keyDown(surface, { key: 'ArrowRight' });

		expect(status().textContent).toBe('Mar: Costs: 70, Share: 15.7% (2 of 5)');
		expect(lastInstance().showPoint).toHaveBeenLastCalledWith({ slice: 1 });

		fireEvent.keyDown(surface, { key: 'Enter' });
		expect(handleSelect).toHaveBeenLastCalledWith({ datum: sales[2], index: 2, series: undefined });
	});

	it('shows the data as a table on request', async (): Promise<void> => {
		render(<Chart chart={salesChart} title='Sales' locale='en-US' />);
		await drawn();

		const toggle: HTMLElement = screen.getByRole('button', { name: 'Show data table' });
		expect(toggle.getAttribute('aria-expanded')).toBe('false');

		fireEvent.click(toggle);

		const table: HTMLElement = screen.getByRole('table', { name: 'Sales' });

		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(toggle.textContent).toBe('Hide data table');

		expect(
			within(table)
				.getAllByRole('columnheader')
				.map((cell: HTMLElement): string => cell.textContent),
		).toEqual(['Month', 'Revenue', 'Costs']);

		expect(within(table).getByRole('rowheader', { name: 'Feb' }).parentElement?.textContent).toBe(
			'Feb150no value',
		);
	});

	it('shows a placeholder while loading, without loading the engine', (): void => {
		render(<Chart chart={salesChart} title='Sales' status='loading' />);

		expect(screen.getByRole('figure', { name: 'Sales' }).getAttribute('aria-busy')).toBe('true');
		expect(status().textContent).toBe('Loading chart');
		expect(screen.queryByRole('group', { name: 'Sales' })).toBeNull();
		expect(createChartInstance).not.toHaveBeenCalled();
	});

	it('shows the error state with a retry, and the empty state without data', (): void => {
		const handleRetry: Mock<() => void> = vi.fn();

		const { rerender }: RenderResult = render(
			<Chart chart={salesChart} title='Sales' status='error' onRetry={handleRetry} />,
		);

		expect(screen.getByRole('alert').textContent).toContain('The chart could not be loaded');

		fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
		expect(handleRetry).toHaveBeenCalledTimes(1);

		rerender(<Chart chart={lineOf([])} title='Sales' />);

		expect(screen.getByText('No data to show')).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Show data table' })).toBeNull();
	});

	it('keeps drawing stale data, with a notice', async (): Promise<void> => {
		render(<Chart chart={salesChart} title='Sales' stale />);

		expect(screen.getByText('This data may be out of date')).toBeDefined();
		await drawn();
	});

	it('draws a gauge as an image described by its value, without keyboard stops', async (): Promise<void> => {
		const { container }: RenderResult = render(
			<Chart chart={createGaugeChart({ value: 62 })} title='Goal' locale='en-US' />,
		);

		const image: HTMLElement = screen.getByRole('img', { name: 'Goal' });

		expect(image.hasAttribute('tabindex')).toBe(false);

		expect(document.getElementById(image.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
			'62, on a scale from 0 to 100.',
		);

		expect(screen.queryByRole('button')).toBeNull();

		await drawn();
		await expectNoAxeViolations(container);
	});

	it('takes its texts from labels, for translation', (): void => {
		render(
			<Chart
				chart={salesChart}
				title='Vendas'
				labels={{ showTable: 'Mostrar tabela de dados', legend: 'Séries' }}
			/>,
		);

		expect(screen.getByRole('button', { name: 'Mostrar tabela de dados' })).toBeDefined();
		expect(screen.getByRole('group', { name: 'Séries' })).toBeDefined();
	});

	it('waits until it comes near the viewport when lazy', async (): Promise<void> => {
		let reportIntersection: (visible: boolean) => void = (): void => undefined;

		class FakeIntersectionObserver {
			constructor(callback: IntersectionObserverCallback) {
				reportIntersection = (visible: boolean): void => {
					callback(
						[{ isIntersecting: visible } as IntersectionObserverEntry],
						this as unknown as IntersectionObserver,
					);
				};
			}

			observe(): void {
				// Intersections are reported by the test.
			}

			disconnect(): void {
				// Nothing is observed.
			}
		}

		vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
		render(<Chart chart={salesChart} title='Sales' lazy />);

		await new Promise((resolve: (value: unknown) => void): void => {
			setTimeout(resolve, 20);
		});

		expect(createChartInstance).not.toHaveBeenCalled();

		act((): void => {
			reportIntersection(true);
		});

		await drawn();
		vi.unstubAllGlobals();
	});
});
