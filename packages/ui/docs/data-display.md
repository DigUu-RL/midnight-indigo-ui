# Data display

Tables, lists, key figures and the loading, empty and error states of administrative data (F09). Everything is in
`@midnight-indigo/ui/data-display` (also re-exported by the root entry) and styled only with the theme variables. Cards,
chips, badges, avatars and the base `Skeleton` are described in [components.md](./components.md).

| Component                                                                                     | Use it for                                                                             |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Table`, `TableHead`, `TableBody`, `TableFooter`, `TableRow`, `TableHeaderCell`, `TableCell`  | Any tabular data, with your own markup and state.                                      |
| `DataTable`                                                                                   | Records with sorting, a text filter, pagination and the three states, from one config. |
| `List`, `ListItem`                                                                            | Records read one by one (people, activity), not compared column by column.             |
| `StatCard`                                                                                    | Key figures (KPIs) of a dashboard.                                                     |
| `EmptyState`, `ErrorState`                                                                    | Nothing to show, or the content could not be loaded.                                   |
| `SkeletonText`, `SkeletonList`                                                                | Placeholders of a paragraph or a list while it loads.                                  |
| `sortRows`, `filterRows`, `createSearchIndex`, `pageRows`, `pageCountOf`, `createRowCollator` | The processing of `DataTable`, for your own table or for a server.                     |

## Table primitives

Native `<table>` elements: the semantics come from HTML, so screen readers announce the headers of each cell.

```tsx
<Table caption='Invoices'>
	<TableHead>
		<TableRow>
			<TableHeaderCell>Invoice</TableHeaderCell>
			<TableHeaderCell align='end'>Total</TableHeaderCell>
		</TableRow>
	</TableHead>
	<TableBody>
		<TableRow>
			<TableHeaderCell scope='row'>INV-1001</TableHeaderCell>
			<TableCell align='end'>R$ 120,00</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

- **Name.** `caption` is required and rendered as `<caption>`; `hideCaption` hides it visually and keeps the name.
- **Headers.** `TableHeaderCell` has `scope="col"` by default; use `scope="row"` for the cell that identifies a row.
- **Alignment.** `align='end'` for numbers; the table uses tabular figures, so digits line up from row to row.
- **Density.** `comfortable` (default) or `compact`, for every cell of the table.
- **Narrow viewports.** The table scrolls sideways inside its container instead of the page. While the columns
  overflow, the container becomes a region named by the caption with `tabindex="0"`, so it can be scrolled with the
  keyboard (WCAG 2.1.1); when everything fits it is not a tab stop.
- **Sorting.** `onSort` turns a header into a button named by the header text; `sortDirection` sets `aria-sort` on the
  sorted column only, and an arrow repeats it visually. The parent sorts the rows.

## DataTable

```tsx
const columns: DataTableColumn<Invoice>[] = [
	{
		id: 'id',
		header: 'Invoice',
		rowHeader: true,
		cell: (invoice) => invoice.id,
		sortValue: (invoice) => invoice.id,
		filterValue: (invoice) => invoice.id,
	},
	{
		id: 'total',
		header: 'Total',
		align: 'end',
		cell: (invoice) => currency.format(invoice.total),
		sortValue: (invoice) => invoice.total,
	},
];

<DataTable
	caption='Invoices'
	columns={columns}
	rows={invoices}
	getRowId={(invoice) => invoice.id}
	filter={searchText}
	locale='pt-BR'
	defaultSort={{ columnId: 'total', direction: 'descending' }}
/>;
```

Keep `columns` stable (a module constant or `useMemo`): the search index is built once per list of rows and columns.

### Sorting, filtering and pagination

| Feature    | Client (`processing="client"`, default)                                                                        | Server (`processing="server"`)                         |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Sorting    | Columns with `sortValue`. Text by the locale, ignoring case and accents, numbers inside text in numeric order. | Columns with `sortable: true`; `onSortChange` reports. |
| Filtering  | `filter`: rows whose `filterValue` contain every word, ignoring case and accents. Typing stays responsive.     | Not applied: filter on the server.                     |
| Pagination | `pageSize` rows per page (default 10), with `Pagination`.                                                      | `rows` is the page, `rowCount` the total.              |

- Sorting, page and filter are controlled (`sort`/`onSortChange`, `page`/`onPageChange`) or uncontrolled
  (`defaultSort`, `defaultPage`); the filter is always given by the parent, which renders the field (for example a
  `SearchField` inside a `<form role="search">`).
- Each header toggles between ascending and descending. Empty values go last in both directions; equal values keep
  their order.
- Sorting returns to the first page (and calls `onPageChange(1)`). A new filter returns an uncontrolled page to the
  first one; a controlled page is clamped to the last page, and the parent may reset it.

### What assistive technologies get

- Real table semantics: caption, `scope` on every header, `rowHeader` columns as `<th scope="row">`.
- Sorted column: `aria-sort`; sort buttons keep the focus after sorting.
- With more than one page, `aria-rowcount` on the table (all rows plus the header) and `aria-rowindex` on each row, so
  the position in the whole set is announced, not only in the page.
- A polite status message (`role="status"`), empty until the user changes something, announces after each change:
  `Sorted by Total, descending`, `Rows 11 to 20 of 42`, `4 rows`, and `Loading rows` while loading.
- No `role="grid"`: cells are not navigable with arrow keys. The interactive parts are the sort buttons, the pagination
  and whatever the cells hold, all in the tab order (WAI-ARIA recommends a grid only for cell-by-cell editing).

### States

| `status`  | What is shown                                                                                      | How it is told apart                                                   |
| --------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `loading` | Headers and up to 5 placeholder rows (hidden from assistive technologies); no pagination.          | `aria-busy` on the table and the `loading` text in the status message. |
| `ready`   | The rows; with none, `EmptyState` with `empty` (no rows) or `noResults` (the filter matches none). | Neutral inbox glyph and its title; the new count is announced.         |
| `error`   | `ErrorState` with `error`, `errorDescription` and a retry button when `onRetry` is given.          | Error glyph and color, `role="alert"`.                                 |

`emptyState` replaces the default empty content, e.g. with an `EmptyState` that has an action.

### Texts

Every text the table writes comes from `labels` (`defaultDataTableLabels`): `loading`, `empty`, `noResults`, `error`,
`retry`, `sorted(column, direction)`, `rowRange(first, last, total)`, `resultCount(count)` and `pagination(caption)`
(name of the pagination landmark, so that several tables on a page have different ones). `paginationLabels` overrides
the texts of the pagination itself. Headers and the caption are given by the application, already translated.

## Large datasets

`DataTable` renders only the rows of the current page, so the size of the DOM does not grow with the data. The
performance suite (`pnpm test:performance`, files `*.performance.test.ts(x)`) holds this with counts that do not
depend on the machine: the same number of elements for 1 000 and 100 000 rows, the searchable texts read once (not
again on sorting, paging or filtering), each sort value read once per sort, cells rendered only for the page, one
React commit per sort or page change and at most two per new filter.

Processing, timed in Node (`row-processing/index.performance.test.ts`); budgets are about four times the laptop time:

| Operation                           | 10 000 rows       | 100 000 rows    | 1 000 000 rows  |
| ----------------------------------- | ----------------- | --------------- | --------------- |
| Sort by text (`Intl.Collator`)      | ~50 ms (250 ms)   | ~740 ms (3 s)   | not budgeted    |
| Sort by number                      | ~11 ms            | ~90 ms (400 ms) | ~830 ms (4 s)   |
| Build the search index              | ~8 ms             | ~75 ms (400 ms) | ~950 ms         |
| Filter with the index already built | ~2 ms (25 ms)     | ~17 ms (100 ms) | ~75 ms (400 ms) |
| Slice a page                        | constant (< 1 ms) | constant        | constant        |

The whole table, timed in Chromium on the production build (`fixtures/browser`, `pnpm test:browser`). Interaction
latency is measured like Interaction to Next Paint, from the input to the next frame painted, and must stay under
200 ms ("good" by the Core Web Vitals):

| Scenario                                     | Measured (laptop)   |
| -------------------------------------------- | ------------------- |
| 10 000 rows on the client: first render      | ~140–210 ms         |
| 10 000 rows: sort by text / by number        | ~80–130 ms / ~32 ms |
| 10 000 rows: next page / typing a filter     | ~32 ms / ~40–48 ms  |
| 10 000 000 rows by a server: render / paging | ~90 ms / ~32–48 ms  |

Filtering follows `useDeferredValue`, so the field stays responsive while the rows update. **Supported on the client:
up to about 10 000 rows.** Beyond that, or when the data does not fit in memory, use `processing="server"`: the server
sorts, filters and pages, and the table renders what it receives — 10 000 000 rows page as fast as 100. `sortRows` and
`filterRows` are exported for a server written in TypeScript; sorting text with `Intl.Collator` is what limits them
(about 7 s for 1 000 000 rows), so sort large text columns in the database.

### Not in this first delivery

These are not supported yet; nothing in the API pretends otherwise:

- virtualization (rendering only the visible rows of a long, unpaginated table) and infinite scroll;
- row selection, expandable rows, inline editing and cell-by-cell keyboard navigation (`role="grid"`);
- sorting by more than one column, per-column filters, column resizing, reordering, hiding and pinning;
- sticky headers (a header that stays visible while the page scrolls).

Advanced tables with these features exist under commercial licenses (for example the Pro and Premium plans of MUI X
Data Grid); the library does not use them. The community `@mui/x-data-grid` is MIT, but it is not a dependency either:
`DataTable` keeps the library's markup and API.

## Lists

`List` is a `<ul>` (or `<ol>` with `ordered`) with dividers by default (`divided={false}` removes them). `ListItem` has a
`title`, an optional `description`, and `leading` and `trailing` slots. Put links and buttons in the title or in
`trailing`, not around the whole item. While loading, show `SkeletonList`.

## Key figures

```tsx
<StatCard
	label='Revenue'
	value={currency.format(48_210)}
	change={{ value: '12%', trend: 'up' }}
	description='vs. last month'
/>
```

- A group named by `label` (`role="group"`), with the value in the `display` type role.
- The change shows an arrow **and** a hidden word (`Up`, `Down`, `No change` from `labels`), so its direction never
  rests on color. Its color follows `sentiment`: `positive` (`intent.success.text`, default for `up`), `negative`
  (`intent.error.text`, default for `down`) or `neutral`; a rising cost is `{ trend: 'up', sentiment: 'negative' }`.
- `loading` replaces the value and the change with a placeholder and marks the group `aria-busy`.
- Format the value and the change for the locale before passing them (for example with `Intl.NumberFormat`).

## Empty, error and loading states

| Component      | Role                  | Look                                     | Texts                                   |
| -------------- | --------------------- | ---------------------------------------- | --------------------------------------- |
| `EmptyState`   | none (static content) | Muted inbox glyph                        | `title`, `description`, `action`        |
| `ErrorState`   | `alert` (`announce`)  | Error glyph in `intent.error.text`       | `title`, `description`, `labels.retry`  |
| `SkeletonText` | `status`              | `lines` placeholder lines                | `label` (default `defaultLoadingLabel`) |
| `SkeletonList` | `status`              | `items` rows, `withLeading` adds circles | `label`                                 |

- The three are distinguishable without color: different glyphs, different texts and different roles.
- `title` is a paragraph by default, for states inside a card or a table; `headingLevel` makes it a heading when the
  state replaces a whole section.
- `ErrorState` takes `onRetry` (a `Try again` button) or any `action`. Set `announce={false}` for an error rendered by
  the server with the page.
- The skeleton layouts announce their `label` once and hide the placeholders. To keep the real layout while loading,
  use `Skeleton` directly and mark the region `aria-busy="true"`.
