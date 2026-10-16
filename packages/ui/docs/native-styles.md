# Native browser styles

[Português](./native-styles.pt-BR.md)

Components follow the theme, but the browser also draws things by itself: the scrollbars, the text selection, the
background of autofilled fields, native controls (date and time inputs, `select`, checkboxes) and the default focus
ring. Left alone, they appear in the light scheme of the browser and break the dark look of any page. With `baseline`
(the default), `UiProvider` styles them with the theme tokens.

```tsx
import { UiProvider } from '@midnight-indigo/ui/theme';

<UiProvider>{children}</UiProvider>; // baseline on
<UiProvider baseline={false}>{children}</UiProvider>; // no global style at all
```

## What the baseline styles

| Native element                                       | Style                                                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Document                                             | `color-scheme: dark`, so native controls, date pickers and form popups render dark.          |
| Page scrollbar                                       | Thin, thumb `border.strong` on a `surface.canvas` track.                                     |
| Text selection (`::selection`)                       | `accent.selection` background, `accent.onSelection` text (an audited pair).                  |
| Caret, checkboxes, radios, range                     | `caret-color: focus.ring`, `accent-color: intent.official.main`.                             |
| Autofilled fields (`:autofill`, `:-webkit-autofill`) | Keep the system colors of a field (`Field`, `FieldText`) instead of the blue or yellow fill. |
| Focus of native elements (`:focus-visible`)          | The focus ring of the components: `focus.width` solid `focus.ring`, offset `focus.offset`.   |
| `::placeholder`                                      | `text.muted`, fully opaque.                                                                  |
| `a`, `a:hover`                                       | `accent.link`, `accent.linkHover`.                                                           |
| `hr`, `kbd`, `mark`, `abbr[title]`, `blockquote`     | Theme borders and surfaces; `mark` uses the soft warning pair; `abbr` is underlined dotted.  |
| `code`, `kbd`, `pre`, `samp`                         | Monospace stack.                                                                             |
| Scrolling                                            | `scroll-behavior: smooth` only for users without a reduced motion preference.                |
| Pages with the `DashboardLayout` top bar             | `scroll-padding-top` equal to its height, so anchors and focused elements land below it.     |
| Mobile browsers                                      | No tap highlight; `text-size-adjust: 100%` (no automatic text inflation).                    |

Every element rule is wrapped in `:where()`, whose specificity is zero: any class of a component or of the application
wins over it. The baseline never resets margins, line heights or font sizes of the content. Headings, paragraphs and
lists keep the browser defaults.

### High contrast modes

In the Windows contrast themes (`forced-colors: active`), the system colors replace the theme: scrollbars return to the
system ones, and the selection, the focus ring and `mark` use `Highlight`, `HighlightText`, `Mark` and `MarkText`.
Nothing in the library sets `forced-color-adjust`, so the browser keeps control of every color.

## Scrolling containers

A container that scrolls inside the page (a menu, a table, a drawer, a list) gets the same scrollbars with
`scrollbarStyles`. The library components that scroll already use it: `Table`, `Tabs`, `TabNavigation`, `Sidebar`,
`Combobox`, `Dialog`, `Drawer`, `Menu`, `ContextMenu` and `Popover`.

```tsx
import { scrollbarStyles } from '@midnight-indigo/ui/theme';
import { styled } from '@mui/material/styles';

const Results = styled('div')({ ...scrollbarStyles, maxHeight: '20rem', overflowY: 'auto' });
```

The track is transparent, so it works on any surface. Chromium and Firefox read `scrollbar-color`; WebKit draws the
`::-webkit-scrollbar` pseudo-elements, which Chromium ignores once `scrollbar-color` is set.

## Autofill in custom fields

Browsers paint an autofilled field with `!important` declarations that no style can override. The baseline covers the
background with an inset shadow and repaints the text with `-webkit-text-fill-color`, using the system colors of a
native field. While a native field is autofilled, its border falls back to the classic look of the browser. A field with
its own background passes its colors to `autofillStyles`, in two rules (a browser that does not know one of the
selectors drops the whole rule); the fields of the library already do it:

```tsx
import { autofillStyles, themeVariables } from '@midnight-indigo/ui/theme';

const fieldAutofill = autofillStyles(themeVariables.surface.raised, themeVariables.text.primary);

const SearchInput = styled('input')({
	backgroundColor: themeVariables.surface.raised,
	'&:-webkit-autofill': fieldAutofill,
	'&:autofill': fieldAutofill,
});
```

## Turning it off

With `baseline={false}`, `UiProvider` applies no global style: neither the document styles of Material UI (`body`
background, box sizing) nor the native styles above. It still declares the token custom properties on `:root`, with
`color-scheme: dark` (see [theme.md](./theme.md#css)), and the components keep their own styles.

## Tests

`fixtures/browser/test/native` runs in Chromium, Firefox and WebKit: screenshots of the page, of a scrolling container,
of native controls and of the selection and the focus ring; a real autofill in Chromium (through the DevTools protocol)
whose fields must look the same before and after; axe with contrast; the high contrast mode emulated; and the page with
the baseline turned off. Headless Firefox hides scrollbars and WebKit overlays them, so in those engines the computed
`scrollbar-color` (Firefox) and the parsed pseudo-elements (WebKit) are checked instead.
