# Essential components

Buttons, surfaces and indicators of everyday use (F05). Every component is styled only with the theme variables
(`var(--mi-*)`), so it follows any palette given to `UiProvider`. The tokens are listed in [tokens.md](./tokens.md);
typography, icons and motion are explained in [foundations.md](./foundations.md).

## Imports

| Subpath                            | Components                                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@midnight-indigo/ui/buttons`      | `Button`, `IconButton`                                                                                                                                                    |
| `@midnight-indigo/ui/data-display` | `Card`, `CardHeader`, `CardContent`, `Chip`, `Badge`, `Avatar`, `Divider`, `Skeleton`, `Carousel`; tables, lists, KPIs and states in [data-display.md](./data-display.md) |
| `@midnight-indigo/ui/feedback`     | `ProgressBar` (linear and circular); alerts, toasts and overlays in [feedback.md](./feedback.md)                                                                          |
| `@midnight-indigo/ui/layout`       | `Container`, `Stack`, `Grid`, `GridItem`, `useBreakpoint`; see [navigation.md](./navigation.md)                                                                           |
| `@midnight-indigo/ui/navigation`   | Links, tabs, breadcrumbs, pagination and the sidebar in [navigation.md](./navigation.md)                                                                                  |
| `@midnight-indigo/ui`              | All of the above, plus `Icon` and the theme API                                                                                                                           |

```tsx
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
```

None of these entries reaches `charts` or `dashboard`, nor any dependency other than React and Material UI subpaths;
the consumer fixture follows the compiled import graph of each entry to prove it. Each component is its own module
(`dist/<domain>/<component>/index.js`), so a bundler keeps only what the application imports.

The components are Client Components (`'use client'`) because Emotion styles them. A Server Component renders them
with serializable props; event handlers and state go in a Client Component of the application (see the starter's
`filter-chips.tsx`). With `AppRouterCacheProvider` around `UiProvider` (see [theme.md](./theme.md)), their styles are
collected during server rendering and arrive in the `<head>` of the first flush: controls paint styled, without a
flash.

## Intent and variant

Two props describe the look of every component that carries color, instead of one prop per combination:

- `intent` — the meaning: `official`, `default`, `success`, `warning`, `error` or `info`.
- `variant` — the emphasis, independent from the meaning.

| Variant   | Rest                                  | Hover / pressed                                                 | Used by                         |
| --------- | ------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| `solid`   | `main` fill, `contrastText` label     | `hover` / `pressed` fill                                        | Button, IconButton, Chip, Badge |
| `soft`    | `container` fill, `onContainer` label | `containerHover` / `containerPressed`                           | Button, IconButton, Chip, Badge |
| `outline` | `border` line, `text` label           | `containerHover` / `containerPressed` fill, `onContainer` label | Button, IconButton, Chip        |
| `ghost`   | `text` label only                     | same as `outline`                                               | Button, IconButton              |

A single resolver produces these styles for every component, and every foreground/background pair of the table is
part of the contrast audit (`auditContrast`, table in [tokens.md](./tokens.md#contrast-pairs)). `intent='official'` with
`variant='outline'` still means the brand: it is just not filled.

Defaults favor restraint: `Button` and `Chip` are `default` + `soft`, `IconButton` is `default` + `ghost`. Mark the
main action of a view with `intent='official' variant='solid'`, and destructive actions with `intent='error'`.

## Shape and scale

Components share the radius and spacing scales of the tokens; the radius depends on the kind of element, not on the
component.

| Component          | Radius                      | Heights / sides                        | Inner spacing                |
| ------------------ | --------------------------- | -------------------------------------- | ---------------------------- |
| Button, IconButton | `radius.medium`             | 32 / 40 / 48 px (`small` … `large`)    | `spacing.3` – `spacing.5`    |
| Chip               | `radius.pill`               | 24 / 32 px                             | `spacing.2` – `spacing.3`    |
| Badge              | `radius.pill`               | 20 px (8 px dot)                       | `spacing.1`                  |
| Avatar             | `radius.pill`               | 32 / 40 / 48 px                        | —                            |
| Card               | `radius.large`              | —                                      | `spacing.5`, gap `spacing.4` |
| ProgressBar        | `radius.pill`               | 4 / 6 / 8 px bar, 16 / 24 / 40 px ring | —                            |
| Skeleton           | `small` / `medium` / `pill` | one line (`1lh`), `6rem`, `2.5rem`     | —                            |

Every interactive target is at least 24 × 24 px (WCAG 2.2, 2.5.8). Sizes are in `rem`, so they follow zoom.

## States

States exist only where they mean something for the element.

| State    | Where                     | How it is exposed                                                                                                  |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| hover    | interactive components    | Intent `hover`/`container*` tokens; never on disabled elements.                                                    |
| pressed  | interactive components    | Intent `pressed`/`containerPressed` tokens (`:active`).                                                            |
| focus    | every focusable element   | `focus.ring` outline at `focus.offset`, only for keyboard focus (`:focus-visible`).                                |
| disabled | Button, IconButton, Chip  | Native `disabled`: skipped by Tab, `state.disabled*` tokens whatever the intent.                                   |
| loading  | Button, IconButton        | `aria-busy` + `aria-disabled`, ring in place of the icon; keeps its look and focus, ignores clicks and submission. |
| selected | Chip (with `onClick`)     | `aria-pressed`, `solid` look **and** a check mark (never color alone).                                             |
| current  | Carousel position buttons | `aria-current`, a wider and filled mark.                                                                           |
| invalid  | form controls             | `aria-invalid`, error message with an icon, thicker error boundary; see [forms.md](./forms.md).                    |

Loading is not disabled: a disabled button means the action is unavailable, a loading one that it is running.
Announce the outcome with a status message or a toast ([feedback.md](./feedback.md#toasts)).

## Slots and icons

Components accept content in named slots instead of exposing their internal elements:

| Component  | Slots                                   |
| ---------- | --------------------------------------- |
| Button     | `startIcon`, `endIcon`                  |
| IconButton | `children` (the icon)                   |
| CardHeader | `title`, `subtitle`, `avatar`, `action` |
| Chip       | `icon`                                  |
| Badge      | `children` (the anchor)                 |

Every component also accepts `className`, `style`, `ref` and the attributes of its root element.

**Icon strategy.** The library depends on no icon set (decision D07 remains open). Any SVG fits a slot: the `Icon`
primitive with your paths, or a component of any set with `iconAccessibilityProps`. Slot icons are decorative,
because the control is named by its label (`Button`) or by its required `label` (`IconButton`); Button slots are
wrapped in `aria-hidden` for that reason. The few glyphs the components draw themselves (check, close, chevrons) are
simple strokes made for the library, so no third-party license is involved.

```tsx
import { Icon } from '@midnight-indigo/ui';
import { Button, IconButton } from '@midnight-indigo/ui/buttons';

const plus = (
	<Icon decorative>
		<path d='M11 5h2v14h-2zM5 11h14v2H5z' />
	</Icon>
);

<Button intent='official' variant='solid' startIcon={plus}>
	New report
</Button>;

<IconButton label='Add item'>{plus}</IconButton>;
```

## Components

### Button and IconButton

Native `<button>`, `type="button"` by default (pass `type="submit"` in forms). `IconButton` requires `label`, its
accessible name, and throws on a blank one. Both stay focusable while `loading`, and also when marked
`aria-disabled`, which the Carousel uses so that focus is not lost at the first and last slides.

### Card, CardHeader, CardContent

A raised surface (`surface.raised`, `border.default`), `outline` or `elevated` (adds `elevation.medium`). The title
is a heading of level 3 by default (`headingLevel` 2–6): choose it from the outline of the page. With
`as='section'` or `as='article'` the card becomes a region named by its header title; without a header, give it an
`aria-label`.

```tsx
<Card as='section'>
	<CardHeader
		title='Revenue'
		subtitle='Last 30 days'
		action={<IconButton label='Export revenue'>{downloadIcon}</IconButton>}
	/>
	<CardContent>R$ 12.400</CardContent>
</Card>
```

### Chip

Static by default. With `onClick` it is a button; with `onClick` and `selected` a toggle. With `onDelete` it gets a
separate delete button that requires `deleteLabel` (`'Remove Status: open'`); Backspace and Delete on the chip also
remove it. The types reject `selected` without `onClick` and `onDelete` without `deleteLabel`.

### Badge

Attaches a count, a short text or a dot to the corner of its child. Numbers above `max` (99) show as `99+`, and 0 is
hidden unless `showZero`. The visual count is hidden from assistive technologies, so the badge requires either a
`label` (rendered as hidden text: `'3 unread messages'`) or `decorative` when the anchor already says it (an
`IconButton` labelled `'Notifications, 3 unread'`). A dot is always `solid`, the only look visible without text.

### Avatar

Image with the `name` as alternative text, falling back to initials (first letters of the first and last words) when
there is no `src` or it fails to load, also before hydration. Mark it `decorative` next to the visible name.

### Divider

`<hr>`, or `role="separator"` with `aria-orientation="vertical"`. `decorative` removes it from the accessibility
tree. The line uses `border.default`, which is decorative (below 3:1): never rely on it alone to group content.

### Skeleton

Placeholder of `text`, `rectangle` or `circle` shape, always hidden from assistive technologies. Mark the region that
is loading with `aria-busy="true"` and a name. The pulse stops under reduced motion.

### ProgressBar

`role="progressbar"` with a required `label`. With `value` (between `min` and `max`, clamped) it is determinate;
`valueText` replaces the percentage for assistive technologies (`'Step 2 of 5'`). Without `value` it is
indeterminate and the value attributes are left out. `shape='circular'` draws a ring. Under reduced motion the
indeterminate bar and ring pulse in place, full, instead of moving: a still segment would read as a value.

### Carousel

Follows the carousel pattern of the WAI-ARIA Authoring Practices, without autoplay:

- a region with `aria-roledescription="carousel"` and the required `label`;
- one `group` per slide (`aria-roledescription="slide"`, named `'2 of 5'`); hidden slides are `inert`, so their
  links and buttons leave the tab order, and the visible one is announced politely when it changes;
- previous and next buttons, plus a group of position buttons with a single tab stop: arrow keys (in the reading
  direction), Home and End move between slides while focus is anywhere in the carousel, except in fields, which keep their keys;
- `loop` goes around the ends; `index` + `onIndexChange` make it controlled;
- the slide transition uses `motion.duration.slow` and stops under reduced motion.

Every announced text comes from `labels` (defaults in `defaultCarouselLabels`), so the carousel is translated with
the rest of the interface:

```tsx
<Carousel
	label='Destaques'
	labels={{
		carousel: 'carrossel',
		previous: 'Slide anterior',
		next: 'Próximo slide',
		slidePicker: 'Escolher um slide',
		slidePosition: (position, total) => `${position} de ${total}`,
	}}
>
	{slides}
</Carousel>
```

## Composition example

`templates/nextjs-starter/src/app/components-showcase.tsx` composes every component in a card: a header with avatar
and a badged icon button, a row of buttons in each state, selectable and removable filter chips, progress bars, a
loading skeleton and a carousel. The starter test checks that it is rendered on the server with its roles and names
and that the component styles are in the head of the first flush.

## Tests

- Behavior and accessibility: Testing Library and user-event for pointer and keyboard, axe-core on the rendered
  markup (contrast is covered by the token audit, since jsdom does not paint).
- Visual states: each component test snapshots the CSS rules generated for its states (rest, hover, pressed,
  focus-visible, busy, disabled) per intent and variant. A change in the look of a state changes the snapshot and must
  be reviewed. Browser screenshots arrive with the end-to-end tests (F17).
