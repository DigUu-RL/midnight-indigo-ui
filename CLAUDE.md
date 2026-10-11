# Midnight Indigo: UI

Monorepo (pnpm workspaces) for `@midnight-indigo/ui`, a single npm package exposing public subpaths (`@midnight-indigo/ui/forms`, `/charts`, ...). Roadmap and specifications live in `.roadmap/` (git-ignored, local only).

## Commands

- `pnpm install` — install (pnpm is pinned via `packageManager`; enable it with corepack).
- `pnpm check` — full gate: build, typecheck, lint, format check, tests, package lint (publint + attw) and source-cleanliness check.
- Consumer fixture tests (`fixtures/consumer`) import the compiled output, so run `pnpm build` before `pnpm test`.

## Code conventions

These are enforced by ESLint where possible (`eslint.config.ts`); follow them everywhere else too.

- **TypeScript only.** Use JavaScript only when strictly unavoidable. Node scripts and tests run `.ts` directly (native type stripping), so keep syntax erasable (no `enum`, no `namespace`, no parameter properties).
- **Comments in English.**
- **No abbreviations.** Variables, functions, classes, interfaces and types use full, descriptive names (`sourceDirectory`, not `srcDir`; `entry`, not `e`).
- **Arrow functions.** Use `function` only when strictly necessary (e.g. generators, `this` binding).
- **Explicit types** on variables, parameters and return types, even when inference would work.
- **Ternaries over `if`/`else`; avoid `else`** (object calisthenics) — prefer early returns.
- **Braces for anything spanning more than one line** — `if`/`for`/`while` bodies, arrow function bodies, everything. Omit braces only when the whole construct fits on a single line (`const isEmpty = (list: string[]): boolean => list.length === 0;`). Enforced by the local rule in `eslint-rules/`.
- **Blank lines between groups, not between every statement.** Short related statements stay together (a `const` followed by the `return` that uses it needs no blank line); separate distinct groups, and set multi-line blocks and multi-line declarations apart with blank lines.
