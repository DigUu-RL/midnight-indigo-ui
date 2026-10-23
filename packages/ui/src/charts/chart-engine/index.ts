// Adapter of Apache ECharts: the only module that loads the engine. `Chart` imports it on demand, so the engine is a
// chunk of its own in the application bundle, loaded when the first chart mounts. Only the chart types and components
// the factories use are registered, which keeps the rest of ECharts out of that chunk.
import { BarChart, GaugeChart, LineChart, PieChart } from 'echarts/charts';
import {
	DataZoomComponent,
	GridComponent,
	LegendComponent,
	TooltipComponent,
} from 'echarts/components';
import { init, use } from 'echarts/core';
import type { EChartsType } from 'echarts/core';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

import type { ChartRenderer, ZoomWindow } from '@/src/charts/chart-factories/index';
import type { EngineOption } from '@/src/charts/chart-option/index';

use([
	BarChart,
	GaugeChart,
	LineChart,
	PieChart,
	DataZoomComponent,
	GridComponent,
	LegendComponent,
	TooltipComponent,
	CanvasRenderer,
	SVGRenderer,
]);

/**
 * A point to show: a category of the axis drawn along `x` or `y`, or a slice of a pie. A category is reached by its
 * position on the axis, which stays right when a long series is drawn from a sample of its points.
 */
export type ChartPoint = { category: number; axis: 'x' | 'y' } | { slice: number };

/** Where the engine reports what the user did with the pointer. */
export interface ChartEngineEvents {
	/** A point, bar or slice was clicked or tapped. */
	onItemClick: (seriesIndex: number, dataIndex: number) => void;
	/** The visible categories changed by the wheel, a pinch or the slider. */
	onZoom: (window: ZoomWindow) => void;
}

export interface ChartEngineInstance {
	/** Applies `option`: merged into the current one, or replacing it when `replace` (the chart changed shape). */
	update: (option: EngineOption, replace: boolean) => void;
	/** Shows the tooltip of one point, as hovering it would; a slice is also highlighted. */
	showPoint: (point: ChartPoint) => void;
	hidePoint: () => void;
	/** Stops observing the size of the element and releases the engine instance. */
	dispose: () => void;
}

interface DataZoomState {
	startValue?: unknown;
	endValue?: unknown;
}

const zoomWindowOf = (instance: EChartsType): ZoomWindow | null => {
	const zooms: unknown = instance.getOption().dataZoom;

	const first: DataZoomState | undefined = Array.isArray(zooms)
		? (zooms[0] as DataZoomState)
		: undefined;

	return typeof first?.startValue === 'number' && typeof first.endValue === 'number'
		? { start: Math.round(first.startValue), end: Math.round(first.endValue) }
		: null;
};

/** Draws into `element`, following its size, and reports the pointer interactions to `events`. */
export const createChartInstance = (
	element: HTMLElement,
	renderer: ChartRenderer,
	events: ChartEngineEvents,
): ChartEngineInstance => {
	const instance: EChartsType = init(element, null, { renderer });
	let highlighted: { seriesIndex: number; dataIndex: number } | null = null;
	let frame: number = 0;

	instance.on('click', (parameters: { seriesIndex?: number; dataIndex?: number }): void => {
		if (parameters.seriesIndex === undefined || parameters.dataIndex === undefined) return;
		events.onItemClick(parameters.seriesIndex, parameters.dataIndex);
	});

	instance.on('datazoom', (): void => {
		const window: ZoomWindow | null = zoomWindowOf(instance);
		if (window !== null) events.onZoom(window);
	});

	// One resize per frame, however many size changes the frame had.
	const observer: ResizeObserver | null =
		typeof ResizeObserver === 'undefined'
			? null
			: new ResizeObserver((): void => {
					cancelAnimationFrame(frame);

					frame = requestAnimationFrame((): void => {
						instance.resize();
					});
				});

	observer?.observe(element);

	const downplay = (): void => {
		if (highlighted === null) return;
		instance.dispatchAction({ type: 'downplay', ...highlighted });
		highlighted = null;
	};

	return {
		update: (option: EngineOption, replace: boolean): void => {
			instance.setOption(option, { notMerge: replace, lazyUpdate: false });
		},
		showPoint: (point: ChartPoint): void => {
			downplay();

			if ('slice' in point) {
				highlighted = { seriesIndex: 0, dataIndex: point.slice };
				instance.dispatchAction({ type: 'highlight', ...highlighted });
				instance.dispatchAction({ type: 'showTip', ...highlighted });
				return;
			}

			const finder: Record<string, number> =
				point.axis === 'x' ? { xAxisIndex: 0 } : { yAxisIndex: 0 };

			const position: number = instance.convertToPixel(finder, point.category);
			const middle: number = (point.axis === 'x' ? element.clientHeight : element.clientWidth) / 2;

			instance.dispatchAction({
				type: 'showTip',
				x: point.axis === 'x' ? position : middle,
				y: point.axis === 'x' ? middle : position,
			});
		},
		hidePoint: (): void => {
			downplay();
			instance.dispatchAction({ type: 'hideTip' });
		},
		dispose: (): void => {
			cancelAnimationFrame(frame);
			observer?.disconnect();
			instance.dispose();
		},
	};
};
