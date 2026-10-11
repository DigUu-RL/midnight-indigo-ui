# Feedback and overlays

Messages, notifications and transient layers (F07), all exported by `@midnight-indigo/ui/feedback` (and by the root
entry). They follow the conventions of [components.md](./components.md): `intent` for meaning, theme variables only,
`labels` for every text the component writes itself, so the whole interface is translated in one place.

| Component                    | Use it for                                                        | Built on                    |
| ---------------------------- | ----------------------------------------------------------------- | --------------------------- |
| `Alert`                      | A message that belongs to the page or to a section of it          | native markup               |
| `ToastProvider` + `useToast` | A short notification about the outcome of an action               | native markup, live regions |
| `Dialog`                     | A task or a decision that interrupts the page                     | Material UI `Modal`         |
| `ConfirmDialog`              | Confirming an action and its consequence before it happens        | `Dialog`                    |
| `Drawer`                     | Details, filters or a secondary task beside the page              | Material UI `Modal`         |
| `Popover`                    | Interactive content anchored to a button (filters, a short form)  | Material UI `Popover`       |
| `Menu`, `ContextMenu`        | A list of actions, from a button or from a right click            | Material UI `Menu`          |
| `Tooltip`                    | Supplementary text about a control: a shortcut, a truncated label | Material UI `Tooltip`       |
| `Portal`                     | Your own layers, outside the clipping of their ancestors          | Material UI `Portal`        |

Material UI provides the behavior that is hard to get right (focus trap and restoration, scroll lock, hiding the page
from assistive technologies, stacking of nested overlays, positioning, menu keyboard navigation); the markup, the look
and the API are this library's. No Material UI prop or class is part of the public API.

## Intents and variants

`Alert` and the toasts take the six semantic intents. The meaning never rests on color alone: each intent has its own
glyph (circled exclamation for `error`, triangle for `warning`, circled check for `success`, star for `official`,
circled `i` for `info` and `default`), and the alert variants are distinct in shape as well as in color:

| Variant   | Surface     | Text and icon                  | Boundary        |
| --------- | ----------- | ------------------------------ | --------------- |
| `soft`    | `container` | `onContainer`                  | none            |
| `outline` | transparent | `text.primary`, icon in `text` | intent `border` |
| `solid`   | `main`      | `contrastText`                 | `main`          |

Every pair is part of the contrast audit. Toasts are `outline` alerts on `surface.overlay`.

## Layers and portal

Overlays render through a portal at the end of `document.body` (or the `container` you pass), so a parent with
`overflow: hidden` never clips them. Their stacking comes from the `layer` tokens, which are also given to Material UI
for its own components:

| Token           | Value  | Used by                                                 |
| --------------- | ------ | ------------------------------------------------------- |
| `layer.base`    | `0`    | page content                                            |
| `layer.sticky`  | `1100` | sticky headers (Material UI `appBar`)                   |
| `layer.drawer`  | `1200` | `Drawer`                                                |
| `layer.dialog`  | `1300` | `Dialog`, `ConfirmDialog` (Material UI `modal`)         |
| `layer.popover` | `1400` | `Popover`, `Menu`, `ContextMenu` — also inside a dialog |
| `layer.toast`   | `1500` | toasts (Material UI `snackbar`)                         |
| `layer.tooltip` | `1600` | `Tooltip`                                               |

The scrim behind dialogs and drawers is `backdrop.scrim`. For a layer of your own, combine `Portal` with a token:

```tsx
import { Portal } from '@midnight-indigo/ui/feedback';
import { themeVariables } from '@midnight-indigo/ui/theme';

<Portal>
	<div style={{ position: 'fixed', insetBlockEnd: 0, zIndex: themeVariables.layer.sticky }}>…</div>
</Portal>;
```

Portaled content is mounted after hydration: an overlay renders nothing on the server, even when `open`.

## Focus

Every overlay moves focus to a predictable target when it opens and returns it to a predictable target when it closes.

| Overlay            | On open                                                               | On close                                    |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------- |
| `Dialog`, `Drawer` | the panel (its name and description are read), or `initialFocus`      | the element focused before, or `finalFocus` |
| `ConfirmDialog`    | the cancel button when `intent='error'`, the confirm button otherwise | the element focused before, or `finalFocus` |
| `Popover`          | the popover, or `initialFocus`                                        | the trigger                                 |
| `Menu`             | the first item (Enter, Space, Down, click) or the last one (Up)       | the trigger                                 |
| `ContextMenu`      | the first item                                                        | the element focused before                  |
| `Tooltip`          | never takes focus                                                     | —                                           |
| toasts             | never take focus; the hotkey (F8) moves it to them                    | Escape returns it to where it was           |

Inside `Dialog`, `Drawer` and `Popover`, Tab and Shift+Tab cycle without leaving. Use `finalFocus` when the element
that opened the dialog disappears, e.g. a deleted table row: point it to the table heading or the next row.

A menu item runs its `onSelect` after the menu has closed and focus is back on the trigger, so it can open a dialog:
when that dialog closes, focus returns to the trigger of the menu.

## Closing

Closing is always the parent's decision: modal overlays are controlled (`open` + `onClose(reason)`), and
`reason` is `'escape'`, `'outside'` or `'close-button'`.

| Overlay               | Escape                                 | Click outside                                                                             |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `Dialog`              | yes (`closeOnEscape`)                  | **off** by default (`closeOnOutsideClick`): a dialog often holds input that would be lost |
| `Drawer`              | yes                                    | **off** by default, for the same reason                                                   |
| `ConfirmDialog`       | cancels; ignored while the action runs | never                                                                                     |
| `Popover`             | yes                                    | on by default; turn it off when it holds input                                            |
| `Menu`, `ContextMenu` | yes, and Tab                           | yes, without selecting                                                                    |
| `Tooltip`             | yes                                    | closes on pointer leave and blur                                                          |

A click counts as outside only when it both starts and ends on the scrim, so selecting text in a dialog and releasing
the button outside does not close it. Nested overlays close one at a time: Escape in a menu opened inside a drawer
closes the menu only.

## Dialog, ConfirmDialog and Drawer

```tsx
const [open, setOpen] = useState(false);

<Dialog
	open={open}
	onClose={() => setOpen(false)}
	title='Rename report'
	description='The new name is visible to everyone in the workspace.'
	actions={
		<>
			<Button variant='outline' onClick={() => setOpen(false)}>
				Cancel
			</Button>
			<Button intent='official' variant='solid' type='submit' form='rename'>
				Rename
			</Button>
		</>
	}
>
	<Form id='rename' onSubmit={rename}>
		…
	</Form>
</Dialog>;
```

- `role="dialog"` (or `role="alertdialog"`) with `aria-modal`, named by `title` (a level 2 heading) and described by
  `description`. The rest of the page is hidden from assistive technologies and does not scroll.
- Sizes: `small` 24 rem, `medium` 32 rem, `large` 48 rem; the panel scrolls as a whole when taller than the viewport.
- `ConfirmDialog` requires the consequence in `description` and names its buttons through `labels`
  (`'Delete report'`, `'Keep report'`). When `onConfirm` returns a promise, the confirm button is busy and the dialog
  cannot be dismissed until it settles; a rejection keeps it open, so the parent can show the error.
- `Drawer` slides from `start`, `end` (default), `top` or `bottom`; `start` and `end` follow the reading direction, and
  the slide mirrors in right-to-left documents.

## Popover, Menu, ContextMenu and Tooltip

The trigger is a regular element passed in `trigger` (or `children` for `ContextMenu` and `Tooltip`). It keeps its own
handlers, `id` and `ref`, and receives the ARIA attributes of the pattern.

```tsx
<Menu
	trigger={<IconButton label='Row actions'>{moreIcon}</IconButton>}
	items={[
		{ id: 'edit', label: 'Edit', onSelect: edit },
		{ id: 'copy', label: 'Duplicate', shortcut: 'Control+D' },
		{ id: 'sep', separator: true },
		{ id: 'delete', label: 'Delete', destructive: true, onSelect: confirmDeletion },
	]}
/>
```

- `Popover` is a `dialog` named by `title` (visible) or `label`; its trigger gets `aria-haspopup="dialog"`,
  `aria-expanded` and `aria-controls`. It is modal while open, as in Material UI.
- `Menu` follows the menu button pattern: the trigger names the menu (`aria-labelledby`); arrow keys wrap, Home and End
  jump, typing a letter jumps to the matching item, disabled items stay visible but are skipped. Destructive items use
  the error colors, besides a label that says what they do. Shortcuts are shown and exposed as `aria-keyshortcuts`.
- `ContextMenu` opens at the pointer on a right click and under the element on Shift+F10 or the context menu key. Its
  child should be focusable. Context menus are hard to discover: offer the same actions somewhere visible.
- `Tooltip` takes plain text only (`content: string`), so it never holds a link or a button that could not be reached.
  It **describes** its trigger (`aria-describedby`) and never names it: the trigger must have a name of its own (visible
  text, or the `label` of an `IconButton`), and a trigger without one is reported in the console. It opens on hover
  after `delay` (300 ms) and immediately on keyboard focus, stays open while the pointer moves onto it, and closes on
  Escape. Do not put essential information in a tooltip; a disabled control receives no events, so explain why it is
  disabled in visible text.

## Alerts

```tsx
<Alert
	intent='warning'
	title='Two invoices are overdue'
	action={<Button size='small'>Review</Button>}
>
	Pay them before Friday to keep the workspace active.
</Alert>
```

`announce` decides how assistive technologies learn about the alert:

- `'none'` (default) — part of the page from the start, read in the normal flow;
- `'polite'` — `role="status"`, for an outcome that appears after an action;
- `'assertive'` — `role="alert"`, only for a problem that needs attention now.

The alert is announced when it is inserted, once; re-rendering it does not repeat the message. `onDismiss` adds a
dismiss button named by `labels.dismiss`; removing the alert is up to the parent.

## Toasts

Wrap the application once, inside `UiProvider`, and show toasts from any Client Component:

```tsx
// layout.tsx
<UiProvider theme={theme}>
	<ToastProvider labels={{ region: 'Notificações (F8)', dismiss: 'Fechar notificação' }}>
		{children}
	</ToastProvider>
</UiProvider>;

// a Client Component
const toast = useToast();
toast.show({ intent: 'success', title: 'Saved', message: 'The report was saved.' });
toast.show({
	intent: 'error',
	message: 'Sync failed.',
	action: { label: 'Retry', onAction: retry },
});
```

**Duration and dismissal.**

| Intent                                   | Default duration         |
| ---------------------------------------- | ------------------------ |
| `official`, `default`, `success`, `info` | 6 s                      |
| `warning`                                | 10 s                     |
| `error`                                  | until dismissed (`null`) |

- Errors never disappear on their own unless you set a `duration`; even then, no toast stays less than
  `minimumToastDuration` (5 s), and a toast with an `action` stays at least 10 s, so the action can be reached.
- Timers pause while the pointer or the focus is on the toasts, and while the page is hidden.
- Every toast has a dismiss button. `dismiss(id)` and `dismissAll()` remove toasts from code.
- `limit` (3) toasts are shown at once; the next ones wait for a free place, in order.

**Announcements without repetition.** The toasts are announced through two live regions that exist before any toast
(polite, and assertive for `warning` and `error`), when a toast becomes visible — not while it waits in the queue. The
toast markup itself is not live, so re-rendering or updating it never repeats the message. Showing the same text again
restarts the visible toast instead of stacking a copy; a toast shown with the same `id` is updated in place and
announced again only if its text changed (`'Uploading…'` → `'Uploaded.'`).

**Keyboard.** The toasts form a region named by `labels.region`. The hotkey (`F8` by default) moves focus to them,
Tab moves between their buttons, and Escape returns focus to where it was. Dismissing the focused toast moves focus to
the next one, or back to where it was before. While a modal dialog is open the toasts stay audible (the library keeps
them exposed to assistive technologies), but their buttons are reachable only after the dialog closes; that is why
errors persist.

## Tests

Each component test covers its keyboard and focus contract with Testing Library and user-event, and runs axe-core on
the document while the overlay is open: naming and description of dialogs, Tab containment, Escape, outside clicks
(including a drag that ends outside), initial and final focus, nested overlays, menu navigation and deferred
selection, tooltip focus and description, toast durations with fake timers, announcements without repetition, queueing,
focus on dismissal and exposure while a dialog is open. The consumer fixture renders the compiled components on the
server, and the starter's overlay section is checked in its streamed HTML.
