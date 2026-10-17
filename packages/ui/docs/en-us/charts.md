# Charts

Interactive charts built from small, typed configurations (F10). Everything is in `@midnight-indigo/ui/charts`, which is
not re-exported by the root entry. The engine is [Apache ECharts](https://echarts.apache.org/) 6, an optional peer
dependency: install it only if you use charts.

```sh
pnpm add echarts
```

| Factory               | Chart                                             | Interactions                                |
| --------------------- | ------------------------------------------------- | ------------------------------------------- |
| `createLineChart`     | Values along an ordered axis, such as time        | tooltip, legend, zoom, selection            |
| `createAreaChart`     | Like a line, filled; `stacked` adds the series    | tooltip, legend, zoom, selection            |
| `createBarChart`      | Columns or (`orientation: 'horizontal'`) bars     | tooltip, legend, zoom, selection; `stacked` |
| `createComposedChart` | Bars, lines and areas on one axis, two value axes | tooltip, legend, zoom, selection            |
| `createPieChart`      | Share of each part; `donut` draws a ring          | tooltip, legend, selection                  |
| `createGaugeChart`    | One key figure (KPI) on a scale                   | none: its value is text                     |

## Usage

A factory validates its configuration, fills the defaults and returns a frozen definition; `Chart` draws it.

```tsx
import { Chart, createLineChart } from '@midnight-indigo/ui/charts';

interface Sale {
	month: string;
	revenue: number;
	costs: number | null;
}

const salesChart = createLineChart({
	data: sales,
	x: 'month',
	categoryLabel: 'Month',
	series: [
		{ key: 'revenue', label: 'Revenue' },
		{ key: 'costs', label: 'Costs', formatValue: (value) => currency.format(value) },
	],
	interaction: { zoom: true },
});

<Chart chart={salesChart} title='Sales' description='Revenue and costs in 2026.' locale='pt-BR' />;
```

- **Types.** The datum is inferred from `data`: `x` (or `category` of a pie) only accepts fields of `string` or `number`,
  and `key` (or `value`) only numeric fields (`number | null | undefined`). Dates are not categories: format them into
  labels with the locale and time zone of the application (e.g. `useFormatters` of `@midnight-indigo/ui/i18n`).
- **Gaps.** `null`, `undefined` or a non-finite value is a gap: lines break there, and the summary and the table read
  "no value".
- **Validation.** No series, a blank or repeated series label, or a `minimum` not below the `maximum` throws.
- **Stability.** Keep the definition stable between renders (a module constant or `useMemo`): a new definition sends the
  data to the engine again.
- **Not frozen yet.** Brush selection, scatter, heatmap and histogram are not part of this delivery (see the charts
  contract in the wiki).

## Chart props

| Prop                              | Default                 | What it does                                                                       |
| --------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `chart`                           | —                       | The definition.                                                                    |
| `title`                           | —                       | Names the chart (`role="figure"`); `hideTitle` hides it visually.                  |
| `description`                     | —                       | Visible text under the title.                                                      |
| `summary`                         | generated               | Replaces the summary read by assistive technologies.                               |
| `status`                          | `'ready'`               | `'loading'` shows a placeholder, `'error'` the error state (`onRetry`).            |
| `stale`                           | `false`                 | Keeps the chart with a notice that the data may be out of date.                    |
| `emptyState`                      | `EmptyState`            | Shown when there is no data, or only gaps.                                         |
| `height`                          | `'20rem'`               | CSS height of the drawing.                                                         |
| `palette`                         | `chart.series` tokens   | Colors of the series (or slices), repeated when there are more series.             |
| `patterns`                        | `true`                  | A fill pattern per series for bars, areas and slices.                              |
| `renderer`                        | `'canvas'`              | `'svg'` keeps marks sharp and uses less memory; canvas is faster with many points. |
| `dataTable`                       | `true` (not for gauges) | Offers a button that shows the data as a paged table.                              |
| `lazy`                            | `false`                 | Loads the engine and draws only when the chart comes near the viewport.            |
| `locale`                          | runtime locale          | Number format and summary.                                                         |
| `labels`                          | English                 | Texts; see [i18n](./i18n.md).                                                      |
| `onSelect`                        | —                       | Makes points, bars and slices selectable (drill-down): `{ datum, index, series }`. |
| `onZoomChange`                    | —                       | The visible categories (`{ start, end }`), or `null` for all of them.              |
| `onHiddenChange`, `defaultHidden` | —                       | The series (or slices) hidden by the legend.                                       |

## Accessibility

A chart is never accessible only because the engine draws it:

- **Name and summary.** The figure is named by its `title`. The drawing is hidden from assistive technologies, which read
  a generated summary instead: the extent of the axis and the lowest and highest value of each series (or the share of
  each slice, or the value of a gauge on its scale), formatted for the `locale`.
- **Keyboard.** The drawing is focusable. Arrow keys move between points (categories, or the shown slices), Home and End
  reach the first and last; each point shows its tooltip and is announced by a status message with every visible value,
  e.g. "Mar: Revenue: 40, Costs: 30 (3 of 12)". Plus and minus zoom; Enter or Space select (with `onSelect`); Escape
  hides the tooltip. Moving past the zoom window pans it. A gauge has no stops: its value is its description.
- **Buttons.** The legend is a group of toggle buttons (`aria-pressed`), and zoom in, zoom out, show all and the data
  table are buttons, reachable by keyboard and touch. Nothing depends on hover.
- **Not by color alone.** Series differ by color and also by marker shape, line dash and fill pattern; the legend
  swatches repeat them, a hidden series is struck through, and pie slices are labelled by name.
- **Data table.** One button away, the data as a table with a row per category (or slice), paged like a `DataTable`.
- **Touch.** A tap shows the tooltip; a pinch or the slider zooms (the wheel zooms with Ctrl, so the page still
  scrolls).

## Theme and colors

The colors are the `chart.*` tokens of the theme given to `UiProvider` (series, grid, axis, labels, tooltip surface),
read as values because the engine draws on a canvas. The first series takes `chart.series.1`, the official pink, and
each next series the next token; `palette` and a series `color` replace them. Animation stops under reduced motion.

## Performance

- **Bundle.** The `charts` entry does not import the engine: `Chart` loads it with a dynamic `import()`, so the engine is
  a chunk of its own, loaded when the first chart mounts, and only line, bar, pie and gauge with the grid, tooltip,
  legend and data zoom are registered. In the browser suite's Vite build, that chunk is about 203 kB gzip (171 kB
  brotli); the initial chunk of the same page does not contain it. Neither the root entry nor any other subpath reaches
  `charts` (consumer fixture import graph).
- **One instance.** The engine instance is created once and disposed on unmount; new data merges into it, a change of
  legend or zoom sends only that, and a change of chart type replaces the option. The drawing follows the size of its
  container (`ResizeObserver`) without being recreated, and the zoom survives new data.
- **Long series.** Lines and areas are drawn from a sample that keeps their shape (LTTB, about one point per pixel), and
  zooming processes only the visible window. Markers are drawn up to 60 points.
- **Reference datasets** (browser suite, production build, three series): 1 000, 10 000 and 100 000 points per series
  drawn in about 0.4, 0.4 and 0.7 s from the start of the render (engine download included); with 10 000 points,
  moving to the next point, hiding a series and zooming respond in about 100 ms (budget: 200 ms).

## Engine and license

| Package   | Version | License      |
| --------- | ------- | ------------ |
| `echarts` | 6.1     | Apache-2.0   |
| `zrender` | 6.1     | BSD-3-Clause |
| `tslib`   | 2.3     | 0BSD         |

All are in the allowed list of `pnpm check:licenses`. Known limitations: the engine has no keyboard support of its own
(the library adds it as described above); with thousands of points and no zoom, several categories share a pixel, so
the tooltip shows the one drawn there while the announcement stays exact; the engine needs the browser, so on the
server `Chart` renders the title, legend, summary and buttons, and draws after hydration.
