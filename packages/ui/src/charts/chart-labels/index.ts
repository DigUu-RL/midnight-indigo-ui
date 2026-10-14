// Texts of `Chart`: its states, controls and text alternatives. Translate them with the rest of the interface, through
// the `labels` prop or the `chart` messages of `I18nProvider`.

/** Texts of the chart. Each function returns a whole sentence, so a translation can reorder its parts. */
export interface ChartLabels {
	/** Announced while the data loads. */
	loading: string;
	/** Title of the empty state: no data, or only gaps. */
	empty: string;
	/** Title of the error state, also used when the chart engine fails to load. */
	error: string;
	/** Text of the retry button of the error state. */
	retry: string;
	/** Notice shown while `stale` is set. */
	stale: string;
	/** Name of the group of legend buttons. */
	legend: string;
	/** Text of the button that shows the data table. */
	showTable: string;
	/** Text of the button that hides the data table. */
	hideTable: string;
	/** Header of the first column of the data table, when the definition has no `categoryLabel`. */
	category: string;
	/** Header of the share of each slice of a pie. */
	share: string;
	zoomIn: string;
	zoomOut: string;
	/** Text of the button that shows every category again. */
	resetZoom: string;
	/** How to explore the chart with the keyboard. */
	navigationHelp: string;
	/** How to zoom with the keyboard, when the chart zooms. */
	zoomHelp: string;
	/** How to select a point with the keyboard, when the chart has `onSelect`. */
	selectHelp: string;
	/** Read in place of a missing value. */
	noValue: string;
	/** One value of a point, e.g. "Revenue: R$ 10". */
	seriesValue: (series: string, value: string) => string;
	/** Announced on reaching a point with the keyboard; `values` is the list of `seriesValue`. */
	point: (category: string, values: string, position: number, total: number) => string;
	/** First sentence of the summary of a chart with an axis. */
	categoryRange: (count: number, first: string, last: string) => string;
	/** Summary of one series: its lowest and highest values, and where they are. */
	seriesRange: (
		series: string,
		lowest: string,
		lowestCategory: string,
		highest: string,
		highestCategory: string,
	) => string;
	/** Summary of a series that has only gaps. */
	seriesNoValues: (series: string) => string;
	/** Summary of one slice of a pie. */
	slice: (category: string, value: string, share: string) => string;
	/** Last sentence of the summary of a pie. */
	total: (value: string) => string;
	/** Summary of a gauge. */
	gauge: (value: string, minimum: string, maximum: string) => string;
	/** Announced after zooming. */
	zoomRange: (first: string, last: string) => string;
}

// The English defaults format their counts as the {{count, number}} of the messages do in n-US.
const englishNumber: Intl.NumberFormat = new Intl.NumberFormat('en-US');

export const defaultChartLabels: Readonly<ChartLabels> = Object.freeze({
	loading: 'Loading chart',
	empty: 'No data to show',
	error: 'The chart could not be loaded',
	retry: 'Try again',
	stale: 'This data may be out of date',
	legend: 'Series',
	showTable: 'Show data table',
	hideTable: 'Hide data table',
	category: 'Category',
	share: 'Share',
	zoomIn: 'Zoom in',
	zoomOut: 'Zoom out',
	resetZoom: 'Show all',
	navigationHelp:
		'Use the arrow keys to move between points, and Home or End to reach the first or the last.',
	zoomHelp: 'Press plus or minus to zoom.',
	selectHelp: 'Press Enter to select the point.',
	noValue: 'no value',
	seriesValue: (series: string, value: string): string => `${series}: ${value}`,
	point: (category: string, values: string, position: number, total: number): string => {
		return `${category}: ${values} (${englishNumber.format(position)} of ${englishNumber.format(total)})`;
	},
	categoryRange: (count: number, first: string, last: string): string => {
		return count === 1
			? `1 category: ${first}.`
			: `${englishNumber.format(count)} categories, from ${first} to ${last}.`;
	},
	seriesRange: (
		series: string,
		lowest: string,
		lowestCategory: string,
		highest: string,
		highestCategory: string,
	): string => {
		return `${series} ranges from ${lowest} (${lowestCategory}) to ${highest} (${highestCategory}).`;
	},
	seriesNoValues: (series: string): string => `${series} has no values.`,
	slice: (category: string, value: string, share: string): string => {
		return `${category}: ${value} (${share}).`;
	},
	total: (value: string): string => `Total: ${value}.`,
	gauge: (value: string, minimum: string, maximum: string): string => {
		return `${value}, on a scale from ${minimum} to ${maximum}.`;
	},
	zoomRange: (first: string, last: string): string => `Showing ${first} to ${last}.`,
});
