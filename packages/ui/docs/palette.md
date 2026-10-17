# Color scales

[Português](./palette.pt-BR.md)

The identity of Midnight Indigo: UI rests on three color scales, exported by `@midnight-indigo/ui/tokens` as
`tokens.color` and declared in CSS as `--mi-color-<scale>-<step>`. The values of every step are in
[tokens.md](./tokens.md#color).

| Scale      | Steps                   | Identity colors                                                                                   |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `pink`     | `50` to `950`           | `400`: official pink `#FF6AC1`; `300`: its hover `#FF93D0`                                        |
| `indigo`   | `50` to `950`           | `500`: solid `#5E48D6`; `400`: hover and active border `#7560F0`; `300`: text and icons `#8F7AFB` |
| `midnight` | `50` to `850`, every 50 | Neutral with an indigo hue, from `#F2EFFC` (`50`) to `#05040E` (`850`)                            |

Steps go from the lightest to the darkest. The steps of `pink` and `indigo` around the identity colors are tints
(mixed with white) and shades (mixed with the darkest midnight).

```css
.badge {
	border: 1px solid var(--mi-color-indigo-400);
	background: var(--mi-color-midnight-600);
	color: var(--mi-color-pink-400);
}
```

```ts
import { tokens } from '@midnight-indigo/ui/tokens';
import { themeVariables } from '@midnight-indigo/ui/theme';

tokens.color.indigo['500']; // '#5E48D6'
themeVariables.color.midnight['850']; // 'var(--mi-color-midnight-850)'
```

## Pink × indigo

Each identity color has one role, so the main action stands out:

| Role                                  | Intent                     | Where                                                                                                       |
| ------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Main action and focus                 | `official` (pink)          | At most **one** solid pink button per screen; the focus ring (`focus.ring`, 2 px, offset 2 px)              |
| Selection, active item and navigation | `brand` (indigo `#5E48D6`) | Checked checkbox, radio and switch, selected chip, current page, active tab and sidebar item, selected text |

`brand` is a semantic intent like the others: every component that takes `intent` accepts `intent='brand'` in the four
appearances (`solid`, `soft`, `outline`, `ghost`). Do not use it for a second main action: secondary actions stay
`default`.

The label of a solid `brand` control is the light ink and keeps 4.5:1 at rest, hovered and pressed. The derived hover
(4.13:1) misses it, so the official theme pins `intent.brand.hover` to `#664FDE` (4.96:1); a theme that configures
`palette.brand.main` derives the hover again from its own color.

## Surfaces, borders and elevation

Every surface, border and state comes from the `midnight` scale. The surfaces go from the darkest to the lightest:
`canvas`, `field`, `sidebar`, `tableHeader`, `raised`, `dialog` and `overlay`. Each one is lighter than the one below it,
by a small step ([surface layers](./tokens.md#surface-layers)), so a layer that must stand out from its neighbor also
takes a border or an elevation.

| Need                                           | Tokens                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Boundary of an input or control (3:1)          | `border.control`                                                         |
| Divider, container border, emphasized border   | `border.subtle`, `border.default`, `border.strong` (decorative, < 3:1)   |
| Empty state or drop zone                       | `stroke.dashed`                                                          |
| Card, menu or popover, dialog or drawer        | `elevation.card`, `elevation.overlay`, `elevation.dialog`                |
| Glow of a solid main action or `brand` control | `elevation.official`, `elevation.brand` (follow the `main` of the theme) |
| Page behind a dialog                           | `backdrop.scrim` with `backdrop-filter: blur(var(--mi-backdrop-blur))`   |

A solid control is bounded by `intent.<intent>.border`, which equals `main` unless `main` is below 3:1 on a surface:
`brand.main` is, on `raised`, `dialog` and `overlay`, so solid `brand` controls, the active tab bar and the current
carousel dot use the lighter `brand.border`.

### Migrating from the first palette

| Removed                              | Use                                                                   |
| ------------------------------------ | --------------------------------------------------------------------- |
| `surface.sunken`                     | `surface.field` (inputs, choice controls, code blocks)                |
| `surface.base`                       | `surface.sidebar` (navigation), `surface.raised` (panels, tables)     |
| `elevation.low`                      | `elevation.card`                                                      |
| `elevation.medium`                   | `elevation.overlay` (menus, popovers), `elevation.card` (cards)       |
| `elevation.high`                     | `elevation.dialog`                                                    |
| `border.strong` as a control outline | `border.control` (`#6E62A3`); `border.strong` is now `#453C7A`, < 3:1 |

## Scales and theme

The scales are fixed: a theme created with `createUiTheme` changes the semantic intents, never `tokens.color`. With a
custom `palette.official.main`, `intent.official.main` follows the configuration while `color.pink.400` stays
`#FF6AC1`.

Components reference the semantic groups (`surface`, `border`, `text`, `intent`, ...), not the scales, so a theme
reaches them. Use the scales for application elements that must keep the identity colors whatever the theme.
