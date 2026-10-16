# Icons

[Português](./icons.pt-BR.md)

`@midnight-indigo/ui/icons` renders the icons of [Iconify](https://iconify.design), more than 200 open-source sets in
one format, as inline SVG. The icon data is already in your code: nothing is downloaded at runtime, not even as a
fallback, so an icon renders the same on the server and in the browser, offline and under a strict Content Security
Policy.

```tsx
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';

// tabler:rocket, Tabler Icons (MIT)
const rocketIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3-5a9 9 0 0 0 6-8a3 3 0 0 0-3-3a9 9 0 0 0-8 6a6 6 0 0 0-5 3"/>',
};

<IconifyIcon icon={rocketIcon} label='Launched' size='medium' />;
```

The root entry (`@midnight-indigo/ui`) re-exports `Icon` only; it never loads the Iconify renderer nor the collection
registry. `Icon` and `iconAccessibilityProps` are exported by both entries.

## Two ways to give an icon

| How                                                     | Where                                | Bundle cost                                      |
| ------------------------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| **Data** (`icon={rocketIcon}`)                          | Server and Client Components         | Only the icons you import (tree-shakable).       |
| **Name** (`icon='tabler:rocket'`) from a registered set | Server Components (or opt-in client) | None on the server; the whole set on the client. |

**Data.** An `IconifyIconData` object (`body`, `width`, `height`, and optionally `left`, `top`, `rotate`, `hFlip`,
`vFlip`) declared in your code. Each object is a separate export, so a bundler keeps only the ones you use: the
`check:bundle` gate of the library verifies that one imported icon brings only its own data. The icon browser of the
starter copies this code for any icon.

**Name.** Register the `icons` export of an `@iconify-json/<prefix>` package, then name icons as `prefix:name`:

```tsx
import { icons as tablerIcons } from '@iconify-json/tabler';
import { IconifyIcon, registerIconCollection } from '@midnight-indigo/ui/icons';

registerIconCollection(tablerIcons);

<IconifyIcon icon='tabler:rocket' decorative />;
```

Registration belongs to one JavaScript environment. In a Server Component the set stays on the server and the browser
receives only the rendered SVG, so naming icons costs no client JavaScript. Registering in a Client Component sends the
whole set to the browser (Tabler alone is about 2 MB before compression); do it only knowingly, and prefer data on the
client. A name whose set is not registered, or that the set does not have, throws an error that says which, during
development as in production.

`getIconData(collection, name)` returns the data of one icon of a set (aliases resolved), for code that reads the sets
at build time. `listRegisteredIconCollections()` and `unregisterIconCollection(prefix)` manage the registry.

## Accessibility, size and color

`IconifyIcon` follows the rule of `Icon` ([foundations.md](./foundations.md#icons)): the type requires either a
`label` (a functional icon, `role="img"`) or `decorative` (hidden from assistive technologies). An icon in a slot of a
named control is decorative.

`size` is `small`, `medium`, `large` (the `iconSize` tokens) or `inherit` (`1em`, the default). It sets the height; a
wide or tall icon keeps its proportions. Monochrome icons use `currentColor`, so they take the color of the text; the
multicolor sets (emoji, logos, flags) keep their own colors.

Ids inside an icon (gradients, masks) are renamed per rendered icon, so two copies on one page never share them. Empty
elements are written with a closing tag, as the browser serializes them, so server and client markup match.

## Icons in components

Every slot that takes an icon takes an `IconifyIcon`: `startIcon` and `endIcon` of `Button`, the child of
`IconButton`, `icon` of `Alert`, `Chip`, `Tab`, sidebar and menu items, the `icon` option of a toast, the prefix and
suffix of fields, and so on.

```tsx
<Button startIcon={<IconifyIcon icon={rocketIcon} decorative />}>Launch</Button>;

toast.show({ message: 'Version 2 is live.', icon: <IconifyIcon icon={rocketIcon} decorative /> });
```

The glyphs the components draw themselves (check, close, chevrons, intent icons) come from
[Tabler Icons](https://tabler.io/icons) (MIT). They are embedded one by one in the library, which does not depend on
any icon package at runtime.

## Licenses and attribution

Each icon set has its own license. The starter depends on every set whose license allows commercial distribution
next to an MIT project: MIT, ISC, BSD, Apache-2.0, 0BSD, BlueOak-1.0.0, CC0-1.0, Unlicense, OFL-1.1 and CC-BY-4.0.
Sets under GPL, CC-BY-SA, a non-commercial or an unknown license, and the sets Iconify deprecated, are left out; the
list of each excluded set and its reason is in `ICON-NOTICES.md` of the starter.

- One `@iconify-json/<prefix>` package per set, never the complete `@iconify/json`, so `pnpm check:licenses` audits the
  license each set really declares. Adding a GPL or CC-BY-SA set fails the audit.
- **CC-BY-4.0 requires crediting the authors.** The starter generates the credit: the page `/<locale>/icons/attribution`
  and the files `ICON-NOTICES.md` and `ICON-NOTICES.pt-BR.md`. Keep one of them in an application that ships icons
  of those sets.
- `pnpm update:icon-sets` (repository root) refreshes the list from the metadata of Iconify: the dependencies of the
  starter, `src/icons/icon-sets.ts` and the notices. Run `pnpm install` afterwards.

When you copy icon data into your own code, the comment the icon browser writes above it (`prefix:name`, set, author
and license) keeps the origin of each icon traceable.
