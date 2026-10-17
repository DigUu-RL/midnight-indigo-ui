# Escalas de cor

[English](./palette.md)

A identidade do Midnight Indigo: UI se apoia em três escalas de cor, exportadas por `@midnight-indigo/ui/tokens` como
`tokens.color` e declaradas no CSS como `--mi-color-<escala>-<tom>`. Os valores de cada tom estão em
[tokens.md](./tokens.md#color).

| Escala     | Tons                      | Cores de identidade                                                                            |
| ---------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| `pink`     | `50` a `950`              | `400`: rosa oficial `#FF6AC1`; `300`: seu hover `#FF93D0`                                      |
| `indigo`   | `50` a `950`              | `500`: sólido `#5E48D6`; `400`: hover e borda ativa `#7560F0`; `300`: texto e ícones `#8F7AFB` |
| `midnight` | `50` a `850`, de 50 em 50 | Neutro com matiz indigo, de `#F2EFFC` (`50`) a `#05040E` (`850`)                               |

Os tons vão do mais claro ao mais escuro. Os tons de `pink` e `indigo` ao redor das cores de identidade são
clareamentos (misturados com branco) e escurecimentos (misturados com o midnight mais escuro).

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

## Escalas e tema

As escalas são fixas: um tema criado com `createUiTheme` muda as intenções semânticas, nunca `tokens.color`. Com um
`palette.official.main` personalizado, `intent.official.main` segue a configuração, enquanto `color.pink.400`
continua `#FF6AC1`.

Os componentes referenciam os grupos semânticos (`surface`, `border`, `text`, `intent`, ...), não as escalas, para que
o tema chegue até eles. Use as escalas em elementos da aplicação que precisam manter as cores de identidade qualquer
que seja o tema.
