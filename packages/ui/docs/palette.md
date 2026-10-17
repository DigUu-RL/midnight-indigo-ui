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

## Scales and theme

The scales are fixed: a theme created with `createUiTheme` changes the semantic intents, never `tokens.color`. With a
custom `palette.official.main`, `intent.official.main` follows the configuration while `color.pink.400` stays
`#FF6AC1`.

Components reference the semantic groups (`surface`, `border`, `text`, `intent`, ...), not the scales, so a theme
reaches them. Use the scales for application elements that must keep the identity colors whatever the theme.
