# Design tokens

<!-- Generated from `src/tokens` by `pnpm --filter @midnight-indigo/ui generate:tokens`. Do not edit by hand. -->

Midnight Indigo: UI is dark-only: there is no light palette and no light/dark toggle.
Every token is exported by `@midnight-indigo/ui/tokens` and declared as a CSS custom property in
`@midnight-indigo/ui/styles.css`. Components reference tokens, never hexadecimal values.

`intent.official.main` is the exact Midnight Indigo keyword pink, `#FF6AC1`. The other intent `main`
values are provisional proposals until the stable API.

How to apply the typography, icon and motion tokens: [foundations.md](./foundations.md).

## Tokens

### `surface`

Background layers, from the deepest to the most elevated.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `surface.canvas` | `--mi-surface-canvas` | `#020108` | Main application background. |
| `surface.sunken` | `--mi-surface-sunken` | `#030209` | Areas recessed below the canvas, such as wells and code blocks. |
| `surface.base` | `--mi-surface-base` | `#040208` | Navigation and base structural surfaces. |
| `surface.raised` | `--mi-surface-raised` | `#0A0716` | Cards and elevated controls. |
| `surface.overlay` | `--mi-surface-overlay` | `#110C22` | Menus, popovers, tooltips and dialogs. |

### `text`

Text colors by emphasis.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `text.primary` | `--mi-text-primary` | `#F2EFFC` | Body text and headings. |
| `text.secondary` | `--mi-text-secondary` | `#C3BDDC` | Supporting text and descriptions. |
| `text.muted` | `--mi-text-muted` | `#9790B8` | Placeholders, hints and captions; still meets 4.5:1. |
| `text.disabled` | `--mi-text-disabled` | `#5E5880` | Text of disabled controls; exempt from contrast minimums, never used to signal loading. |
| `text.inverse` | `--mi-text-inverse` | `#020108` | Text on light fills. |

### `border`

Boundaries and dividers.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `border.subtle` | `--mi-border-subtle` | `#1F1838` | Dividers and decorative separation. |
| `border.default` | `--mi-border-default` | `#352A5E` | Default indigo border of containers. |
| `border.strong` | `--mi-border-strong` | `#6E62A3` | Boundary of inputs and interactive controls; meets 3:1 on every surface. |

### `focus`

Focus-visible indicator, drawn as an offset outline so it never relies on color change alone.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `focus.ring` | `--mi-focus-ring` | `#B7A8FF` | Focus indicator color; meets 3:1 on every surface. |
| `focus.width` | `--mi-focus-width` | `2px` | Focus indicator thickness. |
| `focus.offset` | `--mi-focus-offset` | `2px` | Gap between the control and the focus indicator. |

### `accent`

Brand accents applied outside components: links and text selection.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `accent.link` | `--mi-accent-link` | `#FF6AC1` | Link text. |
| `accent.linkHover` | `--mi-accent-link-hover` | `#FB92D3` | Hovered link text. |
| `accent.selection` | `--mi-accent-selection` | `#441C38` | Background of selected text. |
| `accent.onSelection` | `--mi-accent-on-selection` | `#F2EFFC` | Selected text. |

### `state`

Interaction states of neutral items (list rows, menu items, table rows) and disabled controls.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `state.hover` | `--mi-state-hover` | `#16112B` | Background of a hovered neutral item. |
| `state.pressed` | `--mi-state-pressed` | `#1D1636` | Background of a pressed neutral item. |
| `state.selected` | `--mi-state-selected` | `#241B44` | Background of a selected neutral item; pair it with a non-color indicator. |
| `state.disabledSurface` | `--mi-state-disabled-surface` | `#0E0B1C` | Background of a disabled control. |
| `state.disabledText` | `--mi-state-disabled-text` | `#5E5880` | Text of a disabled control. |
| `state.disabledBorder` | `--mi-state-disabled-border` | `#2A2445` | Border of a disabled control. |

### `intent`

Semantic intents. Every intent has the same fields, so any component accepts any intent.

| Intent | Role |
| --- | --- |
| `official` | Brand, primary action and highlight. `main` is the exact Midnight Indigo keyword pink. |
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

| Field | `official` | `default` | `success` | `warning` | `error` | `info` |
| --- | --- | --- | --- | --- | --- | --- |
| `main` | `#FF6AC1` | `#9290A8` | `#36C995` | `#F2B84B` | `#F2545B` | `#65BDEB` |
| `light` | `#FB92D3` | `#AFADC1` | `#6ED4B4` | `#F2C980` | `#F2838B` | `#8FCCF0` |
| `dark` | `#B34A8A` | `#676578` | `#268D6B` | `#AA8137` | `#AA3B42` | `#4785A7` |
| `contrastText` | `#020108` | `#020108` | `#020108` | `#020108` | `#020108` | `#020108` |
| `container` | `#251022` | `#16151E` | `#091D1C` | `#241B11` | `#240D14` | `#101B28` |
| `onContainer` | `#FA9FD9` | `#B8B6CA` | `#81D8BE` | `#F2CE92` | `#F2929B` | `#9DD1F2` |
| `border` | `#FF6AC1` | `#9290A8` | `#36C995` | `#F2B84B` | `#F2545B` | `#65BDEB` |
| `text` | `#FF6AC1` | `#9290A8` | `#36C995` | `#F2B84B` | `#F2545B` | `#65BDEB` |
| `hover` | `#FD7ECA` | `#A09EB5` | `#52CFA4` | `#F2C066` | `#F26B73` | `#7AC5EE` |
| `pressed` | `#D95AA5` | `#7C7B90` | `#2EAB80` | `#CE9D41` | `#CE484F` | `#56A1C9` |
| `containerHover` | `#35162D` | `#1F1E28` | `#0C2924` | `#322615` | `#321219` | `#162735` |
| `containerPressed` | `#441C38` | `#272632` | `#10352D` | `#403119` | `#40171E` | `#1C3243` |

### `chart`

Chart marks and chrome.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `chart.series.1` | `--mi-chart-series-1` | `#FF6AC1` | Categorical series colors, in assignment order. |
| `chart.series.2` | `--mi-chart-series-2` | `#65BDEB` | Categorical series colors, in assignment order. |
| `chart.series.3` | `--mi-chart-series-3` | `#36C995` | Categorical series colors, in assignment order. |
| `chart.series.4` | `--mi-chart-series-4` | `#F2B84B` | Categorical series colors, in assignment order. |
| `chart.series.5` | `--mi-chart-series-5` | `#A68CFF` | Categorical series colors, in assignment order. |
| `chart.series.6` | `--mi-chart-series-6` | `#FF8A5B` | Categorical series colors, in assignment order. |
| `chart.series.7` | `--mi-chart-series-7` | `#4FD1C5` | Categorical series colors, in assignment order. |
| `chart.series.8` | `--mi-chart-series-8` | `#D4D1E8` | Categorical series colors, in assignment order. |
| `chart.grid` | `--mi-chart-grid` | `#1F1838` | Grid lines. |
| `chart.axis` | `--mi-chart-axis` | `#6E62A3` | Axis lines and ticks. |
| `chart.label` | `--mi-chart-label` | `#C3BDDC` | Axis labels and legends. |
| `chart.tooltipSurface` | `--mi-chart-tooltip-surface` | `#110C22` | Tooltip background. |

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

Shadows calibrated for the dark canvas; pair them with a lighter surface and a border.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `elevation.none` | `--mi-elevation-none` | `none` | Flat, on the canvas. |
| `elevation.low` | `--mi-elevation-low` | `0 1px 2px 0 rgb(0 0 0 / 0.6)` | Raised cards and controls. |
| `elevation.medium` | `--mi-elevation-medium` | `0 4px 12px -2px rgb(0 0 0 / 0.7)` | Menus and popovers. |
| `elevation.high` | `--mi-elevation-high` | `0 12px 32px -4px rgb(0 0 0 / 0.8)` | Dialogs. |

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
| `backdrop.scrim` | `--mi-backdrop-scrim` | `rgb(2 1 8 / 0.72)` | Translucent canvas behind dialogs and drawers. |

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

Font stacks. Inter is self-hosted by the application; the system fonts after it are the fallback.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `fontFamily.sans` | `--mi-font-family-sans` | `'Inter Variable', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | Interface text: every role except `code`. |
| `fontFamily.mono` | `--mi-font-family-mono` | `ui-monospace, SFMono-Regular, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace` | Code, identifiers and values that must align character by character. |

### `fontWeight`

Font weights used by the typographic roles.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `fontWeight.regular` | `--mi-font-weight-regular` | `400` | Body text, captions and code. |
| `fontWeight.medium` | `--mi-font-weight-medium` | `500` | Labels of controls, tabs and menu items. |
| `fontWeight.semibold` | `--mi-font-weight-semibold` | `600` | Headings. |
| `fontWeight.bold` | `--mi-font-weight-bold` | `700` | Display text. |

### `typography`

Typographic roles. Sizes are in rem, so they follow the browser text size and zoom; line heights are unitless.

Every role has the fields `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` and `letterSpacing`, declared as
`--mi-typography-<role>-<field>`, e.g. `--mi-typography-body-font-size`.

| Role | Font | Size | Line height | Weight | Letter spacing | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| `display` | `sans` | `2.25rem` | `1.2` | `700` | `-0.02em` | Key figures and hero titles; at most one per view. |
| `headingLarge` | `sans` | `1.75rem` | `1.25` | `600` | `-0.015em` | Page title (`h1`). |
| `headingMedium` | `sans` | `1.375rem` | `1.3` | `600` | `-0.01em` | Section title (`h2`). |
| `headingSmall` | `sans` | `1.125rem` | `1.4` | `600` | `0` | Card, panel and dialog title (`h3`). |
| `body` | `sans` | `1rem` | `1.5` | `400` | `0` | Default text of the document, paragraphs and form fields. |
| `bodySmall` | `sans` | `0.875rem` | `1.5` | `400` | `0` | Dense text: table cells, secondary list text and helper text. |
| `label` | `sans` | `0.875rem` | `1.4` | `500` | `0.01em` | Buttons, form labels, tabs and menu items. |
| `caption` | `sans` | `0.75rem` | `1.4` | `400` | `0.02em` | Timestamps, footnotes and annotations; never the only place of essential content. |
| `code` | `mono` | `0.875rem` | `1.5` | `400` | `0` | Inline code, identifiers and monospace values. |

### `iconSize`

Fixed icon sizes. Icons inline with text use `1em` instead, to follow the text size.

| Token | CSS variable | Value | Purpose |
| --- | --- | --- | --- |
| `iconSize.small` | `--mi-icon-size-small` | `1rem` | Dense controls and inline status icons. |
| `iconSize.medium` | `--mi-icon-size-medium` | `1.25rem` | Default size inside buttons, inputs and menu items. |
| `iconSize.large` | `--mi-icon-size-large` | `1.5rem` | Standalone icons, empty states and icon-only toolbars. |

## Contrast pairs

Every pair below is checked in CI against WCAG 2.2 AA: 4.5:1 for text, 3:1 for non-text indicators.
Ratios are truncated, never rounded up. All colors are opaque, so the ratio is that of the rendered pair.

| Foreground | Background | Ratio | Minimum | Usage | Result |
| --- | --- | --- | --- | --- | --- |
| `text.primary` | `surface.canvas` | 18.33:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.sunken` | 18.22:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.base` | 18.21:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.raised` | 17.56:1 | 4.50:1 | Body text and headings | Pass |
| `text.primary` | `surface.overlay` | 16.85:1 | 4.50:1 | Body text and headings | Pass |
| `text.secondary` | `surface.canvas` | 11.51:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.sunken` | 11.44:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.base` | 11.43:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.raised` | 11.02:1 | 4.50:1 | Supporting text | Pass |
| `text.secondary` | `surface.overlay` | 10.57:1 | 4.50:1 | Supporting text | Pass |
| `text.muted` | `surface.canvas` | 6.92:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.sunken` | 6.88:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.base` | 6.87:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.raised` | 6.63:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `text.muted` | `surface.overlay` | 6.36:1 | 4.50:1 | Placeholders, hints and captions | Pass |
| `border.strong` | `surface.canvas` | 3.89:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.strong` | `surface.sunken` | 3.87:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.strong` | `surface.base` | 3.87:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.strong` | `surface.raised` | 3.73:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `border.strong` | `surface.overlay` | 3.58:1 | 3.00:1 | Boundary of inputs and interactive controls | Pass |
| `focus.ring` | `surface.canvas` | 9.95:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.sunken` | 9.89:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.base` | 9.88:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.raised` | 9.53:1 | 3.00:1 | Focus indicator | Pass |
| `focus.ring` | `surface.overlay` | 9.14:1 | 3.00:1 | Focus indicator | Pass |
| `accent.link` | `surface.canvas` | 8.00:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.sunken` | 7.95:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.base` | 7.94:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.raised` | 7.66:1 | 4.50:1 | Links | Pass |
| `accent.link` | `surface.overlay` | 7.35:1 | 4.50:1 | Links | Pass |
| `accent.linkHover` | `surface.canvas` | 10.04:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.sunken` | 9.98:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.base` | 9.98:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.raised` | 9.62:1 | 4.50:1 | Hovered links | Pass |
| `accent.linkHover` | `surface.overlay` | 9.23:1 | 4.50:1 | Hovered links | Pass |
| `accent.onSelection` | `accent.selection` | 12.61:1 | 4.50:1 | Selected text | Pass |
| `text.primary` | `state.hover` | 16.12:1 | 4.50:1 | Text on a hover neutral item | Pass |
| `text.primary` | `state.pressed` | 15.18:1 | 4.50:1 | Text on a pressed neutral item | Pass |
| `text.primary` | `state.selected` | 14.08:1 | 4.50:1 | Text on a selected neutral item | Pass |
| `intent.official.contrastText` | `intent.official.main` | 8.00:1 | 4.50:1 | Label of a filled official control (main) | Pass |
| `intent.official.contrastText` | `intent.official.hover` | 8.92:1 | 4.50:1 | Label of a filled official control (hover) | Pass |
| `intent.official.contrastText` | `intent.official.pressed` | 5.89:1 | 4.50:1 | Label of a filled official control (pressed) | Pass |
| `intent.official.onContainer` | `intent.official.container` | 9.37:1 | 4.50:1 | Text on a soft official container (container) | Pass |
| `intent.official.onContainer` | `intent.official.containerHover` | 8.45:1 | 4.50:1 | Text on a soft official container (containerHover) | Pass |
| `intent.official.onContainer` | `intent.official.containerPressed` | 7.50:1 | 4.50:1 | Text on a soft official container (containerPressed) | Pass |
| `intent.official.text` | `surface.canvas` | 8.00:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.sunken` | 7.95:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.base` | 7.94:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.raised` | 7.66:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.text` | `surface.overlay` | 7.35:1 | 4.50:1 | official text, ghost and outline labels | Pass |
| `intent.official.border` | `surface.canvas` | 8.00:1 | 3.00:1 | Boundary of an outlined official control | Pass |
| `intent.official.border` | `surface.sunken` | 7.95:1 | 3.00:1 | Boundary of an outlined official control | Pass |
| `intent.official.border` | `surface.base` | 7.94:1 | 3.00:1 | Boundary of an outlined official control | Pass |
| `intent.official.border` | `surface.raised` | 7.66:1 | 3.00:1 | Boundary of an outlined official control | Pass |
| `intent.official.border` | `surface.overlay` | 7.35:1 | 3.00:1 | Boundary of an outlined official control | Pass |
| `intent.official.main` | `surface.canvas` | 8.00:1 | 3.00:1 | Boundary of a filled official control | Pass |
| `intent.official.main` | `surface.sunken` | 7.95:1 | 3.00:1 | Boundary of a filled official control | Pass |
| `intent.official.main` | `surface.base` | 7.94:1 | 3.00:1 | Boundary of a filled official control | Pass |
| `intent.official.main` | `surface.raised` | 7.66:1 | 3.00:1 | Boundary of a filled official control | Pass |
| `intent.official.main` | `surface.overlay` | 7.35:1 | 3.00:1 | Boundary of a filled official control | Pass |
| `intent.official.main` | `intent.official.container` | 6.87:1 | 3.00:1 | official progress indicator on its track | Pass |
| `intent.default.contrastText` | `intent.default.main` | 6.70:1 | 4.50:1 | Label of a filled default control (main) | Pass |
| `intent.default.contrastText` | `intent.default.hover` | 7.96:1 | 4.50:1 | Label of a filled default control (hover) | Pass |
| `intent.default.contrastText` | `intent.default.pressed` | 5.04:1 | 4.50:1 | Label of a filled default control (pressed) | Pass |
| `intent.default.onContainer` | `intent.default.container` | 9.12:1 | 4.50:1 | Text on a soft default container (container) | Pass |
| `intent.default.onContainer` | `intent.default.containerHover` | 8.30:1 | 4.50:1 | Text on a soft default container (containerHover) | Pass |
| `intent.default.onContainer` | `intent.default.containerPressed` | 7.50:1 | 4.50:1 | Text on a soft default container (containerPressed) | Pass |
| `intent.default.text` | `surface.canvas` | 6.70:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.sunken` | 6.66:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.base` | 6.66:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.raised` | 6.42:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.text` | `surface.overlay` | 6.16:1 | 4.50:1 | default text, ghost and outline labels | Pass |
| `intent.default.border` | `surface.canvas` | 6.70:1 | 3.00:1 | Boundary of an outlined default control | Pass |
| `intent.default.border` | `surface.sunken` | 6.66:1 | 3.00:1 | Boundary of an outlined default control | Pass |
| `intent.default.border` | `surface.base` | 6.66:1 | 3.00:1 | Boundary of an outlined default control | Pass |
| `intent.default.border` | `surface.raised` | 6.42:1 | 3.00:1 | Boundary of an outlined default control | Pass |
| `intent.default.border` | `surface.overlay` | 6.16:1 | 3.00:1 | Boundary of an outlined default control | Pass |
| `intent.default.main` | `surface.canvas` | 6.70:1 | 3.00:1 | Boundary of a filled default control | Pass |
| `intent.default.main` | `surface.sunken` | 6.66:1 | 3.00:1 | Boundary of a filled default control | Pass |
| `intent.default.main` | `surface.base` | 6.66:1 | 3.00:1 | Boundary of a filled default control | Pass |
| `intent.default.main` | `surface.raised` | 6.42:1 | 3.00:1 | Boundary of a filled default control | Pass |
| `intent.default.main` | `surface.overlay` | 6.16:1 | 3.00:1 | Boundary of a filled default control | Pass |
| `intent.default.main` | `intent.default.container` | 5.84:1 | 3.00:1 | default progress indicator on its track | Pass |
| `intent.success.contrastText` | `intent.success.main` | 9.84:1 | 4.50:1 | Label of a filled success control (main) | Pass |
| `intent.success.contrastText` | `intent.success.hover` | 10.70:1 | 4.50:1 | Label of a filled success control (hover) | Pass |
| `intent.success.contrastText` | `intent.success.pressed` | 7.17:1 | 4.50:1 | Label of a filled success control (pressed) | Pass |
| `intent.success.onContainer` | `intent.success.container` | 10.38:1 | 4.50:1 | Text on a soft success container (container) | Pass |
| `intent.success.onContainer` | `intent.success.containerHover` | 9.20:1 | 4.50:1 | Text on a soft success container (containerHover) | Pass |
| `intent.success.onContainer` | `intent.success.containerPressed` | 7.96:1 | 4.50:1 | Text on a soft success container (containerPressed) | Pass |
| `intent.success.text` | `surface.canvas` | 9.84:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.sunken` | 9.78:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.base` | 9.77:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.raised` | 9.42:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.text` | `surface.overlay` | 9.04:1 | 4.50:1 | success text, ghost and outline labels | Pass |
| `intent.success.border` | `surface.canvas` | 9.84:1 | 3.00:1 | Boundary of an outlined success control | Pass |
| `intent.success.border` | `surface.sunken` | 9.78:1 | 3.00:1 | Boundary of an outlined success control | Pass |
| `intent.success.border` | `surface.base` | 9.77:1 | 3.00:1 | Boundary of an outlined success control | Pass |
| `intent.success.border` | `surface.raised` | 9.42:1 | 3.00:1 | Boundary of an outlined success control | Pass |
| `intent.success.border` | `surface.overlay` | 9.04:1 | 3.00:1 | Boundary of an outlined success control | Pass |
| `intent.success.main` | `surface.canvas` | 9.84:1 | 3.00:1 | Boundary of a filled success control | Pass |
| `intent.success.main` | `surface.sunken` | 9.78:1 | 3.00:1 | Boundary of a filled success control | Pass |
| `intent.success.main` | `surface.base` | 9.77:1 | 3.00:1 | Boundary of a filled success control | Pass |
| `intent.success.main` | `surface.raised` | 9.42:1 | 3.00:1 | Boundary of a filled success control | Pass |
| `intent.success.main` | `surface.overlay` | 9.04:1 | 3.00:1 | Boundary of a filled success control | Pass |
| `intent.success.main` | `intent.success.container` | 8.25:1 | 3.00:1 | success progress indicator on its track | Pass |
| `intent.warning.contrastText` | `intent.warning.main` | 11.61:1 | 4.50:1 | Label of a filled warning control (main) | Pass |
| `intent.warning.contrastText` | `intent.warning.hover` | 12.37:1 | 4.50:1 | Label of a filled warning control (hover) | Pass |
| `intent.warning.contrastText` | `intent.warning.pressed` | 8.43:1 | 4.50:1 | Label of a filled warning control (pressed) | Pass |
| `intent.warning.onContainer` | `intent.warning.container` | 11.30:1 | 4.50:1 | Text on a soft warning container (container) | Pass |
| `intent.warning.onContainer` | `intent.warning.containerHover` | 9.84:1 | 4.50:1 | Text on a soft warning container (containerHover) | Pass |
| `intent.warning.onContainer` | `intent.warning.containerPressed` | 8.38:1 | 4.50:1 | Text on a soft warning container (containerPressed) | Pass |
| `intent.warning.text` | `surface.canvas` | 11.61:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.sunken` | 11.54:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.base` | 11.53:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.raised` | 11.12:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.text` | `surface.overlay` | 10.67:1 | 4.50:1 | warning text, ghost and outline labels | Pass |
| `intent.warning.border` | `surface.canvas` | 11.61:1 | 3.00:1 | Boundary of an outlined warning control | Pass |
| `intent.warning.border` | `surface.sunken` | 11.54:1 | 3.00:1 | Boundary of an outlined warning control | Pass |
| `intent.warning.border` | `surface.base` | 11.53:1 | 3.00:1 | Boundary of an outlined warning control | Pass |
| `intent.warning.border` | `surface.raised` | 11.12:1 | 3.00:1 | Boundary of an outlined warning control | Pass |
| `intent.warning.border` | `surface.overlay` | 10.67:1 | 3.00:1 | Boundary of an outlined warning control | Pass |
| `intent.warning.main` | `surface.canvas` | 11.61:1 | 3.00:1 | Boundary of a filled warning control | Pass |
| `intent.warning.main` | `surface.sunken` | 11.54:1 | 3.00:1 | Boundary of a filled warning control | Pass |
| `intent.warning.main` | `surface.base` | 11.53:1 | 3.00:1 | Boundary of a filled warning control | Pass |
| `intent.warning.main` | `surface.raised` | 11.12:1 | 3.00:1 | Boundary of a filled warning control | Pass |
| `intent.warning.main` | `surface.overlay` | 10.67:1 | 3.00:1 | Boundary of a filled warning control | Pass |
| `intent.warning.main` | `intent.warning.container` | 9.46:1 | 3.00:1 | warning progress indicator on its track | Pass |
| `intent.error.contrastText` | `intent.error.main` | 6.13:1 | 4.50:1 | Label of a filled error control (main) | Pass |
| `intent.error.contrastText` | `intent.error.hover` | 7.05:1 | 4.50:1 | Label of a filled error control (hover) | Pass |
| `intent.error.contrastText` | `intent.error.pressed` | 4.61:1 | 4.50:1 | Label of a filled error control (pressed) | Pass |
| `intent.error.onContainer` | `intent.error.container` | 8.19:1 | 4.50:1 | Text on a soft error container (container) | Pass |
| `intent.error.onContainer` | `intent.error.containerHover` | 7.57:1 | 4.50:1 | Text on a soft error container (containerHover) | Pass |
| `intent.error.onContainer` | `intent.error.containerPressed` | 6.88:1 | 4.50:1 | Text on a soft error container (containerPressed) | Pass |
| `intent.error.text` | `surface.canvas` | 6.13:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.sunken` | 6.09:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.base` | 6.08:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.raised` | 5.87:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.text` | `surface.overlay` | 5.63:1 | 4.50:1 | error text, ghost and outline labels | Pass |
| `intent.error.border` | `surface.canvas` | 6.13:1 | 3.00:1 | Boundary of an outlined error control | Pass |
| `intent.error.border` | `surface.sunken` | 6.09:1 | 3.00:1 | Boundary of an outlined error control | Pass |
| `intent.error.border` | `surface.base` | 6.08:1 | 3.00:1 | Boundary of an outlined error control | Pass |
| `intent.error.border` | `surface.raised` | 5.87:1 | 3.00:1 | Boundary of an outlined error control | Pass |
| `intent.error.border` | `surface.overlay` | 5.63:1 | 3.00:1 | Boundary of an outlined error control | Pass |
| `intent.error.main` | `surface.canvas` | 6.13:1 | 3.00:1 | Boundary of a filled error control | Pass |
| `intent.error.main` | `surface.sunken` | 6.09:1 | 3.00:1 | Boundary of a filled error control | Pass |
| `intent.error.main` | `surface.base` | 6.08:1 | 3.00:1 | Boundary of a filled error control | Pass |
| `intent.error.main` | `surface.raised` | 5.87:1 | 3.00:1 | Boundary of a filled error control | Pass |
| `intent.error.main` | `surface.overlay` | 5.63:1 | 3.00:1 | Boundary of a filled error control | Pass |
| `intent.error.main` | `intent.error.container` | 5.42:1 | 3.00:1 | error progress indicator on its track | Pass |
| `intent.info.contrastText` | `intent.info.main` | 9.92:1 | 4.50:1 | Label of a filled info control (main) | Pass |
| `intent.info.contrastText` | `intent.info.hover` | 10.93:1 | 4.50:1 | Label of a filled info control (hover) | Pass |
| `intent.info.contrastText` | `intent.info.pressed` | 7.26:1 | 4.50:1 | Label of a filled info control (pressed) | Pass |
| `intent.info.onContainer` | `intent.info.container` | 10.61:1 | 4.50:1 | Text on a soft info container (container) | Pass |
| `intent.info.onContainer` | `intent.info.containerHover` | 9.33:1 | 4.50:1 | Text on a soft info container (containerHover) | Pass |
| `intent.info.onContainer` | `intent.info.containerPressed` | 8.08:1 | 4.50:1 | Text on a soft info container (containerPressed) | Pass |
| `intent.info.text` | `surface.canvas` | 9.92:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.sunken` | 9.86:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.base` | 9.86:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.raised` | 9.51:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.text` | `surface.overlay` | 9.12:1 | 4.50:1 | info text, ghost and outline labels | Pass |
| `intent.info.border` | `surface.canvas` | 9.92:1 | 3.00:1 | Boundary of an outlined info control | Pass |
| `intent.info.border` | `surface.sunken` | 9.86:1 | 3.00:1 | Boundary of an outlined info control | Pass |
| `intent.info.border` | `surface.base` | 9.86:1 | 3.00:1 | Boundary of an outlined info control | Pass |
| `intent.info.border` | `surface.raised` | 9.51:1 | 3.00:1 | Boundary of an outlined info control | Pass |
| `intent.info.border` | `surface.overlay` | 9.12:1 | 3.00:1 | Boundary of an outlined info control | Pass |
| `intent.info.main` | `surface.canvas` | 9.92:1 | 3.00:1 | Boundary of a filled info control | Pass |
| `intent.info.main` | `surface.sunken` | 9.86:1 | 3.00:1 | Boundary of a filled info control | Pass |
| `intent.info.main` | `surface.base` | 9.86:1 | 3.00:1 | Boundary of a filled info control | Pass |
| `intent.info.main` | `surface.raised` | 9.51:1 | 3.00:1 | Boundary of a filled info control | Pass |
| `intent.info.main` | `surface.overlay` | 9.12:1 | 3.00:1 | Boundary of a filled info control | Pass |
| `intent.info.main` | `intent.info.container` | 8.29:1 | 3.00:1 | info progress indicator on its track | Pass |
| `chart.series.1` | `surface.canvas` | 8.00:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.1` | `surface.raised` | 7.66:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.2` | `surface.canvas` | 9.92:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.2` | `surface.raised` | 9.51:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.3` | `surface.canvas` | 9.84:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.3` | `surface.raised` | 9.42:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.4` | `surface.canvas` | 11.61:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.4` | `surface.raised` | 11.12:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.5` | `surface.canvas` | 7.73:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.5` | `surface.raised` | 7.40:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.6` | `surface.canvas` | 8.94:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.6` | `surface.raised` | 8.56:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.7` | `surface.canvas` | 11.14:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.7` | `surface.raised` | 10.67:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.8` | `surface.canvas` | 13.93:1 | 3.00:1 | Chart series mark | Pass |
| `chart.series.8` | `surface.raised` | 13.35:1 | 3.00:1 | Chart series mark | Pass |
