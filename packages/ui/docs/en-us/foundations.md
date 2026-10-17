# Typography, icons and motion

How to apply the typography, icon and motion tokens. The values themselves are listed in
[tokens.md](./tokens.md#typography), generated from the code.

## Typography

### Typefaces

The interface uses **[Geist Sans](https://vercel.com/font)**, through the `fontFamily.sans` stack:

```text
'Geist Variable', Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

Code, numbers, identifiers and amounts use **Geist Mono**, through the `fontFamily.mono` stack:

```text
'Geist Mono Variable', 'Geist Mono', ui-monospace, SFMono-Regular, 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace
```

The library ships **no font file** and never requests one. The application self-hosts Geist Sans and Geist Mono, so
pages work without any call to an external font service and fall back to the system fonts while they load
(`font-display: swap`) or when they are absent. Geist is distributed under the
[SIL Open Font License 1.1](https://openfontlicense.org), which allows bundling, self-hosting and redistribution with
software, including commercial software; the font cannot be sold on its own, and a modified version must not keep the
name Geist.

The recommended setup is the [`@fontsource-variable/geist`](https://fontsource.org/fonts/geist) and
[`@fontsource-variable/geist-mono`](https://fontsource.org/fonts/geist-mono) packages, a single variable file per
subset with every weight (100 to 900). Import them once, at the root of the application:

```ts
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
```

The bundler copies the font files into the build and serves them from the application origin. The browser downloads
only the subsets (`unicode-range`) that the page uses. With Next.js, `next/font/local` pointing at the same files
also works. Avoid a `<link>` to Google Fonts, which downloads the font at runtime from an external service, and
prefer the package to `next/font/google`, which makes every build depend on that service.

`templates/nextjs-starter` is the reference setup. Its test checks that no font is requested from another origin and
that the `@font-face` files are served by the application.

> Decision D02 (typeface) adopts Geist Sans and Geist Mono as the official typefaces: see the
> [Decisões técnicas](https://github.com/DigUu-RL/midnight-indigo-ui/wiki/Decisões-técnicas#d02-tipografia-oficial)
> wiki page.

### Scale

Sizes in px at the default browser text size (16 px), as size / weight.

| Role            | Element     | Size / weight | Usage                                                      |
| --------------- | ----------- | ------------- | ---------------------------------------------------------- |
| `display`       | —           | 40 / 700      | Key figures and hero titles; at most one per view.         |
| `headingLarge`  | `h1`        | 32 / 700      | Page title.                                                |
| `headingMedium` | `h2`        | 24 / 700      | Section title.                                             |
| `headingSmall`  | `h3`        | 18 / 600      | Card, panel and dialog title.                              |
| `body`          | `p`, inputs | 15 / 400      | Default text. `UiProvider` applies it to `body`.           |
| `bodySmall`     | —           | 13 / 400      | Dense text: table cells, secondary list text, helper text. |
| `label`         | —           | 13 / 500      | Buttons, form labels, tabs and menu items.                 |
| `caption`       | —           | 12 / 400      | Timestamps, footnotes, annotations; never essential-only.  |
| `overline`      | —           | 11 / 600      | Uppercase eyebrow above a title, navigation group labels.  |
| `code`          | `code`      | 13 / 500      | Inline code and identifiers, in Geist Mono.                |

Choose the role by meaning, then pick the HTML element by document structure: a card title is `headingSmall` whether
it is an `h2` or an `h3`. Skipping heading levels to get a smaller size breaks navigation by headings.

### Numbers

Numbers, identifiers and amounts are always set in Geist Mono with tabular digits (`font-variant-numeric:
tabular-nums`), so values line up from row to row and do not shift while they update. Keep the role that gives the
size and weight, and override the font:

```tsx
<p
	style={{
		...themeVariables.typography.display,
		fontFamily: themeVariables.fontFamily.mono,
		fontVariantNumeric: 'tabular-nums',
	}}
>
	R$ 12.480,00
</p>
```

The library components do it already: the value and the change of `StatCard`, the value of `Slider` and the file sizes
of `FileUpload`.

### Wrapping

Headings and paragraphs use `text-wrap: pretty`, so the browser avoids leaving a single short word on the last line;
browsers that do not support it wrap as usual. `UiProvider` applies it to `h1`–`h6` and `p` and to the Material UI
heading and body variants, and the library components apply it to their titles and descriptions.

### Applying a role

Every role has the fields `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` and `textTransform`,
named after the CSS properties. In TypeScript, a role of `themeVariables` is a ready style object:

```tsx
import { themeVariables } from '@midnight-indigo/ui/theme';

<h2 style={themeVariables.typography.headingMedium}>Revenue</h2>;
```

In CSS, use the custom properties:

```css
.card-title {
	font-family: var(--mi-typography-heading-small-font-family);
	font-size: var(--mi-typography-heading-small-font-size);
	font-weight: var(--mi-typography-heading-small-font-weight);
	line-height: var(--mi-typography-heading-small-line-height);
	letter-spacing: var(--mi-typography-heading-small-letter-spacing);
	text-transform: var(--mi-typography-heading-small-text-transform);
}
```

Material UI components follow the same scale: `UiProvider` maps the roles to the Material UI variants (see
[theme.md](./theme.md#material-ui)).

### Global styles

With `baseline` (the default), `UiProvider` styles `body` (role `body`, `text.primary` on `surface.canvas`),
`code, kbd, pre, samp` (Geist Mono, tabular digits) and what the browser draws by itself, such as scrollbars, selection
and links ([native-styles.md](./native-styles.md)). Headings, paragraphs and lists keep the browser defaults apart from
`text-wrap: pretty`, so the library never fights the styles of the application; give them a role explicitly. Library components (from F05 on) set their
own typography and do not depend on global styles.

### Zoom, reflow and truncation

- Font sizes are in `rem` and line heights are unitless, so text follows the browser text size setting and zoom.
  Never set a font size in `px` on `html`.
- The smallest size is `overline`, `0.6875rem`, always in capitals with a wide tracking and only for a few words;
  the smallest size of sentences is `caption`, `0.75rem`. Running text (`body`, `bodySmall`) has a line height of at
  least 1.5.
- Layouts must reflow at 320 CSS pixels wide (400% zoom) without horizontal scrolling: let rows wrap
  (`flex-wrap: wrap`) and avoid fixed heights around text.
- Truncate only text whose full content stays available: in a `title`, a tooltip, an expandable row or a detail view.
  Labels of controls, error messages and headings are never truncated. A truncating flex item needs `min-width: 0`:

```css
.truncate {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
```

The starter shows every role in a row that wraps on narrow viewports and truncates with the full text in `title`.
Browser checks of zoom and reflow run with the end-to-end tests (F17).

## Icons

`Icon` (root entry, `@midnight-indigo/ui`, and `@midnight-indigo/ui/icons`) renders inline SVG content. It is a Server
Component-safe primitive and is not tied to an icon set. The icons of Iconify, rendered offline with the same rule, are
`IconifyIcon` of `@midnight-indigo/ui/icons` ([icons.md](./icons.md)). How components take icons (slots, decorative by
default) is described in [components.md](./components.md#slots-and-icons).

```tsx
import { Icon } from '@midnight-indigo/ui';

<Icon label='Completed' size='medium'>
	<path d='M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' />
</Icon>;
```

| Prop                    | Default               | Purpose                                                    |
| ----------------------- | --------------------- | ---------------------------------------------------------- |
| `label` or `decorative` | required              | Accessible name, or hidden from assistive technologies.    |
| `size`                  | `'inherit'`           | `small`, `medium`, `large` (`iconSize` tokens) or `1em`.   |
| `viewBox`               | `'0 0 24 24'`         | Coordinate system of the content.                          |
| SVG attributes          | `fill='currentColor'` | E.g. `fill='none' stroke='currentColor'` for outline sets. |

### Accessible name or decorative

The type requires exactly one of `label` and `decorative`; leaving both out, or passing both, does not compile. A
blank `label` throws.

- **Functional** — the icon conveys information that is not in text next to it: a status, a standalone indicator.
  Give it a `label` describing the meaning, not the drawing (`'Completed'`, not `'Check mark'`). It renders
  `role="img"` and `aria-label`.
- **Decorative** — the icon repeats adjacent text, or sits inside a control named by its own text or `aria-label`.
  Mark it `decorative`. It renders `aria-hidden="true"` and `focusable="false"`. An icon-only button is named by the
  button (`aria-label` on the button), so its icon is decorative.

`iconAccessibilityProps({ label })` or `iconAccessibilityProps({ decorative: true })` returns the same attributes for
any other icon component:

```tsx
<SomeIcon {...iconAccessibilityProps({ label: 'Warning' })} />
```

### Size and contrast

- Inline with text, keep `size='inherit'` so the icon follows the text size and zoom. Use `medium` inside buttons,
  inputs and menu items, `small` in dense controls and `large` for standalone icons.
- Icons are filled with `currentColor` and take the color of their text. A functional icon needs 3:1 against its
  background (WCAG 1.4.11); every text token except `text.disabled`, and every intent `text`, `main`, `onContainer`
  and `contrastText`, meets it on the surfaces it is meant for. Never color an icon with a `border` token.
- Warning and error are never conveyed by hue alone: pair the icon with text, or give it a `label`.

## Motion

Durations (`motion.duration`) and curves (`motion.easing`) are tokens. Use `enter` for elements that appear, `exit`
for elements that leave and `standard` for changes in place.

```css
.panel {
	transition: background-color var(--mi-motion-duration-fast) var(--mi-motion-easing-standard);
}
```

Reduced motion is handled at three levels:

1. **CSS** — under `prefers-reduced-motion: reduce`, every `--mi-motion-duration-*` becomes `0ms`, so transitions and
   animations written with the variables stop.
2. **Material UI** — `UiProvider` reads the preference and zeroes every Material UI transition duration and disables
   the ripple. `toMuiTheme(theme, { reducedMotion: true })` does the same for a theme applied by hand.
3. **JavaScript** — `usePrefersReducedMotion()` returns the preference for animations driven by code (carousels,
   charts, scrolling). It is `false` during server rendering and hydration, then follows the system setting.

Motion that conveys essential information, such as a progress indicator, may keep moving; replace it with a static
equivalent when possible. Autoplay stops entirely under reduced motion.
