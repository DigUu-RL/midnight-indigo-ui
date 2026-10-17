# Design tokens

<!-- Generated from `src/tokens` by `pnpm --filter @midnight-indigo/ui generate:tokens`. Do not edit by hand. -->

Midnight Indigo: UI is dark-only: there is no light palette and no light/dark toggle.
Every token is exported by `@midnight-indigo/ui/tokens` and declared as a CSS custom property in
`@midnight-indigo/ui/styles.css`. Components reference tokens, never hexadecimal values.

`intent.official.main` and `color.pink.400` are the exact Midnight Indigo keyword pink, `#FF6AC1`. The other
intent `main` values are provisional proposals until the stable API.

How to apply the typography, icon and motion tokens: [foundations.md](./foundations.md). How to use the color
scales: [palette.md](./palette.md).

## Tokens

### `color`

Fixed color scales of the project identity, from the lightest step to the darkest. A theme palette does not change them; prefer the semantic groups in components.

#### `color.pink`

Brand pink, built around the official pink `#FF6AC1`.

| Step | CSS variable | Value | Role |
| --- | --- | --- | --- |
| `50` | `--mi-color-pink-50` | `#FFF3FA` |  |
| `100` | `--mi-color-pink-100` | `#FFE4F4` |  |
| `200` | `--mi-color-pink-200` | `#FFCCEA` |  |
| `300` | `--mi-color-pink-300` | `#FF93D0` | Hover of the official pink. |
| `400` | `--mi-color-pink-400` | `#FF6AC1` | Official pink, identical to `intent.official.main` of the official theme. |
| `500` | `--mi-color-pink-500` | `#D258A1` |  |
| `600` | `--mi-color-pink-600` | `#A54581` |  |
| `700` | `--mi-color-pink-700` | `#783360` |  |
| `800` | `--mi-color-pink-800` | `#502344` |  |
| `900` | `--mi-color-pink-900` | `#32162E` |  |
| `950` | `--mi-color-pink-950` | `#1E0E20` |  |

#### `color.indigo`

Identity indigo, for solid fills, active borders, text and icons.

| Step | CSS variable | Value | Role |
| --- | --- | --- | --- |
| `50` | `--mi-color-indigo-50` | `#F6F4FF` |  |
| `100` | `--mi-color-indigo-100` | `#EBE7FE` |  |
| `200` | `--mi-color-indigo-200` | `#D2CAFD` |  |
| `300` | `--mi-color-indigo-300` | `#8F7AFB` | Indigo text and icons. |
| `400` | `--mi-color-indigo-400` | `#7560F0` | Hover of the solid indigo and active border. |
| `500` | `--mi-color-indigo-500` | `#5E48D6` | Solid indigo, identical to `intent.brand.main` of the official theme. |
| `600` | `--mi-color-indigo-600` | `#4C3AAE` |  |
| `700` | `--mi-color-indigo-700` | `#3A2D86` |  |
| `800` | `--mi-color-indigo-800` | `#2A2162` |  |
| `900` | `--mi-color-indigo-900` | `#1E1746` |  |
| `950` | `--mi-color-indigo-950` | `#130F2E` |  |

#### `color.midnight`

Neutral with an indigo hue, the source of every surface, border and state value.

| Step | CSS variable | Value | Role |
| --- | --- | --- | --- |
| `50` | `--mi-color-midnight-50` | `#F2EFFC` |  |
| `100` | `--mi-color-midnight-100` | `#C3BDDC` |  |
| `150` | `--mi-color-midnight-150` | `#ABA4C9` |  |
| `200` | `--mi-color-midnight-200` | `#9790B8` |  |
| `250` | `--mi-color-midnight-250` | `#6E62A3` |  |
| `300` | `--mi-color-midnight-300` | `#453C7A` |  |
| `350` | `--mi-color-midnight-350` | `#2C2558` |  |
| `400` | `--mi-color-midnight-400` | `#251C5C` |  |
| `450` | `--mi-color-midnight-450` | `#1E1940` |  |
| `500` | `--mi-color-midnight-500` | `#1B1638` |  |
| `550` | `--mi-color-midnight-550` | `#1B1540` |  |
| `600` | `--mi-color-midnight-600` | `#17132F` |  |
| `650` | `--mi-color-midnight-650` | `#13102B` |  |
| `700` | `--mi-color-midnight-700` | `#0F0C24` |  |
| `750` | `--mi-color-midnight-750` | `#0A0819` |  |
| `800` | `--mi-color-midnight-800` | `#080615` |  |
| `850` | `--mi-color-midnight-850` | `#05040E` |  |

### `surface`

Background layers, from the darkest to the lightest; each one is lighter than the layer below it.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `surface.canvas` | `--mi-surface-canvas` | `#05040E` | Main application background. |
| `surface.field` | `--mi-surface-field` | `#080615` | Background of inputs and choice controls, and of recessed areas such as code blocks. |
| `surface.sidebar` | `--mi-surface-sidebar` | `#0A0819` | Sidebar, top bar and other navigation structure. |
| `surface.tableHeader` | `--mi-surface-table-header` | `#0F0C24` | Header row of tables, recessed below the raised body. |
| `surface.raised` | `--mi-surface-raised` | `#13102B` | Cards, panels and tables. |
| `surface.dialog` | `--mi-surface-dialog` | `#17132F` | Dialogs and drawers. |
| `surface.overlay` | `--mi-surface-overlay` | `#1B1638` | Menus, popovers, tooltips and toasts, the lightest layer. |

#### Surface layers

From the darkest to the lightest. Each layer is lighter than the one below it (checked in CI); the difference is
small by design, so a layer that must stand out from its neighbor also takes a border or an elevation.

| Layer | Value | Relative luminance | Step over the layer below | Ratio to the layer below |
| --- | --- | --- | --- | --- |
| `surface.canvas` | `#05040E` | 0.00151 | — | — |
| `surface.field` | `#080615` | 0.00236 | +0.00085 | 1.01:1 |
| `surface.sidebar` | `#0A0819` | 0.00308 | +0.00072 | 1.01:1 |
| `surface.tableHeader` | `#0F0C24` | 0.00492 | +0.00183 | 1.03:1 |
| `surface.raised` | `#13102B` | 0.00683 | +0.00192 | 1.03:1 |
| `surface.dialog` | `#17132F` | 0.00853 | +0.00170 | 1.02:1 |
| `surface.overlay` | `#1B1638` | 0.01092 | +0.00239 | 1.04:1 |

### `text`

Text colors by emphasis.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `text.primary` | `--mi-text-primary` | `#F2EFFC` | Body text and headings. |
| `text.secondary` | `--mi-text-secondary` | `#C3BDDC` | Supporting text and descriptions. |
| `text.muted` | `--mi-text-muted` | `#9790B8` | Placeholders, hints and captions; still meets 4.5:1. |
| `text.disabled` | `--mi-text-disabled` | `#5E5880` | Text of disabled controls; exempt from contrast minimums, never used to signal loading. |
| `text.inverse` | `--mi-text-inverse` | `#05040E` | Text on light fills. |

### `border`

Boundaries and dividers.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `border.subtle` | `--mi-border-subtle` | `#1E1940` | Dividers and decorative separation. |
| `border.default` | `--mi-border-default` | `#2C2558` | Default indigo border of containers. |
| `border.strong` | `--mi-border-strong` | `#453C7A` | Emphasized decorative borders, such as hovered tiles and dashed empty areas; below 3:1. |
| `border.control` | `--mi-border-control` | `#6E62A3` | Boundary of inputs and interactive controls; meets 3:1 on every surface. |

### `stroke`

Complete border lines, as values of the CSS `border` shorthand.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `stroke.dashed` | `--mi-stroke-dashed` | `1px dashed #453C7A` | Dashed `border.strong` line of empty states and drop zones. |

### `focus`

Focus-visible indicator, drawn as an offset outline so it never relies on color change alone.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `focus.ring` | `--mi-focus-ring` | `#FF6AC1` | Focus indicator color, the official pink; meets 3:1 on every surface. |
| `focus.width` | `--mi-focus-width` | `2px` | Focus indicator thickness. |
| `focus.offset` | `--mi-focus-offset` | `2px` | Gap between the control and the focus indicator. |

### `accent`

Brand accents applied outside components: links and text selection.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `accent.link` | `--mi-accent-link` | `#FF6AC1` | Link text. |
| `accent.linkHover` | `--mi-accent-link-hover` | `#FB92D3` | Hovered link text. |
| `accent.selection` | `--mi-accent-selection` | `#1C1642` | Background of selected text, derived from `brand`. |
| `accent.onSelection` | `--mi-accent-on-selection` | `#F2EFFC` | Selected text. |

### `state`

Interaction states of neutral items (list rows, menu items, table rows) and disabled controls.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `state.hover` | `--mi-state-hover` | `#1B1540` | Background of a hovered neutral item. |
| `state.pressed` | `--mi-state-pressed` | `#1E1940` | Background of a pressed neutral item. |
| `state.selected` | `--mi-state-selected` | `#251C5C` | Background of a selected neutral item; pair it with a non-color indicator. |
| `state.disabledSurface` | `--mi-state-disabled-surface` | `#0E0B1C` | Background of a disabled control. |
| `state.disabledText` | `--mi-state-disabled-text` | `#5E5880` | Text of a disabled control. |
| `state.disabledBorder` | `--mi-state-disabled-border` | `#2A2445` | Border of a disabled control. |

### `intent`

Semantic intents. Every intent has the same fields, so any component accepts any intent.

| Intent | Role |
| --- | --- |
| `official` | Main action and focus, at most one solid per screen. `main` is the exact Midnight Indigo keyword pink. |
| `brand` | Indigo for selection, the active item and navigation: checked controls, current page, active tab. |
| `default` | Neutral gray for secondary actions and neutral status. |
| `success` | Confirmation and completed operations. |
| `warning` | Attention required; pair with an icon or label, never hue alone. |
| `error` | Failure and destructive actions; pair with an icon or label, never hue alone. |
| `info` | Neutral information and guidance. |

Fields shared by every intent. Only `main` is required in a source; the other fields are derived from it
deterministically (`deriveIntentTokens`) unless provided explicitly.

| Field | CSS variable | Purpose |
| --- | --- | --- |
| `main` | `--mi-intent-<intent>-main` | Solid fill of filled controls and the reference color of the intent. |
| `light` | `--mi-intent-<intent>-light` | Lighter tone for accents and highlights. |
| `dark` | `--mi-intent-<intent>-dark` | Darker tone for accents and shading. |
| `contrastText` | `--mi-intent-<intent>-contrast-text` | Text and icons on `main`, `hover` and `pressed` fills. |
| `container` | `--mi-intent-<intent>-container` | Soft background of alerts, chips and badges. |
| `onContainer` | `--mi-intent-<intent>-on-container` | Text and icons on `container`, `containerHover` and `containerPressed`. |
| `border` | `--mi-intent-<intent>-border` | Boundary of outlined controls; meets 3:1 on every surface. |
| `text` | `--mi-intent-<intent>-text` | Intent-colored text on surfaces, such as ghost and outline labels; meets 4.5:1 on every surface. |
| `hover` | `--mi-intent-<intent>-hover` | Fill of a hovered filled control. |
| `pressed` | `--mi-intent-<intent>-pressed` | Fill of a pressed filled control. |
| `containerHover` | `--mi-intent-<intent>-container-hover` | Soft background when hovered. |
| `containerPressed` | `--mi-intent-<intent>-container-pressed` | Soft background when pressed or selected. |

| Field | `official` | `brand` | `default` | `success` | `warning` | `error` | `info` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `main` | `#FF6AC1` | `#5E48D6` | `#9290A8` | `#36C995` | `#F2B84B` | `#F2545B` | `#65BDEB` |
| `light` | `#FB92D3` | `#8A7AE1` | `#AFADC1` | `#6ED4B4` | `#F2C980` | `#F2838B` | `#8FCCF0` |
| `dark` | `#B44B8B` | `#43349A` | `#68667A` | `#278E6D` | `#AB8239` | `#AB3C44` | `#4885A9` |
| `contrastText` | `#05040E` | `#F2EFFC` | `#05040E` | `#05040E` | `#05040E` | `#05040E` | `#05040E` |
| `container` | `#281227` | `#110E2A` | `#191824` | `#0C2021` | `#261D17` | `#260F19` | `#121E2D` |
| `onContainer` | `#FA9FD9` | `#998BE5` | `#B8B6CA` | `#81D8BE` | `#F2CE92` | `#F2929B` | `#9DD1F2` |
| `border` | `#FF6AC1` | `#6550D8` | `#9290A8` | `#36C995` | `#F2B84B` | `#F2545B` | `#65BDEB` |
| `text` | `#FF6AC1` | `#8A7AE1` | `#9290A8` | `#36C995` | `#F2B84B` | `#F2545B` | `#65BDEB` |
| `hover` | `#FD7ECA` | `#664FDE` | `#A09EB5` | `#52CFA4` | `#F2C066` | `#F26B73` | `#7AC5EE` |
| `pressed` | `#DA5BA6` | `#513EB8` | `#7D7B91` | `#2FAB81` | `#CE9D42` | `#CE484F` | `#57A1CA` |
| `containerHover` | `#371832` | `#171236` | `#21202D` | `#0F2B29` | `#34281A` | `#34141D` | `#18293A` |
| `containerPressed` | `#461F3D` | `#1C1642` | `#2A2836` | `#123731` | `#43331E` | `#431922` | `#1E3447` |

### `support`

Support colors harmonized with the pink and the indigo, for categories, tags, avatars and charts. They carry no meaning: status is the job of the intents.

| Field | CSS variable | Purpose |
| --- | --- | --- |
| `main` | `--mi-support-<color>-main` | The color itself: icons, dots and chart marks; meets 3:1 on its `soft` background. |
| `soft` | `--mi-support-<color>-soft` | Tonal background: `main` at 16% over the surface below it (`soft()` takes 14–18%). |
| `text` | `--mi-support-<color>-text` | Text on `soft`; equals `main` unless `main` is below 4.5:1 on it. Meets 4.5:1 on every surface. |

The ratios are the lowest of `text` and `main` on `soft` at 14% and at 18%, over every surface (checked in CI).

| Color | `main` | `text` | `soft` | Text on soft | Icon on soft | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `pink` | `#FF6AC1` | `#FF6AC1` | `rgb(255 106 193 / 0.16)` | 4.96:1 | 4.96:1 | The official pink. |
| `violet` | `#8F7AFB` | `#9986FB` | `rgb(143 122 251 / 0.16)` | 4.52:1 | 4.01:1 | The indigo text color (`color.indigo.300`). |
| `blue` | `#65BDEB` | `#65BDEB` | `rgb(101 189 235 / 0.16)` | 5.82:1 | 5.82:1 | Same hue as the `info` intent. |
| `green` | `#36C995` | `#36C995` | `rgb(54 201 149 / 0.16)` | 5.90:1 | 5.90:1 | Same hue as the `success` intent. |
| `amber` | `#F2B84B` | `#F2B84B` | `rgb(242 184 75 / 0.16)` | 6.63:1 | 6.63:1 | Same hue as the `warning` intent. |
| `red` | `#F2545B` | `#F26B73` | `rgb(242 84 91 / 0.16)` | 4.69:1 | 4.07:1 | Same hue as the `error` intent. |
| `turquoise` | `#3FD0C9` | `#3FD0C9` | `rgb(63 208 201 / 0.16)` | 6.39:1 | 6.39:1 | Turquoise. |
| `orange` | `#F28A4B` | `#F28A4B` | `rgb(242 138 75 / 0.16)` | 5.18:1 | 5.18:1 | Orange. |

### `chart`

Chart marks and chrome.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `chart.series.1` | `--mi-chart-series-1` | `#FF6AC1` | Categorical series colors, in assignment order. |
| `chart.series.2` | `--mi-chart-series-2` | `#8F7AFB` | Categorical series colors, in assignment order. |
| `chart.series.3` | `--mi-chart-series-3` | `#65BDEB` | Categorical series colors, in assignment order. |
| `chart.series.4` | `--mi-chart-series-4` | `#36C995` | Categorical series colors, in assignment order. |
| `chart.series.5` | `--mi-chart-series-5` | `#F2B84B` | Categorical series colors, in assignment order. |
| `chart.series.6` | `--mi-chart-series-6` | `#3FD0C9` | Categorical series colors, in assignment order. |
| `chart.series.7` | `--mi-chart-series-7` | `#F28A4B` | Categorical series colors, in assignment order. |
| `chart.series.8` | `--mi-chart-series-8` | `#F2545B` | Categorical series colors, in assignment order. |
| `chart.grid` | `--mi-chart-grid` | `#1E1940` | Grid lines. |
| `chart.axis` | `--mi-chart-axis` | `#453C7A` | Axis lines and ticks. |
| `chart.label` | `--mi-chart-label` | `#C3BDDC` | Axis labels and legends. |
| `chart.tooltipSurface` | `--mi-chart-tooltip-surface` | `#1B1638` | Tooltip background. |

### `radius`

Corner radius scale; components pick a step instead of sharing a single radius.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `radius.none` | `--mi-radius-none` | `0` | Square corners. |
| `radius.small` | `--mi-radius-small` | `4px` | Small controls, checkboxes and tags. |
| `radius.medium` | `--mi-radius-medium` | `8px` | Buttons and inputs. |
| `radius.large` | `--mi-radius-large` | `12px` | Cards and panels. |
| `radius.extraLarge` | `--mi-radius-extra-large` | `16px` | Dialogs and large surfaces. |
| `radius.pill` | `--mi-radius-pill` | `9999px` | Fully rounded chips and pills. |

### `spacing`

Single spacing scale, in steps of 0.25rem.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `spacing.0` | `--mi-spacing-0` | `0` |  |
| `spacing.1` | `--mi-spacing-1` | `0.25rem` |  |
| `spacing.2` | `--mi-spacing-2` | `0.5rem` |  |
| `spacing.3` | `--mi-spacing-3` | `0.75rem` |  |
| `spacing.4` | `--mi-spacing-4` | `1rem` |  |
| `spacing.5` | `--mi-spacing-5` | `1.25rem` |  |
| `spacing.6` | `--mi-spacing-6` | `1.5rem` |  |
| `spacing.8` | `--mi-spacing-8` | `2rem` |  |
| `spacing.10` | `--mi-spacing-10` | `2.5rem` |  |
| `spacing.12` | `--mi-spacing-12` | `3rem` |  |
| `spacing.16` | `--mi-spacing-16` | `4rem` |  |

### `elevation`

Shadows calibrated for the dark canvas; pair them with a lighter surface and a border. `official` and `brand` are colored by the `main` of their intent.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `elevation.none` | `--mi-elevation-none` | `none` | Flat, on the canvas. |
| `elevation.card` | `--mi-elevation-card` | `0 1px 2px 0 rgb(0 0 0 / 0.5), 0 4px 12px -4px rgb(0 0 0 / 0.5)` | Elevated cards and panels. |
| `elevation.overlay` | `--mi-elevation-overlay` | `0 8px 24px -6px rgb(0 0 0 / 0.7)` | Menus, popovers, tooltips and chart tooltips. |
| `elevation.dialog` | `--mi-elevation-dialog` | `0 24px 48px -12px rgb(0 0 0 / 0.8)` | Dialogs, drawers and toasts. |
| `elevation.official` | `--mi-elevation-official` | `0 6px 20px -6px rgb(255 106 193 / 0.45)` | Pink glow of the main action (filled `official` button). |
| `elevation.brand` | `--mi-elevation-brand` | `0 6px 20px -6px rgb(94 72 214 / 0.45)` | Indigo glow of a filled `brand` control. |

### `layer`

Stacking order (`z-index`) of the layers above the page. Overlays take them already; use them for your own layers.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `layer.base` | `--mi-layer-base` | `0` | Content of the page. |
| `layer.sticky` | `--mi-layer-sticky` | `1100` | Sticky headers and toolbars, above the content they scroll over. |
| `layer.drawer` | `--mi-layer-drawer` | `1200` | Drawers. |
| `layer.dialog` | `--mi-layer-dialog` | `1300` | Dialogs and confirmation dialogs. |
| `layer.popover` | `--mi-layer-popover` | `1400` | Popovers and menus, also when opened inside a dialog or a drawer. |
| `layer.toast` | `--mi-layer-toast` | `1500` | Toast notifications, above every overlay so they are never hidden. |
| `layer.tooltip` | `--mi-layer-tooltip` | `1600` | Tooltips, the highest layer. |

### `backdrop`

Scrim behind modal overlays, which keeps the page visible but out of reach.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `backdrop.scrim` | `--mi-backdrop-scrim` | `rgb(5 4 14 / 0.72)` | Translucent canvas behind dialogs and drawers. |
| `backdrop.blur` | `--mi-backdrop-blur` | `4px` | Blur radius of the page behind the scrim (`backdrop-filter: blur()`). |

### `motion`

Durations and easing curves. Durations become 0ms under `prefers-reduced-motion: reduce`.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `motion.duration.instant` | `--mi-motion-duration-instant` | `0ms` |  |
| `motion.duration.fast` | `--mi-motion-duration-fast` | `120ms` |  |
| `motion.duration.moderate` | `--mi-motion-duration-moderate` | `200ms` |  |
| `motion.duration.slow` | `--mi-motion-duration-slow` | `320ms` |  |
| `motion.easing.standard` | `--mi-motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |  |
| `motion.easing.enter` | `--mi-motion-easing-enter` | `cubic-bezier(0, 0, 0, 1)` |  |
| `motion.easing.exit` | `--mi-motion-easing-exit` | `cubic-bezier(0.3, 0, 1, 1)` |  |

### `fontFamily`

Font stacks. Geist Sans and Geist Mono are self-hosted by the application; the system fonts after them are the fallback.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `fontFamily.sans` | `--mi-font-family-sans` | `'Geist Variable', Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | Interface text: every role except `code`. |
| `fontFamily.mono` | `--mi-font-family-mono` | `'Geist Mono Variable', 'Geist Mono', ui-monospace, SFMono-Regular, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace` | Code, and always numbers, identifiers and amounts, with tabular digits. |

### `fontWeight`

Font weights used by the typographic roles.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `fontWeight.regular` | `--mi-font-weight-regular` | `400` | Body text and captions. |
| `fontWeight.medium` | `--mi-font-weight-medium` | `500` | Labels of controls, tabs and menu items, and code. |
| `fontWeight.semibold` | `--mi-font-weight-semibold` | `600` | Small headings and the overline. |
| `fontWeight.bold` | `--mi-font-weight-bold` | `700` | Display text and the large and medium headings. |

### `typography`

Typographic roles. Sizes are in rem, so they follow the browser text size and zoom; line heights are unitless.

Every role has the fields `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` and
`textTransform`, declared as `--mi-typography-<role>-<field>`, e.g.
`--mi-typography-body-font-size`.

| Role | Font | Size | Line height | Weight | Letter spacing | Transform | Usage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | `sans` | `2.5rem` | `1.2` | `700` | `-0.02em` | `none` | Key figures and hero titles; at most one per view. |
| `headingLarge` | `sans` | `2rem` | `1.25` | `700` | `-0.015em` | `none` | Page title (`h1`). |
| `headingMedium` | `sans` | `1.5rem` | `1.3` | `700` | `-0.01em` | `none` | Section title (`h2`). |
| `headingSmall` | `sans` | `1.125rem` | `1.4` | `600` | `0` | `none` | Card, panel and dialog title (`h3`). |
| `body` | `sans` | `0.9375rem` | `1.6` | `400` | `0` | `none` | Default text of the document, paragraphs and form fields. |
| `bodySmall` | `sans` | `0.8125rem` | `1.5` | `400` | `0` | `none` | Dense text: table cells, secondary list text and helper text. |
| `label` | `sans` | `0.8125rem` | `1.4` | `500` | `0.01em` | `none` | Buttons, form labels, tabs and menu items. |
| `caption` | `sans` | `0.75rem` | `1.4` | `400` | `0.01em` | `none` | Timestamps, footnotes and annotations; never the only place of essential content. |
| `overline` | `sans` | `0.6875rem` | `1.4` | `600` | `0.09em` | `uppercase` | Uppercase eyebrow above a title and labels of navigation groups; a few words at most. |
| `code` | `mono` | `0.8125rem` | `1.5` | `500` | `0` | `none` | Inline code, identifiers and monospace values. |

### `iconSize`

Fixed icon sizes. Icons inline with text use `1em` instead, to follow the text size.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `iconSize.small` | `--mi-icon-size-small` | `1rem` | Dense controls and inline status icons. |
| `iconSize.medium` | `--mi-icon-size-medium` | `1.25rem` | Default size inside buttons, inputs and menu items. |
| `iconSize.large` | `--mi-icon-size-large` | `1.5rem` | Standalone icons, empty states and icon-only toolbars. |

### `breakpoints`

Viewport widths where layouts change, mobile first: each applies from its width up. They are plain values, not
CSS custom properties, because media queries cannot read custom properties. The media queries are in `em`, so a
larger default text size gets the layout of a narrower viewport. How the components use them:
[navigation.md](./navigation.md#breakpoints).

| Name | From | Media query | Typical devices |
| --- | --- | --- | --- |
| `compact` | 0 px | `(min-width: 0em)` | Phones in portrait |
| `medium` | 600 px | `(min-width: 37.5em)` | Tablets in portrait, large phones in landscape |
| `expanded` | 840 px | `(min-width: 52.5em)` | Tablets in landscape, small laptops |
| `large` | 1200 px | `(min-width: 75em)` | Desktops |
| `extraLarge` | 1600 px | `(min-width: 100em)` | Wide monitors |

## Contrast pairs

Every pair below is checked in CI against WCAG 2.2 AA: 4.5:1 for text, 3:1 for non-text indicators.
Ratios are truncated, never rounded up. All colors are opaque, so the ratio is that of the rendered pair.

| Foreground | Background | Ratio | Minimum | Usage | Result |
| --- | --- | --- | --- | --- | --- |
| `text.primary` | `surface.canvas` | 17.98:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.field` | 17.69:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.sidebar` | 17.45:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.tableHeader` | 16.86:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.raised` | 16.29:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.dialog` | 15.82:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.overlay` | 15.20:1 | 4.50:1 | Body text and headings | Pass |
| `text.secondary` | `surface.canvas` | 11.29:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.field` | 11.10:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.sidebar` | 10.95:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.tableHeader` | 10.59:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.raised` | 10.23:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.dialog` | 9.93:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.overlay` | 9.54:1 | 4.50:1 | Supporting text | Pass |
| `text.muted` | `surface.canvas` | 6.79:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.field` | 6.68:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.sidebar` | 6.59:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.tableHeader` | 6.37:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.raised` | 6.15:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.dialog` | 5.97:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.overlay` | 5.74:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `border.control` | `surface.canvas` | 3.82:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.control` | `surface.field` | 3.76:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.control` | `surface.sidebar` | 3.71:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.control` | `surface.tableHeader` | 3.58:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.control` | `surface.raised` | 3.46:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.control` | `surface.dialog` | 3.36:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.control` | `surface.overlay` | 3.23:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `focus.ring` | `surface.canvas` | 7.84:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.field` | 7.71:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.sidebar` | 7.61:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.tableHeader` | 7.35:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.raised` | 7.11:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.dialog` | 6.90:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.overlay` | 6.63:1 | 3.00:1 | Focus indicator | Pass |
| `accent.link` | `surface.canvas` | 7.84:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.field` | 7.71:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.sidebar` | 7.61:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.tableHeader` | 7.35:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.raised` | 7.11:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.dialog` | 6.90:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.overlay` | 6.63:1 | 4.50:1 | Links | Pass |
| `accent.linkHover` | `surface.canvas` | 9.85:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.field` | 9.69:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.sidebar` | 9.56:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.tableHeader` | 9.24:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.raised` | 8.93:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.dialog` | 8.67:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.overlay` | 8.33:1 | 4.50:1 | Hovered links | Pass |
| `accent.onSelection` | `accent.selection` | 14.90:1 | 4.50:1 | Selected text | Pass |
| `text.primary` | `state.hover` | 15.08:1 | 4.50:1 | Text on a hover neutral item | Pass |
| `text.primary` | `state.pressed` | 14.60:1 | 4.50:1 | Text on a pressed neutral item | Pass |
| `text.primary` | `state.selected` | 13.24:1 | 4.50:1 | Text on a selected neutral item | Pass |
| `intent.official.contrastText` | `intent.official.main` | 7.84:1 | 4.50:1 | Label of a filled official control (main) | Pass |
| `intent.official.contrastText` | `intent.official.hover` | 8.74:1 | 4.50:1 | Label of a filled official control (hover) | Pass |
| `intent.official.contrastText` | `intent.official.pressed` | 5.85:1 | 4.50:1 | Label of a filled official control (pressed) | Pass |
| `intent.official.onContainer` | `intent.official.container` | 9.14:1 | 4.50:1 | Text on a soft official container (container) | Pass |
| `intent.official.onContainer` | `intent.official.containerHover` | 8.23:1 | 4.50:1 | Text on a soft official container (containerHover) | Pass |
| `intent.official.onContainer` | `intent.official.containerPressed` | 7.23:1 | 4.50:1 | Text on a soft official container (containerPressed) | Pass |
| `intent.official.text` | `surface.canvas` | 7.84:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.field` | 7.71:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.sidebar` | 7.61:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.tableHeader` | 7.35:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.raised` | 7.11:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.dialog` | 6.90:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.overlay` | 6.63:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.border` | `surface.canvas` | 7.84:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.border` | `surface.field` | 7.71:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.border` | `surface.sidebar` | 7.61:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.border` | `surface.tableHeader` | 7.35:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.border` | `surface.raised` | 7.11:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.border` | `surface.dialog` | 6.90:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.border` | `surface.overlay` | 6.63:1 | 3.00:1 | Boundary of an outlined or filled official control, and official indicators | Pass |
| `intent.official.main` | `intent.official.container` | 6.70:1 | 3.00:1 | official progress indicator on its track | Pass |
| `intent.brand.contrastText` | `intent.brand.main` | 5.49:1 | 4.50:1 | Label of a filled brand control (main) | Pass |
| `intent.brand.contrastText` | `intent.brand.hover` | 4.95:1 | 4.50:1 | Label of a filled brand control (hover) | Pass |
| `intent.brand.contrastText` | `intent.brand.pressed` | 6.78:1 | 4.50:1 | Label of a filled brand control (pressed) | Pass |
| `intent.brand.onContainer` | `intent.brand.container` | 6.40:1 | 4.50:1 | Text on a soft brand container (container) | Pass |
| `intent.brand.onContainer` | `intent.brand.containerHover` | 6.10:1 | 4.50:1 | Text on a soft brand container (containerHover) | Pass |
| `intent.brand.onContainer` | `intent.brand.containerPressed` | 5.77:1 | 4.50:1 | Text on a soft brand container (containerPressed) | Pass |
| `intent.brand.text` | `surface.canvas` | 5.77:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.text` | `surface.field` | 5.68:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.text` | `surface.sidebar` | 5.60:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.text` | `surface.tableHeader` | 5.41:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.text` | `surface.raised` | 5.23:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.text` | `surface.dialog` | 5.08:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.text` | `surface.overlay` | 4.88:1 | 4.50:1 | brand text, ghost and outline labels | Pass |
| `intent.brand.border` | `surface.canvas` | 3.58:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.border` | `surface.field` | 3.52:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.border` | `surface.sidebar` | 3.47:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.border` | `surface.tableHeader` | 3.36:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.border` | `surface.raised` | 3.24:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.border` | `surface.dialog` | 3.15:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.border` | `surface.overlay` | 3.03:1 | 3.00:1 | Boundary of an outlined or filled brand control, and brand indicators | Pass |
| `intent.brand.main` | `intent.brand.container` | 3.01:1 | 3.00:1 | brand progress indicator on its track | Pass |
| `intent.default.contrastText` | `intent.default.main` | 6.57:1 | 4.50:1 | Label of a filled default control (main) | Pass |
| `intent.default.contrastText` | `intent.default.hover` | 7.81:1 | 4.50:1 | Label of a filled default control (hover) | Pass |
| `intent.default.contrastText` | `intent.default.pressed` | 4.96:1 | 4.50:1 | Label of a filled default control (pressed) | Pass |
| `intent.default.onContainer` | `intent.default.container` | 8.83:1 | 4.50:1 | Text on a soft default container (container) | Pass |
| `intent.default.onContainer` | `intent.default.containerHover` | 8.08:1 | 4.50:1 | Text on a soft default container (containerHover) | Pass |
| `intent.default.onContainer` | `intent.default.containerPressed` | 7.27:1 | 4.50:1 | Text on a soft default container (containerPressed) | Pass |
| `intent.default.text` | `surface.canvas` | 6.57:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.field` | 6.47:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.sidebar` | 6.38:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.tableHeader` | 6.16:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.raised` | 5.96:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.dialog` | 5.78:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.overlay` | 5.56:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.border` | `surface.canvas` | 6.57:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.border` | `surface.field` | 6.47:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.border` | `surface.sidebar` | 6.38:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.border` | `surface.tableHeader` | 6.16:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.border` | `surface.raised` | 5.96:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.border` | `surface.dialog` | 5.78:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.border` | `surface.overlay` | 5.56:1 | 3.00:1 | Boundary of an outlined or filled default control, and default indicators | Pass |
| `intent.default.main` | `intent.default.container` | 5.65:1 | 3.00:1 | default progress indicator on its track | Pass |
| `intent.success.contrastText` | `intent.success.main` | 9.65:1 | 4.50:1 | Label of a filled success control (main) | Pass |
| `intent.success.contrastText` | `intent.success.hover` | 10.50:1 | 4.50:1 | Label of a filled success control (hover) | Pass |
| `intent.success.contrastText` | `intent.success.pressed` | 7.05:1 | 4.50:1 | Label of a filled success control (pressed) | Pass |
| `intent.success.onContainer` | `intent.success.container` | 10.04:1 | 4.50:1 | Text on a soft success container (container) | Pass |
| `intent.success.onContainer` | `intent.success.containerHover` | 8.94:1 | 4.50:1 | Text on a soft success container (containerHover) | Pass |
| `intent.success.onContainer` | `intent.success.containerPressed` | 7.73:1 | 4.50:1 | Text on a soft success container (containerPressed) | Pass |
| `intent.success.text` | `surface.canvas` | 9.65:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.field` | 9.49:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.sidebar` | 9.36:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.tableHeader` | 9.05:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.raised` | 8.74:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.dialog` | 8.49:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.overlay` | 8.16:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.border` | `surface.canvas` | 9.65:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.border` | `surface.field` | 9.49:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.border` | `surface.sidebar` | 9.36:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.border` | `surface.tableHeader` | 9.05:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.border` | `surface.raised` | 8.74:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.border` | `surface.dialog` | 8.49:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.border` | `surface.overlay` | 8.16:1 | 3.00:1 | Boundary of an outlined or filled success control, and success indicators | Pass |
| `intent.success.main` | `intent.success.container` | 7.99:1 | 3.00:1 | success progress indicator on its track | Pass |
| `intent.warning.contrastText` | `intent.warning.main` | 11.38:1 | 4.50:1 | Label of a filled warning control (main) | Pass |
| `intent.warning.contrastText` | `intent.warning.hover` | 12.14:1 | 4.50:1 | Label of a filled warning control (hover) | Pass |
| `intent.warning.contrastText` | `intent.warning.pressed` | 8.27:1 | 4.50:1 | Label of a filled warning control (pressed) | Pass |
| `intent.warning.onContainer` | `intent.warning.container` | 11.03:1 | 4.50:1 | Text on a soft warning container (container) | Pass |
| `intent.warning.onContainer` | `intent.warning.containerHover` | 9.57:1 | 4.50:1 | Text on a soft warning container (containerHover) | Pass |
| `intent.warning.onContainer` | `intent.warning.containerPressed` | 8.09:1 | 4.50:1 | Text on a soft warning container (containerPressed) | Pass |
| `intent.warning.text` | `surface.canvas` | 11.38:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.field` | 11.20:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.sidebar` | 11.05:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.tableHeader` | 10.68:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.raised` | 10.32:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.dialog` | 10.02:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.overlay` | 9.62:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.border` | `surface.canvas` | 11.38:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.border` | `surface.field` | 11.20:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.border` | `surface.sidebar` | 11.05:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.border` | `surface.tableHeader` | 10.68:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.border` | `surface.raised` | 10.32:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.border` | `surface.dialog` | 10.02:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.border` | `surface.overlay` | 9.62:1 | 3.00:1 | Boundary of an outlined or filled warning control, and warning indicators | Pass |
| `intent.warning.main` | `intent.warning.container` | 9.23:1 | 3.00:1 | warning progress indicator on its track | Pass |
| `intent.error.contrastText` | `intent.error.main` | 6.01:1 | 4.50:1 | Label of a filled error control (main) | Pass |
| `intent.error.contrastText` | `intent.error.hover` | 6.91:1 | 4.50:1 | Label of a filled error control (hover) | Pass |
| `intent.error.contrastText` | `intent.error.pressed` | 4.52:1 | 4.50:1 | Label of a filled error control (pressed) | Pass |
| `intent.error.onContainer` | `intent.error.container` | 8.03:1 | 4.50:1 | Text on a soft error container (container) | Pass |
| `intent.error.onContainer` | `intent.error.containerHover` | 7.40:1 | 4.50:1 | Text on a soft error container (containerHover) | Pass |
| `intent.error.onContainer` | `intent.error.containerPressed` | 6.68:1 | 4.50:1 | Text on a soft error container (containerPressed) | Pass |
| `intent.error.text` | `surface.canvas` | 6.01:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.field` | 5.91:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.sidebar` | 5.83:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.tableHeader` | 5.63:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.raised` | 5.44:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.dialog` | 5.29:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.overlay` | 5.08:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.border` | `surface.canvas` | 6.01:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.border` | `surface.field` | 5.91:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.border` | `surface.sidebar` | 5.83:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.border` | `surface.tableHeader` | 5.63:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.border` | `surface.raised` | 5.44:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.border` | `surface.dialog` | 5.29:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.border` | `surface.overlay` | 5.08:1 | 3.00:1 | Boundary of an outlined or filled error control, and error indicators | Pass |
| `intent.error.main` | `intent.error.container` | 5.31:1 | 3.00:1 | error progress indicator on its track | Pass |
| `intent.info.contrastText` | `intent.info.main` | 9.73:1 | 4.50:1 | Label of a filled info control (main) | Pass |
| `intent.info.contrastText` | `intent.info.hover` | 10.72:1 | 4.50:1 | Label of a filled info control (hover) | Pass |
| `intent.info.contrastText` | `intent.info.pressed` | 7.14:1 | 4.50:1 | Label of a filled info control (pressed) | Pass |
| `intent.info.onContainer` | `intent.info.container` | 10.27:1 | 4.50:1 | Text on a soft info container (container) | Pass |
| `intent.info.onContainer` | `intent.info.containerHover` | 9.05:1 | 4.50:1 | Text on a soft info container (containerHover) | Pass |
| `intent.info.onContainer` | `intent.info.containerPressed` | 7.83:1 | 4.50:1 | Text on a soft info container (containerPressed) | Pass |
| `intent.info.text` | `surface.canvas` | 9.73:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.field` | 9.57:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.sidebar` | 9.44:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.tableHeader` | 9.13:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.raised` | 8.82:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.dialog` | 8.56:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.overlay` | 8.23:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.border` | `surface.canvas` | 9.73:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.border` | `surface.field` | 9.57:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.border` | `surface.sidebar` | 9.44:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.border` | `surface.tableHeader` | 9.13:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.border` | `surface.raised` | 8.82:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.border` | `surface.dialog` | 8.56:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.border` | `surface.overlay` | 8.23:1 | 3.00:1 | Boundary of an outlined or filled info control, and info indicators | Pass |
| `intent.info.main` | `intent.info.container` | 8.02:1 | 3.00:1 | info progress indicator on its track | Pass |
| `chart.series.1` | `surface.canvas` | 7.84:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.1` | `surface.raised` | 7.11:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.2` | `surface.canvas` | 6.15:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.2` | `surface.raised` | 5.58:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.3` | `surface.canvas` | 9.73:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.3` | `surface.raised` | 8.82:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.4` | `surface.canvas` | 9.65:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.4` | `surface.raised` | 8.74:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.5` | `surface.canvas` | 11.38:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.5` | `surface.raised` | 10.32:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.6` | `surface.canvas` | 10.75:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.6` | `surface.raised` | 9.74:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.7` | `surface.canvas` | 8.26:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.7` | `surface.raised` | 7.48:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.8` | `surface.canvas` | 6.01:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.8` | `surface.raised` | 5.44:1 | 3.00:1 | Chart series mark | Pass |
