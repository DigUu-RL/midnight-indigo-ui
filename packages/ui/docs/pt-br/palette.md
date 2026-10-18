# Escalas de cor

[English](../en-us/palette.md)

A identidade do Midnight Indigo: UI se apoia em três escalas de cor, exportadas por `@midnight-indigo/ui/tokens` como
`tokens.color` e declaradas no CSS como `--mi-color-<escala>-<tom>`. Os valores de cada tom estão em
[tokens.md](../en-us/tokens.md#color).

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

## Rosa × indigo

Cada cor de identidade tem um papel, para que a ação principal se destaque:

| Papel                           | Intenção                   | Onde                                                                                                               |
| ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Ação principal e foco           | `official` (rosa)          | No máximo **um** botão sólido rosa por tela; o anel de foco (`focus.ring`, 2 px, deslocamento 2 px)                |
| Seleção, item ativo e navegação | `brand` (indigo `#5E48D6`) | Checkbox, radio e switch marcados, chip selecionado, página atual, aba e item de sidebar ativos, texto selecionado |

`brand` é uma intenção semântica como as demais: todo componente que recebe `intent` aceita `intent='brand'` nas quatro
aparências (`solid`, `soft`, `outline`, `ghost`). Não o use para uma segunda ação principal: ações secundárias
continuam `default`.

O rótulo de um controle `brand` sólido é a tinta clara e mantém 4.5:1 em repouso, com hover e pressionado. O hover
derivado (4.13:1) não alcança esse mínimo, então o tema oficial fixa `intent.brand.hover` em `#664FDE` (4.96:1); um
tema que configura `palette.brand.main` deriva o hover novamente a partir da própria cor.

## Superfícies, bordas e elevação

Toda superfície, borda e estado vem da escala `midnight`. As superfícies vão da mais escura à mais clara: `canvas`,
`field`, `sidebar`, `tableHeader`, `raised`, `dialog` e `overlay`. Cada uma é mais clara que a de baixo, por um passo
pequeno ([camadas de superfície](../en-us/tokens.md#surface-layers)), então uma camada que precisa se destacar da vizinha
também recebe uma borda ou uma elevação.

| Necessidade                                         | Tokens                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| Contorno de um campo ou controle (3:1)              | `border.control`                                                        |
| Divisor, borda de contêiner, borda de destaque      | `border.subtle`, `border.default`, `border.strong` (decorativas, < 3:1) |
| Estado vazio ou área de soltar arquivos             | `stroke.dashed`                                                         |
| Card, menu ou popover, diálogo ou drawer            | `elevation.card`, `elevation.overlay`, `elevation.dialog`               |
| Brilho da ação principal sólida ou controle `brand` | `elevation.official`, `elevation.brand` (seguem o `main` do tema)       |
| Página atrás de um diálogo                          | `backdrop.scrim` com `backdrop-filter: blur(var(--mi-backdrop-blur))`   |

Um controle sólido é contornado por `intent.<intent>.border`, que é igual a `main`, a menos que `main` fique abaixo de
3:1 em alguma superfície: `brand.main` fica, em `raised`, `dialog` e `overlay`, então controles `brand` sólidos, a barra
da aba ativa e o ponto atual do carrossel usam o `brand.border`, mais claro.

### Migração da primeira paleta

| Removido                                  | Use                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `surface.sunken`                          | `surface.field` (campos, controles de escolha, blocos de código)       |
| `surface.base`                            | `surface.sidebar` (navegação), `surface.raised` (painéis, tabelas)     |
| `elevation.low`                           | `elevation.card`                                                       |
| `elevation.medium`                        | `elevation.overlay` (menus, popovers), `elevation.card` (cards)        |
| `elevation.high`                          | `elevation.dialog`                                                     |
| `border.strong` como contorno de controle | `border.control` (`#6E62A3`); `border.strong` agora é `#453C7A`, < 3:1 |

## Cores de apoio

Categorias, tags, avatares e gráficos precisam de mais cores do que as intenções. A paleta de apoio, `tokens.support`,
tem oito cores harmonizadas com o rosa e o indigo e não carrega significado: status continua com as intenções. As
intenções de status tiram o `main` dela, então uma categoria verde e um alerta `success` compartilham o tom.

| Cor         | `main`    | Também                          |
| ----------- | --------- | ------------------------------- |
| `pink`      | `#FF6AC1` | Rosa oficial                    |
| `violet`    | `#8F7AFB` | `color.indigo.300`              |
| `blue`      | `#65BDEB` | `intent.info.main` (info)       |
| `green`     | `#36C995` | `intent.success.main` (sucesso) |
| `amber`     | `#F2B84B` | `intent.warning.main` (atenção) |
| `red`       | `#F2545B` | `intent.error.main` (perigo)    |
| `turquoise` | `#3FD0C9` |                                 |
| `orange`    | `#F28A4B` |                                 |

Cada cor tem três tokens, declarados como `--mi-support-<color>-<field>`:

- `main`: a própria cor, para ícones, pontos e marcas de gráfico.
- `soft`: fundo tonal, `main` a 16% sobre a superfície abaixo dele.
- `text`: texto sobre `soft`. É igual a `main`, exceto em `violet` e `red`, cujo `main` fica abaixo de 4.5:1 sobre
  `soft` nas superfícies mais claras, então o `text` deles é um tom mais claro.

Sobre `soft`, de 14% a 18% e em qualquer superfície, `text` atinge 4.5:1 e `main`, 3:1 (verificado no CI; as razões
estão em [tokens.md](../en-us/tokens.md#support)).

```css
.category {
	background: var(--mi-support-violet-soft);
	color: var(--mi-support-violet-text);
}
```

`soft(color, alpha)` monta o mesmo fundo tonal a partir de qualquer cor, com `alpha` mantido entre 0.14 e 0.18.
`supportColorFor(text)` atribui uma cor de apoio a um texto, como um nome: o mesmo texto sempre recebe a mesma cor,
ignorando maiúsculas e espaços nas pontas.

```ts
import { soft, supportColorFor, tokens } from '@midnight-indigo/ui/tokens';

const color = supportColorFor('Samus Aran'); // 'pink'
tokens.support[color].text; // '#FF6AC1'
soft('#3FD0C9'); // 'rgb(63 208 201 / 0.16)'
```

As séries de gráfico (`chart.series`) são as cores de apoio, começando por rosa, violeta e azul; o vermelho vem por
último, porque também é lido como erro.

## Auditoria de contraste

`auditContrast(tokens)` mede cada par texto/fundo da paleta contra o WCAG 2.2 AA: 4.5:1 para texto, 3:1 para texto
grande e indicadores não textuais. Os pares derivam da estrutura dos tokens (texto × superfícies × intents × cores de
apoio sobre os fundos tonais, compostos sobre cada superfície), então uma nova superfície, intent ou cor de apoio é
auditada sozinha, e um novo token de cor fora dos pares reprova o teste até ganhar um par ou uma isenção documentada. O
teste roda em `pnpm test` e no CI e, ao falhar, lista cada par reprovado com os tokens, a razão e o uso. A lista
completa está em [pares de contraste](../en-us/tokens.md#contrast-pairs).

O design v2 aceita quatro pares abaixo do mínimo. Cada um guarda a menor razão que pode atingir, então uma mudança de
token que a reduza ainda mais continua reprovando:

| Par                                      | Razão | Onde                              | Por que é aceito                                                                        |
| ---------------------------------------- | ----- | --------------------------------- | --------------------------------------------------------------------------------------- |
| `border.default` sobre `surface.field`   | 1.4:1 | Contorno de um campo de texto     | O rótulo visível e o fundo do campo o identificam; o foco desenha a borda rosa, com 3:1 |
| `border.strong` sobre `surface.field`    | 2.1:1 | Contorno de um campo sob o cursor | O hover é um retorno extra, nunca o único jeito de achar o campo                        |
| `text.placeholder` sobre `surface.field` | 3.8:1 | Placeholder                       | Um exemplo do valor, nunca a única instrução: o rótulo continua visível                 |
| `border.default` sobre `surface.canvas`  | 1.5:1 | Polegar da barra de rolagem       | A rolagem não depende dele; os modos de alto contraste devolvem a barra do sistema      |

```ts
import { auditContrast, formatContrastReport, tokens } from '@midnight-indigo/ui/tokens';

formatContrastReport(auditContrast(tokens)); // '' quando todos os pares passam
```

## Escalas e tema

As escalas são fixas: um tema criado com `createUiTheme` muda as intenções semânticas, nunca `tokens.color`. Com um
`palette.official.main` personalizado, `intent.official.main` segue a configuração, enquanto `color.pink.400`
continua `#FF6AC1`.

Os componentes referenciam os grupos semânticos (`surface`, `border`, `text`, `intent`, ...), não as escalas, para que
o tema chegue até eles. Use as escalas em elementos da aplicação que precisam manter as cores de identidade qualquer
que seja o tema.
