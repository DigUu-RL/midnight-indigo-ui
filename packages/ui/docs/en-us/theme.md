# Theme engine

`@midnight-indigo/ui/theme` turns the [design tokens](./tokens.md) and an optional configuration into a theme,
provides it to React and applies it to CSS and to Material UI. The same API is re-exported by the root entry,
`@midnight-indigo/ui`. Midnight Indigo: UI is dark-only: a theme changes the palette, never the color scheme.

```tsx
import { createUiTheme, UiProvider } from '@midnight-indigo/ui/theme';

const theme = createUiTheme({ palette: { official: { main: '#FF6AC1' } } });

export const Application = ({ children }) => <UiProvider theme={theme}>{children}</UiProvider>;
```

## Configuration

`createUiTheme(config?, options?)` accepts a `UiThemeConfig`. It is plain data, so the same shape can live in a
TypeScript object or in a JSON file.

```ts
interface UiThemeConfig {
	palette?: Partial<Record<SemanticIntent, Partial<IntentSource>>>;
}
```

The intents are `official`, `brand`, `default`, `success`, `warning`, `error` and `info`. Each accepts `main` and any of the
derived fields listed in [tokens.md](./tokens.md#intent) (`light`, `dark`, `contrastText`, `container`,
`onContainer`, `border`, `text`, `hover`, `pressed`, `containerHover`, `containerPressed`). Colors are hexadecimal,
`#RRGGBB` or `#RGB`, in any case; they are normalized to uppercase `#RRGGBB`.

A `main` other than the default replaces the whole default source of its intent: fields the official theme pins for its
own color (`brand.hover`) are derived again from the new `main`. Otherwise the configured fields override the defaults.
The selected text (`accent.selection`) follows `brand`, and the focus ring stays the official pink.

### Fallbacks

| Omitted                                  | Result                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| The whole configuration, or `palette`    | The official theme, identical to `tokens` and to `defaultUiTheme`.            |
| An intent                                | That intent keeps its default colors.                                         |
| `main` of a configured intent            | The default `main` of that intent is used; the configured fields still apply. |
| A derived field (`light`, `border`, ...) | Derived from `main` deterministically: same input, same output.               |
| Surfaces, text, borders, spacing, motion | Not configurable yet; always the official values.                             |
| Color scales (`color`)                   | Fixed by design: the identity scales of [palette.md](./palette.md).           |
| Typography and icon sizes                | Not configurable yet; always the official values.                             |

### JSON

Load the JSON however suits the application and validate it with `parseUiThemeConfig`, which also accepts the JSON
text. JSON strings are not typed as colors, so the validation is what turns the file into a `UiThemeConfig`.

```ts
import { createUiTheme, parseUiThemeConfig } from '@midnight-indigo/ui/theme';
import themeConfiguration from './theme.json' with { type: 'json' };

export const theme = createUiTheme(parseUiThemeConfig(themeConfiguration));
```

### Errors and warnings

A malformed configuration throws `UiThemeConfigError`. Its `issues` list every problem, not only the first one, each
with the dotted path of the offending value:

```text
Invalid Midnight Indigo theme configuration:
  - palette.official.main: invalid color "pink": expected a hexadecimal color in the form #RRGGBB or #RGB.
  - palette.primary: unknown intent. Expected one of: official, brand, default, success, warning, error, info.
  - palette.info.mian: unknown field. Expected one of: main, light, dark, contrastText, ...
```

A valid palette that misses a WCAG 2.2 AA minimum is still created. Each failing pair of the
[contrast audit](./tokens.md#contrast-pairs) is reported through `options.onWarning` (default: `console.warn`) and
listed in `theme.warnings`:

```text
accent.linkHover on surface.canvas FAILS 4.50:1 (text): 3.59:1. Used for: Hovered links. Adjust one of the two tokens.
```

Pass `{ onWarning: () => {} }` to silence the console, or throw from it to make warnings fatal in CI.

## Provider

`UiProvider` is a Client Component. Place a single one at the root of the application.

| Prop       | Default          | Purpose                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------- |
| `theme`    | `defaultUiTheme` | Theme created by `createUiTheme`.                                                     |
| `baseline` | `true`           | Global styles: the document (canvas, text, box sizing) and the native browser styles. |

With `baseline`, `body` also receives the `body` typographic role, and what the browser draws by itself (scrollbars,
selection, autofill, native controls, focus ring, links and other text elements) follows the theme, with zero
specificity (see [native-styles.md](./native-styles.md)). With `baseline={false}`, no global style is applied.

`useUiTheme()` returns the theme of the nearest provider, or the official theme outside of one.
`usePrefersReducedMotion()` returns the reduced motion preference of the user; the provider uses it to remove the
Material UI transitions.

A theme is frozen plain data without functions, so a Server Component can create it and pass it to `UiProvider`.

## CSS

Every token is a CSS custom property named after its path: `intent.official.main` is `--mi-intent-official-main`.
`UiProvider` declares them on `:root` with the values of its theme, so application CSS follows the configured palette:

```css
.panel {
	border: 1px solid var(--mi-border-default);
	background: var(--mi-surface-raised);
	color: var(--mi-intent-official-text);
}
```

In TypeScript, `themeVariables` holds the same references with the shape of the token tree, e.g.
`themeVariables.intent.official.main === 'var(--mi-intent-official-main)'`, for inline styles and CSS-in-JS.

The library stylesheets use cascade layers, in increasing priority:

1. `midnight-indigo.defaults`: the official tokens of `@midnight-indigo/ui/styles.css`.
2. `midnight-indigo.theme`: the theme injected by `UiProvider`.
3. Unlayered application CSS, which always wins.

`@midnight-indigo/ui/styles.css` is meant for pages rendered without React, or without `UiProvider`; with the provider,
importing it is unnecessary. `createThemeStylesheet(theme, selector?)` renders the stylesheet of any theme, e.g. to
write it to a static file at build time.

## Material UI

`UiProvider` configures Material UI from the theme, so Material UI components rendered inside it follow the palette.
Material UI stays an implementation detail: the public API is `UiTheme`, not the Material UI theme. When an
application deliberately renders Material UI components with its own `ThemeProvider`, `toMuiTheme(theme)` returns the
equivalent theme; pass `{ reducedMotion: true }` to zero its transitions and disable the ripple, as the provider does
when the user prefers reduced motion:

| Material UI                                   | Theme                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| `palette.mode`                                | `'dark'`                                                                       |
| `palette.primary`                             | `intent.official` (`main`, `light`, `dark`, `contrastText`)                    |
| `palette.secondary`                           | `intent.default`                                                               |
| `palette.success`, `warning`, `error`, `info` | The intent of the same name                                                    |
| `palette.background`                          | `default`: `surface.canvas`; `paper`: `surface.raised`                         |
| `palette.text`                                | `text.primary`, `text.secondary`, `text.disabled`                              |
| `palette.divider`                             | `border.default`                                                               |
| `palette.action`                              | `state.hover`, `state.selected`, `state.disabledText`, `state.disabledSurface` |
| `shape.borderRadius`                          | `radius.control`                                                               |
| `typography.fontFamily`                       | `fontFamily.sans`                                                              |
| `typography.h1`, `h2`, `h3`                   | `typography.display`, `headingLarge`, `headingMedium`                          |
| `typography.h4`, `h5`, `h6`                   | `typography.headingSmall`                                                      |
| `typography.subtitle1`, `subtitle2`           | `typography.body` (medium weight), `typography.label`                          |
| `typography.body1`, `body2`                   | `typography.body`, `typography.bodySmall`                                      |
| `typography.button`                           | `typography.label`, without uppercase                                          |
| `typography.caption`, `overline`              | `typography.caption` (`overline` uppercase)                                    |
| `transitions.duration`                        | `motion.duration` `fast`, `moderate`, `slow`; all `0` under reduced motion     |
| `transitions.easing`                          | `easeInOut`, `sharp`: `standard`; `easeOut`: `enter`; `easeIn`: `exit`         |

## Next.js App Router

```tsx
// app/layout.tsx (Server Component)
import { UiProvider } from '@midnight-indigo/ui/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

import { theme } from '../theme';

const RootLayout = ({ children }) => (
	<html lang='en'>
		<body>
			<AppRouterCacheProvider>
				<UiProvider theme={theme}>{children}</UiProvider>
			</AppRouterCacheProvider>
		</body>
	</html>
);

export default RootLayout;
```

- The theme stylesheet is a React 19 hoistable `<style>`: React places it in the `<head>` of the first flush and
  deduplicates it by content across streamed chunks and hydration.
- `AppRouterCacheProvider` (from `@mui/material-nextjs`, matching the Next.js major version) collects the Material UI
  styles during server rendering and streams them into the `<head>`. Without it they are injected only after
  hydration, which shows an unstyled flash. The library does not depend on Next.js, so the application adds it.

`templates/nextjs-starter` is the reference setup. Its test serves the production build and checks that the theme and
the Material UI styles are in the `<head>` of the first flush, that a streamed `Suspense` boundary arrives later
without duplicating them, and that the palette of `theme.json` reaches the CSS.

## Peer dependencies

`react` and `react-dom` 19, `@mui/material` 9, `@emotion/react` and `@emotion/styled` 11. `@midnight-indigo/ui/tokens`
does not import any of them.
