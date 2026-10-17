# Dashboard

The shell and the page patterns of administrative applications (F12), exported by `@midnight-indigo/ui/dashboard`. The
subpath is opt-in: neither the root entry nor any other subpath reaches it (the consumer fixture follows the import
graph of every entry), and it does not load the chart engine either — a chart is passed to it as a child, from
`@midnight-indigo/ui/charts`. It only composes the components of the other subpaths, styled with the theme variables, so
a palette given to `UiProvider` applies to it as to everything else.

| Component         | Use it for                                                                   |
| ----------------- | ---------------------------------------------------------------------------- |
| `DashboardLayout` | The shell: sidebar, top bar, breadcrumbs and the main content, with slots    |
| `PageHeader`      | The title of the page (`h1`), its description and the actions of the page    |
| `FilterBar`       | The fields that narrow what the page shows, as a `search` landmark           |
| `KpiGrid`         | The key figures, a named list of `StatCard` that fits as many per row as fit |
| `DashboardPanel`  | A titled region around a chart, a listing or any other content, with toolbar |

```tsx
import {
	DashboardLayout,
	DashboardPanel,
	FilterBar,
	KpiGrid,
	PageHeader,
} from '@midnight-indigo/ui/dashboard';
import { Chart } from '@midnight-indigo/ui/charts';
import { Breadcrumbs } from '@midnight-indigo/ui/navigation';

<DashboardLayout
	navigation={{ label: 'Main navigation', items: navigationItems, footer: <UserMenu /> }}
	brand={<Logo />}
	topbar={<Notifications />}
	breadcrumbs={<Breadcrumbs items={trail} />}
>
	<PageHeader title='Sales overview' description='Revenue and orders.' actions={<ExportButton />} />

	<FilterBar label='Filters' onClear={clearFilters}>
		<Select label='Region' options={regions} value={region} onValueChange={setRegion} />
	</FilterBar>

	<KpiGrid label='Key figures' items={figures} loading={loading} />

	<DashboardPanel title='Revenue by month' actions={<PeriodSelect />}>
		<Chart chart={revenueChart} title='Revenue by month' hideTitle status={status} />
	</DashboardPanel>

	<DashboardPanel title='Latest orders' toolbar={<SearchField label='Search orders' />}>
		<DataTable caption='Orders' hideCaption columns={columns} rows={orders} status={status} />
	</DashboardPanel>
</DashboardLayout>;
```

## DashboardLayout

| Slot or prop                               | What it holds                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `navigation`                               | `label`, `items` (the entries of `Sidebar`), `footer` and the sidebar `labels`    |
| `brand`                                    | The logo or name: top of the sidebar, and the top bar where the sidebar is hidden |
| `topbar`                                   | The end of the top bar: search, notifications, the user menu                      |
| `breadcrumbs`                              | Above the page, e.g. `Breadcrumbs`                                                |
| `children`                                 | The page                                                                          |
| `sidebarVariant`                           | `collapsible` (default, with the collapse button), `expanded` or `rail` (always)  |
| `collapsed`, `defaultCollapsed`            | The rail of the collapsible sidebar, controlled (with `onCollapsedChange`) or not |
| `navigationOpen`, `onNavigationOpenChange` | The drawer of narrow viewports, controlled or not                                 |
| `permanentFrom`                            | First breakpoint with the sidebar in the page; `expanded` (840 px) by default     |
| `contentSize`                              | Maximum width of the content, a `Container` size; `large` (80 rem) by default     |
| `labels`                                   | `skipToContent`                                                                   |

- **Nothing is fixed.** Links, items, branding, top bar and content are the consumer's; links go through the router of
  `NavigationProvider` (see [navigation.md](./navigation.md#links-and-routers)), so no route is assumed and nothing has
  to be forked. Colors come from the theme.
- **Landmarks.** One `header` (banner) with the top bar, the `nav` of the sidebar named by `navigation.label`, and one
  `main`. Put a single `h1` in the page, e.g. with `PageHeader`.
- **Keyboard.** The first tab stop is a skip link, visible on focus, that moves the focus to `main` (`tabindex="-1"`).
  Then come the brand, the items and the collapse button of the sidebar, the top bar and the page, in reading order.
- **Wide viewports** (from `permanentFrom`): the sidebar is a column that stays in view while the page scrolls (sticky,
  `100dvh`). The top bar is sticky too; without `topbar` content it is hidden there, since the brand and the menu
  button only show on narrow viewports.
- **Narrow viewports**: the sidebar is hidden and the top bar shows the menu button (opening the same items in a modal
  drawer, with the `footer`) and the brand. Choosing an item closes the drawer, and so does growing past the breakpoint.
- **Rail.** In the rail (`rail`, or a collapsed `collapsible`) the `brand` gets 3 rem: give a logo that fits, or hide
  the name with a container query, as the starter does.

## Page patterns

- **`PageHeader`**: `title` (an `h1` by default; `headingLevel` 2 or 3 for a nested page), `description` and
  `actions`, which wrap below the title on narrow viewports.
- **`FilterBar`**: a `form` with `role="search"` named by `label`. Each field takes at least 12 rem and they wrap.
  Pressing Enter in a field never reloads the page (`onSubmit` runs after the default is prevented). `onClear` adds a
  "Clear filters" button (`labels.clear`); `actions` adds others. Filter as the fields change.
- **`KpiGrid`**: a `ul` named by `label`, with a `StatCard` per item (`id` plus the props of a `StatCard`), as many per
  row as `minColumnWidth` (14 rem) allows, the cards of a row with the same height. `loading` shows every value as a
  placeholder and marks each card `aria-busy`. Format the values for the locale; compact notation keeps millions in a
  quarter of the row (`formatCurrency(value, { notation: 'compact' })`).
- **`DashboardPanel`**: a `section` named by its `title` (an `h2` by default), with `description`, `actions` in the
  header, a `toolbar` before the content (the search of a listing) and a `footer` below a line. Give a `Chart` inside it
  `hideTitle` with the same title.

## States

The patterns keep the states of the components they hold, so a page shows loading, empty and error the same way
everywhere:

| State   | Key figures                                                                             | Chart                          | Listing (`DataTable`)          |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------ |
| loading | `KpiGrid loading`                                                                       | `status='loading'`             | `status='loading'`             |
| empty   | zero values, formatted                                                                  | `emptyState` (an `EmptyState`) | `labels.empty` or `emptyState` |
| error   | one `ErrorState` for the whole page, with `onRetry`, instead of an error in every panel |

## Translations

Everything the shell writes itself is translatable, and everything else is given by the application:

| Component         | Texts                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `DashboardLayout` | `labels.skipToContent`; the sidebar texts (`collapse`, `expand`, `close`, `open`) in `navigation.labels` |
| `FilterBar`       | `labels.clear`; the landmark name is `label`                                                             |
| `KpiGrid`         | the list name is `label`; the cards take the `statCard` texts                                            |

`I18nProvider` translates them with the rest of the library (keys `dashboardLayout` and `filterBar`, shipped in pt-BR
and en-US); `defaultDashboardLayoutLabels` and `defaultFilterBarLabels` are the English defaults.

## The demo

`templates/nextjs-starter` (F13) is an application built on this shell: `DashboardLayout` wraps every page of
`app/[locale]` (`src/shell/app-shell.tsx`), with the pages as data, the language links in the top bar and breadcrumbs
from the route. Its home page, `/en-us` (or `/pt-br`), is the sales overview of a fictional retail chain: key figures,
a stacked area chart by region, the latest orders and filters by region and period. The other pages use the same
patterns: orders (`FilterBar`, `DashboardPanel`, `DataTable`), reports (a `Grid` of `DashboardPanel` with charts),
a customer form and a palette editor. See the starter's README.

- **Mock API.** `src/dashboard/demo-data.ts` holds the data (fixed numbers, so the server and the browser agree) and
  `src/dashboard/mock-api.ts` the fake backend, `fetchDashboard(query, scenario, signal)`, with latency and failures.
  The page only depends on it and on its types: replace it with a real request.
- **States.** `?state=loading` never answers, `?state=empty` answers with nothing and `?state=error` fails; a
  `TabNavigation` above the filters links to each.
- **Texts.** Every text comes from `src/messages/en-us.json` and `pt-br.json` (the same keys, checked by a test).

## Tests

Each component is tested with Testing Library and user-event, and audited with axe-core: the landmarks and their
names, the skip link and the focus it moves, the tab order, the three sidebar variants, the drawer at 390 px (Escape,
choosing an item, a controlled drawer, `permanentFrom` across a resize) and the texts by `labels` and by provider. The
consumer fixture renders the compiled shell on the server with its own router link and texts, and follows the import
graph to prove that no other entry reaches `dashboard` and that `dashboard` never reaches `charts`. The browser suite
drives the demo in Chromium: keyboard on desktop, the drawer on a phone, the filters, the three states and axe with
contrast; the starter test checks the shell and the scenario in the streamed HTML.
