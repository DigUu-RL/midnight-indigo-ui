// Charts drawn by the real engine: a line chart of three series with zoom (the reference dataset), plus a stacked bar
// and a donut. The engine draws after it loads, so the scenario marks `chart-ready` once every chart has its canvas.
import { Chart, createBarChart, createLineChart, createPieChart } from '@midnight-indigo/ui/charts';
import type {
	BarChartDefinition,
	LineChartDefinition,
	PieChartDefinition,
} from '@midnight-indigo/ui/charts';
import { useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';

import { createTraffic } from '#src/datasets.ts';
import type { TrafficPoint } from '#src/datasets.ts';

interface ChartScenarioProps {
	pointCount: number;
}

const channels: readonly { key: 'organic' | 'paid' | 'referral'; label: string }[] = [
	{ key: 'organic', label: 'Organic' },
	{ key: 'paid', label: 'Paid' },
	{ key: 'referral', label: 'Referral' },
];

const chartCount: number = 3;

// The frame after the last canvas appears is painted before the task its callback schedules runs.
const useChartReadySignal = (): void => {
	useEffect((): (() => void) => {
		const signal = (): boolean => {
			if (document.querySelectorAll('canvas').length < chartCount) return false;

			requestAnimationFrame((): void => {
				setTimeout((): void => {
					performance.mark('chart-ready');
					performance.measure('chart-render', 'scenario-start', 'chart-ready');
					document.documentElement.dataset.chartReady = 'true';
				});
			});

			return true;
		};

		const observer: MutationObserver = new MutationObserver((): void => {
			if (signal()) observer.disconnect();
		});

		observer.observe(document.body, { childList: true, subtree: true });

		return (): void => {
			observer.disconnect();
		};
	}, []);
};

export const ChartScenario = ({ pointCount }: ChartScenarioProps): ReactElement => {
	const traffic: TrafficPoint[] = useMemo(
		(): TrafficPoint[] => createTraffic(pointCount),
		[pointCount],
	);

	useChartReadySignal();

	const line: LineChartDefinition<TrafficPoint> = useMemo((): LineChartDefinition<TrafficPoint> => {
		return createLineChart({
			data: traffic,
			x: 'day',
			categoryLabel: 'Day',
			series: channels,
			interaction: { zoom: true },
		});
	}, [traffic]);

	const bars: BarChartDefinition<TrafficPoint> = useMemo((): BarChartDefinition<TrafficPoint> => {
		return createBarChart({
			data: traffic.slice(0, 12),
			x: 'day',
			categoryLabel: 'Day',
			stacked: true,
			series: channels,
		});
	}, [traffic]);

	const donut: PieChartDefinition<TrafficPoint> = useMemo((): PieChartDefinition<TrafficPoint> => {
		return createPieChart({
			data: traffic.slice(0, 5),
			category: 'day',
			value: 'organic',
			valueLabel: 'Organic visits',
			categoryLabel: 'Day',
			donut: true,
		});
	}, [traffic]);

	return (
		<div style={{ display: 'grid', gap: '2rem' }}>
			<Chart chart={line} title='Traffic by channel' locale='en-US' height='24rem' />
			<Chart chart={bars} title='First days' locale='en-US' />
			<Chart chart={donut} title='Organic share' locale='en-US' />
		</div>
	);
};
