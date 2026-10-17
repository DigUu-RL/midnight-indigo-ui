# Navigation and layout

Page layout and the ways to move around an application (F08). Layout primitives are exported by
`@midnight-indigo/ui/layout`, navigation by `@midnight-indigo/ui/navigation`, and both by the root entry. Neither
needs the dashboard: they work in any React application. The application shell built on them, `DashboardLayout`, is in
[dashboard.md](./dashboard.md). They follow the conventions of
[components.md](./components.md): theme variables only, and `labels` for every text the component writes itself.

| Component                      | Use it for                                                           | Subpath      |
| ------------------------------ | -------------------------------------------------------------------- | ------------ |
| `Container`                    | Centering a page or section, limiting its width, side gutters        | `layout`     |
| `Stack`                        | A column or a row of elements with a gap from the spacing scale      | `layout`     |
| `Grid`, `GridItem`             | Columns per breakpoint, or as many columns of a minimum width as fit | `layout`     |
| `useBreakpoint`                | Behavior (not looks) that depends on the viewport width              | `layout`     |
| `NavigationProvider`           | Rendering every internal link through the router of the host         | `navigation` |
| `Link`                         | Going to another page or site                                        | `navigation` |
| `Breadcrumbs`                  | The path from the root of the site to the current page               | `navigation` |
| `Tabs`                         | Panels of the same page, one at a time                               | `navigation` |
| `TabNavigation`                | Sections of an area, each its own page, shown as tabs                | `navigation` |
| `Pagination`                   | Moving between the pages of a long list                              | `navigation` |
| `Sidebar`, `SidebarMenuButton` | The main navigation of an application                                | `navigation` |

Menus of actions (`Menu`, `ContextMenu`, with their items) are overlays and live in [feedback.md](./feedback.md#popover-menu-contextmenu-and-tooltip).

## Breakpoints

Five window size classes, mobile first: a value given for a breakpoint applies from its width up, until the next one
given. The values are in [tokens.md](./tokens.md#breakpoints) and exported by `@midnight-indigo/ui/tokens`
(`breakpoints`, `breakpointNames`, `breakpointMediaQuery`).

| Breakpoint   | From    | Typical devices                                |
| ------------ | ------- | ---------------------------------------------- |
| `compact`    | 0       | Phones in portrait                             |
| `medium`     | 600 px  | Tablets in portrait, large phones in landscape |
| `expanded`   | 840 px  | Tablets in landscape, small laptops            |
| `large`      | 1200 px | Desktops                                       |
| `extraLarge` | 1600 px | Wide monitors                                  |

Media queries are written in `em` (`(min-width: 52.5em)` for `expanded`), so a user who enlarges the default text size
gets the layout of a narrower viewport, as with zoom. The Material UI theme created by `UiProvider` switches at the same
widths (`xs`, `sm`, `md`, `lg`, `xl`), so `theme.breakpoints` and `useMediaQuery` in the application agree with the
library.

Responsive props take one value or an object per breakpoint:

```tsx
<Stack direction={{ compact: 'column', medium: 'row' }} gap={{ compact: '3', expanded: '6' }}>
```

They become CSS media queries, rendered on the server, so the first paint is already right at every width.
`useBreakpoint('expanded')` is `false` on the server and during hydration and then follows the viewport: use it only
for behavior that CSS cannot switch, such as closing a drawer once the permanent sidebar is visible.

### Mobile behavior

| Component               | Below the breakpoint                                                                  | Breakpoint                   |
| ----------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| `Container`             | Side gutters of 16 px, then 24 px (`medium`) and 32 px (`expanded`)                   | `medium`, `expanded`         |
| `Grid`                  | The columns you give per breakpoint; `minColumnWidth` never overflows a narrow screen | yours                        |
| `Sidebar`               | Hidden; the same items open in a modal drawer from `SidebarMenuButton`                | `permanentFrom` (`expanded`) |
| `Pagination`            | Previous, next and a `Page 3 of 10` status instead of the page numbers                | `medium`                     |
| `Tabs`, `TabNavigation` | The row scrolls sideways instead of wrapping                                          | —                            |
| `Breadcrumbs`           | The trail wraps; `maxItems` collapses the middle levels into a button                 | —                            |

## Layout

```tsx
import { Container, Grid, GridItem, Stack } from '@midnight-indigo/ui/layout';

<Container as='main' size='large'>
	<Stack gap='6'>
		<h1>Reports</h1>
		<Grid as='ul' columns={{ compact: 1, medium: 2, large: 4 }}>
			<GridItem as='li'>…</GridItem>
			<GridItem as='li' span={{ compact: 'full', large: 2 }}>
				…
			</GridItem>
		</Grid>
	</Stack>
</Container>;
```

- **`Container`**: `size` is the maximum width, `small` 40 rem (forms, reading), `medium` 64 rem, `large` 80 rem
  (default, dashboards) or `full`. `gutters={false}` drops the side padding. `as` picks the element; use `main` once
  per page.
- **`Stack`**: `direction` (`column` by default), `gap` (a spacing step, `'4'` = 16 px by default), `align`, `justify`
  and `wrap`, which lets a row of buttons wrap at high zoom. As `ul` or `ol` it keeps the list semantics without bullets.
- **`Grid`**: either `columns` (equal columns, responsive) or `minColumnWidth` (`'16rem'`: as many as fit, without media
  queries), never both. `GridItem` takes `span`, a number of columns or `'full'`, also responsive.

They are thin and intentional: no margins, no spacing props on every element. Use your own CSS for anything else.

## Links and routers

Every internal link of the library (`Link`, `Breadcrumbs`, `Pagination` with `getPageHref`, `TabNavigation`, `Sidebar`)
is an `<a href>`. Without a provider it is a plain anchor, which loads the page. Give the router of your framework once,
near the root, and they navigate on the client instead. The library never imports Next.js or any router.

```tsx
'use client';
// app/app-navigation-provider.tsx, rendered by the root layout around the page.
import { NavigationProvider } from '@midnight-indigo/ui/navigation';
import NextLink from 'next/link';

export const AppNavigationProvider = ({ children }: { children: ReactNode }) => (
	<NavigationProvider linkComponent={NextLink}>{children}</NavigationProvider>
);
```

The link component must render an `<a>` and forward every prop (`className`, `aria-current`, handlers, `ref`). React
Router's `Link` needs a small adapter that maps `href` to `to`. External links (`Link external`) are always plain
anchors.

## Links, actions and tabs

The element follows what happens, so keyboard and screen readers get the real semantics:

| It…                                  | Element              | Keyboard                        |
| ------------------------------------ | -------------------- | ------------------------------- |
| goes to another page or URL          | link (`<a href>`)    | Tab to it, Enter                |
| does something on this page          | button               | Tab to it, Enter or Space       |
| shows another panel of the same view | `tab` in a `tablist` | one tab stop; arrows, Home, End |

- **`Link`**: `inline` (default) links sit in running text and are always underlined, so they are not told apart by
  color alone; `standalone` links are underlined on hover. `current` sets `aria-current="page"`. `external` opens a new
  tab with `rel="noopener noreferrer"`, an icon and a hidden "(opens in a new tab)".
- **`Breadcrumbs`**: a `nav` landmark ("Breadcrumb") with an ordered list. The last item is the current page
  (`aria-current="page"`, usually without `href`); separators are hidden. `maxItems` keeps the first and the last
  levels and collapses the others into a button; using it reveals them and moves focus to the first revealed link.
- **`Tabs`**: the WAI-ARIA tabs pattern. The row is a single tab stop: Tab enters on the selected tab and leaves for the
  panel. Left and Right (mirrored in right-to-left documents) move between enabled tabs and wrap; Home and End jump to
  the ends. `activation='automatic'` (default) selects on focus; `'manual'` waits for Enter or Space, for slow panels.
  Disabled tabs stay visible and are skipped. Hidden panels unmount unless `keepMounted`.
- **`TabNavigation`**: looks like `Tabs`, but is a `nav` landmark with a list of links, each a tab stop, the current one
  with `aria-current="page"`. Use it when each tab has its own URL; never give links the `tab` role.
- **`Pagination`**: a `nav` landmark ("Pagination"). With `onPageChange` the pages are buttons (the current one
  `aria-current="true"`); with `getPageHref` they are links (`aria-current="page"`). Each is named "Page 4", with the
  number visible. First and last pages and those around the current one are shown, with gaps (`…`, hidden from
  assistive technologies) that never hide a single page, so the controls do not move. On the first and last pages,
  previous and next stay in place, marked `aria-disabled`: a button keeps its focus, a link loses its `href`.

## Sidebar

```tsx
const [mobileOpen, setMobileOpen] = useState(false);

<header>
	<SidebarMenuButton open={mobileOpen} onOpenChange={setMobileOpen} />
</header>
<Sidebar
	label='Main navigation'
	header={<Logo />}
	items={[
		{ id: 'home', label: 'Home', icon: <HomeIcon />, href: '/', current: true },
		{ id: 'reports', label: 'Reports', items: [{ id: 'sales', label: 'Sales', icon: <ChartIcon />, href: '/sales' }] },
		{ id: 'new', label: 'New report', icon: <PlusIcon />, onSelect: openNewReport },
	]}
	mobileOpen={mobileOpen}
	onMobileOpenChange={setMobileOpen}
/>
```

- An item with `href` is a link (`current` marks it); one with only `onSelect` is a button. Groups are lists named by
  their heading.
- From `permanentFrom` (`expanded` by default) the sidebar is a 16 rem column inside a `nav` landmark named by `label`.
  The button at its end collapses it to a 4.5 rem rail of icons (`aria-expanded`, `aria-controls`); `collapsed` and
  `onCollapsedChange` control it, `defaultCollapsed` sets the initial state. `collapsible={false}` removes the button,
  so the sidebar keeps the form given by `collapsed` (always a column, or always a rail).
- In the rail every item keeps its name (the label is visually hidden, not removed) and stays in the tab order. A
  tooltip repeats the name on hover and on keyboard focus; nothing depends on hover. Group headings become lines.
- Below `permanentFrom` the sidebar is not shown. `SidebarMenuButton` (hidden from that breakpoint up) opens the same
  items, always expanded, in a modal drawer titled by `label`: focus moves into it, Tab is contained, Escape and the
  close button close it, and focus returns to the menu button. Choosing an item closes the drawer; so does growing the
  viewport past the breakpoint.

## Translations

Pass the texts in the interface language; everything the components write themselves is in `labels`:

| Component               | Texts                                                                     |
| ----------------------- | ------------------------------------------------------------------------- |
| `Link`                  | `opensInNewTab`                                                           |
| `Breadcrumbs`           | `navigation`, `expand(hiddenCount)`                                       |
| `Pagination`            | `navigation`, `previous`, `next`, `page(page)`, `status(page, pageCount)` |
| `Sidebar`               | `collapse`, `expand`, `close`; the landmark name is `label`               |
| `SidebarMenuButton`     | `label`                                                                   |
| `Tabs`, `TabNavigation` | the landmark or tablist name is `label`                                   |

The defaults (`defaultLinkLabels`, `defaultBreadcrumbsLabels`, `defaultPaginationLabels`, `defaultSidebarLabels`) are
exported in English.

## Tests

Each component test covers its semantics and keyboard contract with Testing Library and user-event and runs axe-core
on the result: landmarks and names, `aria-current`, links versus buttons versus tabs, the roving tab stop and arrow
keys of `Tabs` (wrapping, disabled tabs, manual activation, right-to-left), the breadcrumb expander and its focus,
pagination at the ends, and the sidebar expanded, collapsed (names, tooltips and tab order in the rail) and as a
drawer (focus, Escape, choosing an item, growing past the breakpoint). jsdom has no layout, so `test/viewport.ts`
emulates `matchMedia` and the `@media (min-width)` rules for a chosen width; the responsive components are checked at
390, 1024 and 1280 px and across resizes. The consumer fixture renders the compiled components on the server through a
stand-in router link, and the starter's navigation section (with `next/link`) is checked in its streamed HTML.
