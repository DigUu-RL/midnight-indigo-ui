# Native browser styles

[Português](../pt-br/native-styles.md)

Components follow the theme, but the browser also draws things by itself: the scrollbars, the text selection, the
background of autofilled fields, native controls (buttons, fields, `select`, checkboxes, radios, ranges, date and time
inputs, progress bars and meters), structural elements without a component of their own (tables, lists, `details`,
`fieldset`, `dialog`) and the default focus ring. Left alone, they appear in the look of the browser and break the dark
look of any page. With `baseline` (the default), `UiProvider` resets them and styles them with the theme tokens: no
element shows a default style of the browser, in Chromium, Firefox and WebKit.

```tsx
import { UiProvider } from '@midnight-indigo/ui/theme';

<UiProvider>{children}</UiProvider>; // baseline on
<UiProvider baseline={false}>{children}</UiProvider>; // no global style at all
```

## Priority

The tokens of the theme come before any default of the browser: where the theme has a value, the browser default is
reset and replaced by it. To change how a native element looks, change the theme (the palette given to `createUiTheme`
or `UiProvider`); the baseline reads every color as a `var(--mi-*)` reference, so it follows that palette by itself.
The glyphs it draws as images (the chevron of a `select`, the check of a checkbox, the icon of date and time fields, the
chevron of `summary`) and the backdrop of a dialog cannot read a custom property: `UiProvider` resolves them from its
own `theme`. Every element rule is wrapped in `:where()`, whose specificity is zero, so a class of a component or of the
application still wins over it, but the baseline is not meant to be overridden element by element.

To apply the baseline without `UiProvider`, pass `createNativeBaselineStyles(theme)` to the `GlobalStyles` of Material
UI (`nativeBaselineStyles` is the same for the official theme).

## What the baseline styles

| Native element                                       | Style                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Document                                             | `color-scheme: dark`, so date pickers and form popups render dark.                                                |
| `button`, `input`, `select`, `textarea`              | Reset: `appearance: none`, `font: inherit`, `color: inherit`, no background, no border.                           |
| `select` (single)                                    | The `chevronDown` glyph in `text.muted` at the end of the line (`text.disabled` when disabled).                   |
| `option`, `optgroup`                                 | `surface.overlay` background, `text.primary` text.                                                                |
| `input` `checkbox`, `radio`                          | `border.control` box on `surface.field`; checked, `intent.brand.main` with a `check` (or `minus`) glyph or a dot. |
| `input` `range`                                      | `border.default` bar, `intent.brand.main` thumb (and fill in Firefox).                                            |
| `input` `color`                                      | `controlHeight.small` square with a `border.control` border and a rounded swatch.                                 |
| Date and time fields                                 | The `calendar` (or `clock`) glyph on the indicator of the browser, which still opens the picker on click.         |
| `input` `number`                                     | No spin buttons.                                                                                                  |
| `::file-selector-button`                             | A secondary button: `surface.raised`, `border.control` border, `text.primary`.                                    |
| `progress`, `meter`                                  | `border.subtle` bar; value in `intent.brand.main` (meters: success, warning, error by region).                    |
| `progress` without a value                           | A segment of the bar runs across it; it stands still with a reduced motion preference.                            |
| `fieldset`, `legend`                                 | `border.subtle` border with the radius of a card; semibold legend in `text.primary`.                              |
| `details`, `summary`                                 | The `chevronRight` glyph in place of the marker, turned down when open (mirrored right to left).                  |
| `dialog`, `::backdrop`                               | `surface.dialog`, `border.subtle`, `radius.dialog`, `elevation.dialog`; backdrop `backdrop.scrim`, blurred.       |
| `table`, `th`, `td`                                  | Collapsed borders, `surface.tableHeader` header in caps 11/600 `text.muted`, rows split by `border.subtle`.       |
| `ul`, `ol`, `::marker`, `dl`                         | Indent `spacing.6`; markers in `text.muted` (tabular digits); `dt` semibold, `dd` in `text.secondary`.            |
| `pre`                                                | `surface.field` block with a `border.subtle` border, scrollbars of the theme.                                     |
| Page scrollbar                                       | Thin, thumb `border.default` on a `surface.canvas` track; hovered, `border.control`.                              |
| Text selection (`::selection`)                       | `accent.selection` (brand) background, `accent.onSelection` text (an audited pair).                               |
| Caret                                                | `caret-color: focus.ring` (the official pink).                                                                    |
| Autofilled fields (`:autofill`, `:-webkit-autofill`) | `surface.field` background and `text.primary` text instead of the blue or yellow fill.                            |
| Focus of native elements (`:focus-visible`)          | The pink focus ring of the components: `focus.width` solid `focus.ring`, offset `focus.offset`.                   |
| `::placeholder`                                      | `text.placeholder`, fully opaque.                                                                                 |
| `a`, `a:hover`                                       | `accent.link`, `accent.linkHover`.                                                                                |
| `hr`, `kbd`, `mark`, `abbr[title]`, `blockquote`     | Theme borders and surfaces; `mark` uses the soft warning pair; `abbr` is underlined dotted.                       |
| `code`, `kbd`, `pre`, `samp`                         | Geist Mono (`fontFamily.mono`) with tabular digits; inline `code` on `surface.overlay`.                           |
| `h1`–`h6`, `p`                                       | `text-wrap: pretty`, so the last line does not end on a single short word.                                        |
| Scrolling                                            | `scroll-behavior: smooth` only for users without a reduced motion preference.                                     |
| Pages with the `DashboardLayout` top bar             | `scroll-padding-top` equal to its height, so anchors and focused elements land below it.                          |
| Mobile browsers                                      | No tap highlight; `text-size-adjust: 100%` (no automatic text inflation).                                         |

The baseline never resets margins or line heights of the content. Headings and paragraphs keep the browser defaults,
apart from `text-wrap: pretty`. A reset native control takes the font and the color of its parent and draws no boundary
of its own, unless the theme draws one (checkboxes, radios, color pickers, the file button). Firefox draws neither the
indicator of date fields nor spin buttons as pseudo-elements: its date button keeps the text color of the field, and
`appearance: none` removes its spin buttons.

The placeholder (`text.placeholder`, 3.8:1 on `surface.field`) and the page scrollbar thumb (`border.default`, 1.5:1 on
`surface.canvas`) are below the WCAG minimum on purpose: they are accepted exceptions of the contrast audit (see
[palette.md](./palette.md)), since the placeholder is only an example of the value and scrolling never depends on the
thumb.

### High contrast modes

In the Windows contrast themes (`forced-colors: active`), the system colors replace the theme: scrollbars return to the
system ones, the selection, the focus ring and `mark` use `Highlight`, `HighlightText`, `Mark` and `MarkText`, and the
native controls get their system appearance, background and border back (`revert`), so their boundaries stay visible.
The parts drawn inside them (range tracks and thumbs, color swatches, date indicators, file buttons, progress bars and
meters) return to the browser as a whole (`all: revert`), and `summary` shows the marker of the system instead of the
chevron, an image in a fixed color.
Nothing in the library sets `forced-color-adjust`, so the browser keeps control of every color.

## Scrolling containers

A container that scrolls inside the page (a menu, a table, a drawer, a list) gets the same scrollbars with
`scrollbarStyles`. The library components that scroll already use it: `Table`, `Sidebar`, `Combobox`, `Dialog`,
`Drawer`, `Menu`, `ContextMenu` and `Popover`.

```tsx
import { scrollbarStyles } from '@midnight-indigo/ui/theme';
import { styled } from '@mui/material/styles';

const Results = styled('div')({ ...scrollbarStyles, maxHeight: '20rem', overflowY: 'auto' });
```

The track is transparent, so it works on any surface. Chromium and Firefox read `scrollbar-color`; WebKit draws the
`::-webkit-scrollbar` pseudo-elements, which Chromium ignores once `scrollbar-color` is set.

A row that scrolls sideways and shows by itself that it continues, such as the rows of `Tabs` and `TabNavigation`,
shows no scrollbar with `hiddenScrollbarStyles`: it still scrolls by touch, trackpad, wheel and keyboard focus, and the
high contrast modes give the system scrollbar back.

```tsx
import { hiddenScrollbarStyles } from '@midnight-indigo/ui/theme';

const FilterRow = styled('div')({ ...hiddenScrollbarStyles, display: 'flex', overflowX: 'auto' });
```

## Autofill in custom fields

Browsers paint an autofilled field with `!important` declarations that no style can override. The baseline covers the
background with an inset shadow and repaints the text with `-webkit-text-fill-color`: a native field, which has no
background of its own after the reset, gets the field of the theme (`surface.field`, `text.primary`). A field with its
own background passes its colors to `autofillStyles`, in two rules (a browser that does not know one of the selectors
drops the whole rule); the fields of the library already do it:

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
background, box sizing) nor the native styles above, so native controls keep the look of the browser. It still declares
the token custom properties on `:root`, with `color-scheme: dark` (see [theme.md](./theme.md#css)), and the components
keep their own styles.

## Tests

`fixtures/browser/test/native` runs in Chromium, Firefox and WebKit: screenshots of the page, of a scrolling container,
of native controls and their states, of the structural elements, of a modal dialog and of the selection and the focus
ring; the computed style of every native control (reset ones with `appearance: none`, no background, no border and the
font of the page; checkboxes, radios, ranges and color pickers drawn by the theme), of progress bars and meters, of the
date indicators and spin buttons (Chromium and WebKit), of tables, lists, `pre`, `summary` and `fieldset`, and of the
backdrop of a dialog; a real autofill in Chromium (through the DevTools protocol), where a field of the library must
look the same before and after and a native field gets the field of the theme; axe with contrast; the high contrast
mode emulated, with the system controls and the marker of `summary` back; and the page with the baseline turned off. Headless Firefox hides
scrollbars and WebKit overlays them, so in those engines the computed `scrollbar-color` (Firefox) and the parsed
pseudo-elements (WebKit) are checked instead.
