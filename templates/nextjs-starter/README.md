# Midnight Indigo: UI — Next.js starter

An administrative application for a fictional retail chain, **Aurora Retail**, built with
[Midnight Indigo: UI](https://github.com/DigUu-RL/midnight-indigo-ui) and the Next.js App Router. It needs no
backend and no account: the data is generated in `src/dashboard/demo-data.ts` and served by a mock API.

| Page              | Path                         | Shows                                                                    |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------ |
| Sales overview    | `/en-us`                     | Dashboard shell, filters, key figures, an area chart, a table            |
| Data scenarios    | `/en-us?state=loading`       | The loading, empty (`empty`) and error (`error`) states of the same page |
| Orders            | `/en-us/orders`              | A data table with search, filters, sorting, paging and an empty state    |
| Reports           | `/en-us/reports`             | One chart of each factory: line, composed, bar, donut and gauge          |
| New customer      | `/en-us/customers/new`       | A validated form whose checks and submission are Server Actions          |
| Appearance        | `/en-us/settings/appearance` | Palette editor: preview, contrast audit and the `theme.json` to export   |
| Page not found    | any other path               | The 404 page, in the language of the path, inside the shell              |
| Component gallery | `/gallery`                   | Every component of the library (English only; used for visual review)    |

Every page exists in **English** (`/en-us/...`) and **Brazilian Portuguese** (`/pt-br/...`).

## Getting started

Requirements: Node.js 22.18 or later and a package manager (pnpm is used below; npm and Yarn work too).

### From the repository of the library

```sh
git clone https://github.com/DigUu-RL/midnight-indigo-ui.git
cd midnight-indigo-ui
corepack enable
pnpm install
pnpm build
pnpm --filter @midnight-indigo/nextjs-starter dev
```

### As a project of your own

Generate a standalone copy, outside the repository:

```sh
pnpm build                                # in the repository, once
pnpm create:starter ../my-app --pack      # --pack: use the local build of the library
cd ../my-app
pnpm install
pnpm dev                                  # http://localhost:3000
```

The copy leaves out the tests of the repository, resolves the shared versions and stops extending the TypeScript
configuration of the monorepo. Without `--pack`, it depends on `@midnight-indigo/ui` from the npm registry; with it,
on a tarball of your local build in `vendor/`, for trying the starter before a release.

| Script           | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Development server with hot reload               |
| `pnpm build`     | Production build (also checks the types)         |
| `pnpm start`     | Serves the production build                      |
| `pnpm typecheck` | TypeScript only, after a build or `next typegen` |

## How it is put together

```text
src/
├── app/
│   ├── [locale]/            # every page of the application, once per locale
│   │   ├── layout.tsx       # root layout: <html lang>, providers and the shell
│   │   ├── page.tsx         # sales overview
│   │   └── orders/ reports/ customers/new/ settings/appearance/ icons/
│   ├── gallery/             # the component gallery, with its own root layout
│   └── global-not-found.tsx # the 404 page of any path no route matches
├── proxy.ts                 # sends paths without a locale to the preferred one
├── i18n/                    # locales, messages by locale, server translation
├── messages/                # en-us.json and pt-br.json
├── shell/                   # providers, the dashboard shell, the language links
├── icons/                   # the installed icon sets, the icon browser (server only)
├── dashboard/ orders/ reports/ customers/ appearance/
├── theme.json               # the palette of the application
└── theme.ts
```

- **Public subpaths only.** The application imports `@midnight-indigo/ui`, `@midnight-indigo/ui/dashboard`,
  `@midnight-indigo/ui/charts`... like any other consumer, never a file of the library.
- **Server Components first.** Layouts and pages are Server Components that translate their headings and metadata
  on the server; the interactive parts (`'use client'`) are the leaves: filters, tables, charts, forms.
- **No flash, no duplicated CSS.** `AppRouterCacheProvider` of `@mui/material-nextjs` wraps `UiProvider` in
  `src/shell/app-providers.tsx`, so the theme and the component styles are in the `<head>` of the first response.

## Languages

The locale is the first segment of the URL. `src/proxy.ts` redirects a path without one (`/`, `/orders`) to the
language chosen last (a `locale` cookie) or, on a first visit, to the one the browser prefers (`Accept-Language`),
else English. The language links in the top bar lead to the same page in the other language.

- Messages are JSON, with the same camelCase keys in every locale; plurals are nested objects (`one`, `many`, `other`).
- Server Components translate with `getTranslator(locale)` (`src/i18n/server.ts`); Client Components with
  `useI18n()` of `@midnight-indigo/ui/i18n`. The browser only receives the messages of the locale it renders.
- Bold, code or a link on part of a sentence go in the message as tags (`"Happy with it? <link>Export the theme</link>"`),
  rendered by `rich` of `getRichTranslator(locale)` on the server or of `useI18n()` on the client; `plain` gives the
  text without them. Every locale must use the tags of English in each key, which `test/messages.test.ts` checks.
- The time zone (`America/Sao_Paulo`) and the currency (`BRL`) belong to the business, not to the language, and are set
  in `src/i18n/locales.ts`, so the server and the browser format dates and amounts the same way.

**Adding a language:** add its segment and tag to `src/i18n/locales.ts`, a `src/messages/<segment>.json` with every key
of `en-us.json`, and its entry in `src/i18n/messages.ts`. The texts of the components come from the library in pt-BR and
en-US; for another language, give them under the `midnight-indigo` namespace (see the i18n guide of the library).

## Palette and tokens

The palette is `src/theme.json`, validated by `parseUiThemeConfig` at build time: an invalid color fails the build
with every problem listed. The **Appearance** page edits the main color of each intent, previews the components, audits
the contrast against WCAG 2.2 AA and exports the JSON to paste into `src/theme.json`.

Application CSS uses the tokens as CSS custom properties (`var(--mi-surface-raised)`, `var(--mi-spacing-4)`; see
`src/shell/globals.css`), so it follows the palette. TypeScript code reads them from `themeVariables` of
`@midnight-indigo/ui/theme`.

## Icons

The starter depends on every open-source icon set of [Iconify](https://iconify.design) whose license allows
commercial use next to an MIT project, one `@iconify-json/<prefix>` package each (`src/icons/icon-sets.ts` lists
them). The **Icons** page searches the names of every set, filters by set and license, previews an icon in each size
and intent, and copies the code to use it. It runs on the server: the browser receives the rendered SVG, never a set.

- In a Server Component, register a set with `registerIconCollection` and name icons (`tabler:home`) at no client
  cost; in a Client Component, paste the icon data the browser copies, so only that icon reaches the bundle. See the
  icons guide of the library.
- Sets under CC BY 4.0 require crediting their authors: the **Icon attribution** page and `ICON-NOTICES.md` (also in
  `ICON-NOTICES.pt-BR.md`) do it, and list each excluded set with the reason. Keep one of them in your application.
- The sets take about 330 MB in `node_modules` and are not part of any page bundle. To ship fewer, remove the
  `@iconify-json/*` dependencies you do not use and their entries in `src/icons/icon-sets.ts`.

## Replacing the demo

- **Data:** `src/dashboard/mock-api.ts` is the only thing the sales overview calls; replace `fetchDashboard` with a
  request to your backend. The customer Server Actions are in `src/customers/actions.ts`.
- **Pages:** add a route under `src/app/[locale]/`, its entry in `src/shell/destinations.tsx` and its texts in
  `src/messages/*.json`.
- **Branding:** the name is `app.name` in the messages; the logo is `brandIcon` in `src/shell/destinations.tsx`.

## License

MIT, like the library. Geist Sans and Geist Mono are licensed under the SIL Open Font License 1.1. Each icon set keeps its own
license; see `ICON-NOTICES.md`.
