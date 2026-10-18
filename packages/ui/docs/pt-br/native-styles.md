# Estilos nativos do navegador

[English](../en-us/native-styles.md)

Os componentes seguem o tema, mas o navegador também desenha coisas por conta própria: as barras de rolagem, a seleção
de texto, o fundo dos campos preenchidos automaticamente, os controles nativos (botões, campos, `select`, checkboxes,
radios, ranges, campos de data e hora, barras de progresso e medidores), elementos estruturais sem componente próprio
(tabelas, listas, `details`, `fieldset`, `dialog`) e o anel de foco padrão. Sem tratamento, eles aparecem com a
aparência do navegador e quebram a aparência escura de qualquer página. Com `baseline` (o padrão), o `UiProvider` os
reseta e os estiliza com os tokens do tema: nenhum elemento mostra um estilo padrão do navegador, no Chromium, no
Firefox e no WebKit.

```tsx
import { UiProvider } from '@midnight-indigo/ui/theme';

<UiProvider>{children}</UiProvider>; // baseline ligada
<UiProvider baseline={false}>{children}</UiProvider>; // nenhum estilo global
```

## Prioridade

Os tokens do tema vêm antes de qualquer padrão do navegador: onde o tema tem um valor, o padrão do navegador é resetado
e substituído por ele. Para mudar a aparência de um elemento nativo, mude o tema (a paleta passada a `createUiTheme` ou
ao `UiProvider`); a baseline lê toda cor como uma referência `var(--mi-*)`, então segue essa paleta sozinha. Os glyphs
que ela desenha como imagens (o chevron de um `select`, o check de um checkbox, o ícone dos campos de data e hora, o
chevron de `summary`) e o fundo atrás de um diálogo não conseguem ler uma custom property: o `UiProvider` os resolve a
partir do próprio `theme`. Toda regra de elemento fica dentro de `:where()`, cuja especificidade é zero, então uma
classe de um componente ou da aplicação ainda vence, mas a baseline não foi feita para ser sobrescrita elemento a
elemento.

Para aplicar a baseline sem o `UiProvider`, passe `createNativeBaselineStyles(theme)` ao `GlobalStyles` do Material UI
(`nativeBaselineStyles` é o mesmo para o tema oficial).

## O que a baseline estiliza

| Elemento nativo                                        | Estilo                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Documento                                              | `color-scheme: dark`, para que seletores de data e popups de formulário fiquem escuros.                                     |
| `button`, `input`, `select`, `textarea`                | Reset: `appearance: none`, `font: inherit`, `color: inherit`, sem fundo, sem borda.                                         |
| Controles desabilitados                                | Texto `text.disabled` e cursor `not-allowed`; um botão de arquivo desabilitado sobre `state.disabledSurface`.               |
| `select` (simples)                                     | O glyph `chevronDown` em `text.muted` no fim da linha (`text.disabled` quando desabilitado).                                |
| `option`, `optgroup`                                   | Fundo `surface.overlay`, texto `text.primary`.                                                                              |
| `input` `checkbox`, `radio`                            | Caixa `border.control` sobre `surface.field`; marcado, `intent.brand.main` com o glyph `check` (ou `minus`) ou um ponto.    |
| `input` `range`                                        | Barra `border.default`, polegar `intent.brand.main` (e preenchimento no Firefox).                                           |
| `input` `color`                                        | Quadrado `controlHeight.small` com borda `border.control` e amostra arredondada.                                            |
| Campos de data e hora                                  | O glyph `calendar` (ou `clock`) no indicador do navegador, que continua abrindo o seletor no clique.                        |
| `input` com um `datalist`                              | O glyph `chevronDown` em `text.muted` no botão que abre as sugestões.                                                       |
| `input` `search`                                       | O glyph `close` em `text.muted` no botão que limpa o campo, mostrado quando o navegador o mostra.                           |
| `input` `number`                                       | Sem botões de incremento.                                                                                                   |
| `::file-selector-button`                               | Um botão secundário: `surface.raised`, borda `border.control`, `text.primary`.                                              |
| `progress`, `meter`                                    | Barra `border.subtle`; valor em `intent.brand.main` (medidores: sucesso, alerta, erro por região).                          |
| `progress` sem valor                                   | Um segmento percorre a barra; fica parado com a preferência por movimento reduzido.                                         |
| `fieldset`, `legend`                                   | Borda `border.subtle` com o raio de um card; legenda semibold em `text.primary`.                                            |
| `details`, `summary`                                   | O glyph `chevronRight` no lugar do marcador, virado para baixo quando aberto (espelhado da direita para a esquerda).        |
| `dialog`, `::backdrop`                                 | `surface.dialog`, `border.subtle`, `radius.dialog`, `elevation.dialog`; fundo `backdrop.scrim`, desfocado.                  |
| `table`, `th`, `td`                                    | Bordas colapsadas, cabeçalho `surface.tableHeader` em caixa alta 11/600 `text.muted`, linhas separadas por `border.subtle`. |
| `ul`, `ol`, `::marker`, `dl`                           | Recuo `spacing.6`; marcadores em `text.muted` (algarismos tabulares); `dt` semibold, `dd` em `text.secondary`.              |
| `pre`                                                  | Bloco `surface.field` com borda `border.subtle` e as barras de rolagem do tema.                                             |
| Barra de rolagem da página                             | Fina, polegar `border.default` sobre trilho `surface.canvas`; com o cursor em cima, `border.control`.                       |
| Seleção de texto (`::selection`)                       | Fundo `accent.selection` (brand), texto `accent.onSelection` (um par auditado).                                             |
| Cursor de texto                                        | `caret-color: focus.ring` (o rosa oficial).                                                                                 |
| Campos com autofill (`:autofill`, `:-webkit-autofill`) | Fundo `surface.field` e texto `text.primary` em vez do preenchimento azul ou amarelo.                                       |
| Foco de elementos nativos (`:focus-visible`)           | O anel de foco rosa dos componentes: `focus.width` sólido `focus.ring`, deslocamento `focus.offset`.                        |
| `::placeholder`                                        | `text.placeholder`, totalmente opaco.                                                                                       |
| `a`, `a:hover`                                         | `accent.link`, `accent.linkHover`.                                                                                          |
| `hr`, `kbd`, `mark`, `abbr[title]`, `blockquote`       | Bordas e superfícies do tema; `mark` usa o par suave de alerta; `abbr` é sublinhado pontilhado.                             |
| `code`, `kbd`, `pre`, `samp`                           | Geist Mono (`fontFamily.mono`) com algarismos tabulares; `code` em linha sobre `surface.overlay`.                           |
| `h1`–`h6`, `p`                                         | `text-wrap: pretty`, para que a última linha não fique com uma única palavra curta.                                         |
| Rolagem                                                | `scroll-behavior: smooth` apenas para quem não pediu movimento reduzido.                                                    |
| Páginas com a barra superior do `DashboardLayout`      | `scroll-padding-top` igual à altura dela, para que âncoras e elementos focados parem abaixo dela.                           |
| Navegadores móveis                                     | Sem destaque de toque; `text-size-adjust: 100%` (sem aumento automático do texto).                                          |

A baseline nunca redefine margens ou alturas de linha do conteúdo. Títulos e parágrafos mantêm os padrões do navegador,
exceto pelo `text-wrap: pretty`. Um controle nativo resetado recebe a fonte e a cor do elemento pai e não desenha borda
própria, a menos que o tema desenhe uma (checkboxes, radios, seletores de cor, o botão de arquivo). O Firefox não
desenha nem o indicador dos campos de data nem os botões de incremento como pseudo-elementos: o botão de data dele
mantém a cor do texto do campo, e `appearance: none` remove os botões de incremento.

O placeholder (`text.placeholder`, 3,8:1 sobre `surface.field`) e o polegar da barra de rolagem da página
(`border.default`, 1,5:1 sobre `surface.canvas`) ficam abaixo do mínimo da WCAG de propósito: são exceções aceitas da
auditoria de contraste (veja [palette.md](./palette.md)), já que o placeholder é só um exemplo do valor e a rolagem
nunca depende do polegar.

### Modos de alto contraste

Nos temas de contraste do Windows (`forced-colors: active`), as cores de sistema substituem o tema: as barras de
rolagem voltam a ser as do sistema, a seleção, o anel de foco e `mark` usam `Highlight`, `HighlightText`, `Mark` e
`MarkText`, e os controles nativos recuperam a aparência, o fundo e a borda do sistema (`revert`), para que os limites
deles continuem visíveis; os desabilitados usam `GrayText`. As partes desenhadas dentro deles (trilhos e polegares de
ranges, amostras de cor, botões de data, de sugestões e de limpar, botões de arquivo, barras de progresso e medidores) voltam inteiras ao navegador (`all: revert`), e `summary`
mostra o marcador do sistema no lugar do chevron, uma imagem de cor fixa. Nada na biblioteca define `forced-color-adjust`, então o navegador mantém o controle de todas
as cores.

## Contêineres roláveis

Um contêiner que rola dentro da página (um menu, uma tabela, um drawer, uma lista) recebe as mesmas barras de rolagem
com `scrollbarStyles`. Os componentes da biblioteca que rolam já o usam: `Table`, `Sidebar`, `Combobox`, `Dialog`,
`Drawer`, `Menu`, `ContextMenu` e `Popover`.

```tsx
import { scrollbarStyles } from '@midnight-indigo/ui/theme';
import { styled } from '@mui/material/styles';

const Results = styled('div')({ ...scrollbarStyles, maxHeight: '20rem', overflowY: 'auto' });
```

O trilho é transparente, então funciona sobre qualquer superfície. Chromium e Firefox leem `scrollbar-color`; o WebKit
desenha os pseudo-elementos `::-webkit-scrollbar`, que o Chromium ignora quando `scrollbar-color` está definido.

Uma fileira que rola na horizontal e mostra por si mesma que continua, como as fileiras de `Tabs` e `TabNavigation`,
não mostra barra de rolagem com `hiddenScrollbarStyles`: ela continua rolando por toque, trackpad, roda do mouse e foco
do teclado, e os modos de alto contraste devolvem a barra de rolagem do sistema.

```tsx
import { hiddenScrollbarStyles } from '@midnight-indigo/ui/theme';

const FilterRow = styled('div')({ ...hiddenScrollbarStyles, display: 'flex', overflowX: 'auto' });
```

## Autofill em campos próprios

Os navegadores pintam um campo preenchido automaticamente com declarações `!important` que nenhum estilo consegue
sobrescrever. A baseline cobre o fundo com uma sombra interna e repinta o texto com `-webkit-text-fill-color`: um campo
nativo, que não tem fundo próprio depois do reset, recebe o campo do tema (`surface.field`, `text.primary`). Um campo
com fundo próprio passa as suas cores para `autofillStyles`, em duas regras (um navegador que não conhece um dos
seletores descarta a regra inteira); os campos da biblioteca já fazem isso:

```tsx
import { autofillStyles, themeVariables } from '@midnight-indigo/ui/theme';

const fieldAutofill = autofillStyles(themeVariables.surface.raised, themeVariables.text.primary);

const SearchInput = styled('input')({
	backgroundColor: themeVariables.surface.raised,
	'&:-webkit-autofill': fieldAutofill,
	'&:autofill': fieldAutofill,
});
```

## Desligando

Com `baseline={false}`, o `UiProvider` não aplica nenhum estilo global: nem os estilos de documento do Material UI
(fundo do `body`, box sizing) nem os estilos nativos acima, então os controles nativos mantêm a aparência do navegador.
Ele continua declarando as custom properties dos tokens em `:root`, com `color-scheme: dark` (veja
[theme.md](../en-us/theme.md#css)), e os componentes mantêm os próprios estilos.

## Testes

`fixtures/browser/test/native` roda em Chromium, Firefox e WebKit: screenshots da página, de um contêiner rolável, dos
controles nativos e dos estados deles, dos elementos estruturais, de um diálogo modal e da seleção com o anel de foco;
o estilo computado de cada controle nativo (os resetados com `appearance: none`, sem fundo, sem borda e com a fonte da
página; checkboxes, radios, ranges e seletores de cor desenhados pelo tema), das barras de progresso e dos medidores,
dos indicadores de data e dos botões de incremento (Chromium e WebKit), de tabelas, listas, `pre`, `summary` e
`fieldset`, e do fundo atrás de um diálogo; um autofill real no Chromium (pelo protocolo do DevTools), em que um campo
da biblioteca precisa ficar igual antes e depois e um campo nativo recebe o campo do tema; axe com contraste; o modo
de alto contraste emulado, com os controles do sistema e o marcador de `summary` de volta; e a página com a baseline
desligada. O Firefox headless
esconde as barras de rolagem e o WebKit as sobrepõe, então nessas engines são verificados o `scrollbar-color`
computado (Firefox) e os pseudo-elementos interpretados (WebKit).
