# Estilos nativos do navegador

[English](../en-us/native-styles.md)

Os componentes seguem o tema, mas o navegador também desenha coisas por conta própria: as barras de rolagem, a seleção
de texto, o fundo dos campos preenchidos automaticamente, os controles nativos (campos de data e hora, `select`,
caixas de seleção) e o anel de foco padrão. Sem tratamento, eles aparecem no esquema claro do navegador e quebram a
aparência escura de qualquer página. Com `baseline` (o padrão), o `UiProvider` os estiliza com os tokens do tema.

```tsx
import { UiProvider } from '@midnight-indigo/ui/theme';

<UiProvider>{children}</UiProvider>; // baseline ligada
<UiProvider baseline={false}>{children}</UiProvider>; // nenhum estilo global
```

## O que a baseline estiliza

| Elemento nativo                                        | Estilo                                                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Documento                                              | `color-scheme: dark`, para que controles nativos, seletores de data e popups de formulário fiquem escuros. |
| Barra de rolagem da página                             | Fina, polegar `border.control` sobre trilho `surface.canvas`.                                              |
| Seleção de texto (`::selection`)                       | Fundo `accent.selection`, texto `accent.onSelection` (um par auditado).                                    |
| Cursor de texto, checkboxes, radios, range             | `caret-color: focus.ring`, `accent-color: intent.brand.main`.                                              |
| Campos com autofill (`:autofill`, `:-webkit-autofill`) | Mantêm as cores de sistema de um campo (`Field`, `FieldText`) em vez do preenchimento azul ou amarelo.     |
| Foco de elementos nativos (`:focus-visible`)           | O anel de foco dos componentes: `focus.width` sólido `focus.ring`, deslocamento `focus.offset`.            |
| `::placeholder`                                        | `text.muted`, totalmente opaco.                                                                            |
| `a`, `a:hover`                                         | `accent.link`, `accent.linkHover`.                                                                         |
| `hr`, `kbd`, `mark`, `abbr[title]`, `blockquote`       | Bordas e superfícies do tema; `mark` usa o par suave de alerta; `abbr` é sublinhado pontilhado.            |
| `code`, `kbd`, `pre`, `samp`                           | Geist Mono (`fontFamily.mono`) com algarismos tabulares.                                                   |
| `h1`–`h6`, `p`                                         | `text-wrap: pretty`, para que a última linha não fique com uma única palavra curta.                        |
| Rolagem                                                | `scroll-behavior: smooth` apenas para quem não pediu movimento reduzido.                                   |
| Páginas com a barra superior do `DashboardLayout`      | `scroll-padding-top` igual à altura dela, para que âncoras e elementos focados parem abaixo dela.          |
| Navegadores móveis                                     | Sem destaque de toque; `text-size-adjust: 100%` (sem aumento automático do texto).                         |

Toda regra de elemento fica dentro de `:where()`, cuja especificidade é zero: qualquer classe de um componente ou da
aplicação vence. A baseline nunca redefine margens, alturas de linha ou tamanhos de fonte do conteúdo. Títulos,
parágrafos e listas mantêm os padrões do navegador, exceto pelo `text-wrap: pretty`.

### Modos de alto contraste

Nos temas de contraste do Windows (`forced-colors: active`), as cores de sistema substituem o tema: as barras de
rolagem voltam a ser as do sistema, e a seleção, o anel de foco e `mark` usam `Highlight`, `HighlightText`, `Mark` e
`MarkText`. Nada na biblioteca define `forced-color-adjust`, então o navegador mantém o controle de todas as cores.

## Contêineres roláveis

Um contêiner que rola dentro da página (um menu, uma tabela, um drawer, uma lista) recebe as mesmas barras de rolagem
com `scrollbarStyles`. Os componentes da biblioteca que rolam já o usam: `Table`, `Tabs`, `TabNavigation`, `Sidebar`,
`Combobox`, `Dialog`, `Drawer`, `Menu`, `ContextMenu` e `Popover`.

```tsx
import { scrollbarStyles } from '@midnight-indigo/ui/theme';
import { styled } from '@mui/material/styles';

const Results = styled('div')({ ...scrollbarStyles, maxHeight: '20rem', overflowY: 'auto' });
```

O trilho é transparente, então funciona sobre qualquer superfície. Chromium e Firefox leem `scrollbar-color`; o WebKit
desenha os pseudo-elementos `::-webkit-scrollbar`, que o Chromium ignora quando `scrollbar-color` está definido.

## Autofill em campos próprios

Os navegadores pintam um campo preenchido automaticamente com declarações `!important` que nenhum estilo consegue
sobrescrever. A baseline cobre o fundo com uma sombra interna e repinta o texto com `-webkit-text-fill-color`, usando
as cores de sistema de um campo nativo. Enquanto um campo nativo está preenchido automaticamente, a borda dele volta à
aparência clássica do navegador. Um campo com fundo próprio passa as suas cores para `autofillStyles`, em duas regras
(um navegador que não conhece um dos seletores descarta a regra inteira); os campos da biblioteca já fazem isso:

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
(fundo do `body`, box sizing) nem os estilos nativos acima. Ele continua declarando as custom properties dos tokens em
`:root`, com `color-scheme: dark` (veja [theme.md](../en-us/theme.md#css)), e os componentes mantêm os próprios estilos.

## Testes

`fixtures/browser/test/native` roda em Chromium, Firefox e WebKit: screenshots da página, de um contêiner rolável, dos
controles nativos e da seleção com o anel de foco; um autofill real no Chromium (pelo protocolo do DevTools) cujos
campos precisam ficar iguais antes e depois; axe com contraste; o modo de alto contraste emulado; e a página com a
baseline desligada. O Firefox headless esconde as barras de rolagem e o WebKit as sobrepõe, então nessas engines são
verificados o `scrollbar-color` computado (Firefox) e os pseudo-elementos interpretados (WebKit).
