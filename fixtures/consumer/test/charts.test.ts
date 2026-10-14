// Renders the compiled charts on the server, as a consumer's SSR framework would: the title, the legend and the text
// alternatives are in the HTML, and the engine, which only runs in the browser, is not loaded.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	Chart,
	createBarChart,
	createGaugeChart,
	defaultChartLabels,
} from '@midnight-indigo/ui/charts';
import type { BarChartDefinition, ChartProps } from '@midnight-indigo/ui/charts';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

interface Channel {
	name: string;
	visits: number;
	conversions: number;
}

const channels: Channel[] = [
	{ name: 'Organic', visits: 1200, conversions: 80 },
	{ name: 'Paid', visits: 800, conversions: 95 },
];

const chart: BarChartDefinition<Channel> = createBarChart({
	data: channels,
	x: 'name',
	series: [
		{ key: 'visits', label: 'Visits' },
		{ key: 'conversions', label: 'Conversions' },
	],
});

const renderChart = (props: ChartProps<Channel>): string => {
	const element: ReactElement = createElement(Chart<Channel>, props);
	return renderToString(element).replaceAll(/<style[^>]*>.*?<\/style>/gs, '');
};

test('a chart renders its title, legend and summary on the server', (): void => {
	const html: string = renderChart({ chart, title: 'Channels', locale: 'en-US' });

	assert.match(html, /role="figure"/);
	assert.match(html, />Channels</);
	assert.match(html, /aria-pressed="true"[^>]*>.*?Visits/s);
	assert.match(html, /2 categories, from Organic to Paid\./);
	assert.match(html, /Visits ranges from 800 \(Paid\) to 1,200 \(Organic\)\./);
	assert.match(html, new RegExp(defaultChartLabels.showTable));
});

test('a gauge renders its value as text on the server', (): void => {
	const html: string = renderToString(
		createElement(Chart<never>, {
			chart: createGaugeChart({ value: 62 }),
			title: 'Goal',
			locale: 'en-US',
		}),
	);

	assert.match(html, /role="img"/);
	assert.match(html, /62, on a scale from 0 to 100\./);
});
