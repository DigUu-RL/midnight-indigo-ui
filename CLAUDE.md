# Midnight Indigo: UI

Monorepo (pnpm workspaces) for `@midnight-indigo/ui`, a single npm package exposing public subpaths (`@midnight-indigo/ui/forms`, `/charts`, ...).

## Roadmap

- **Features:** one GitHub issue per feature (label `feature`, F01–F18 = issues #2–#19), holding the full spec, acceptance criteria and dependencies.
- **Progress:** GitHub Project <https://github.com/users/DigUu-RL/projects/1> — Status `Planejada` → `Em desenvolvimento` → `Concluída`, plus `Prioridade` and `Fase` fields.
- **Reference docs** (architecture, decisions, theming, ...): repository wiki <https://github.com/DigUu-RL/midnight-indigo-ui/wiki>.
- **Workflow:** implement each feature on a branch; the PR body contains `Closes #N` (moves the item to `Em desenvolvimento`); merging only after all acceptance criteria and CI pass closes the issue and moves it to `Concluída`. New issues are not auto-added: add them with `gh project item-add 1 --owner DigUu-RL --url <issue-url>` and set `Prioridade`/`Fase`.

## Commands

- `pnpm install` — install (pnpm is pinned via `packageManager`; enable it with corepack).
- `pnpm check` — full gate (CI job `check`): build, typecheck, lint, format check, tests, performance tests, package lint (publint + attw), source-cleanliness check, license audit and bundle budgets.
- `pnpm test:performance` — performance suite of `packages/ui` (`*.performance.test.ts(x)`, run one file at a time): counts in jsdom, times in Node. `PERFORMANCE_BUDGET_FACTOR=2` scales the budgets on a slow machine.
- `pnpm test:browser` — Playwright suite in `fixtures/browser` (CI job `browser`): starter E2E, axe with contrast, visual regression, then browser performance alone. First run: `pnpm --filter @midnight-indigo/browser-tests exec playwright install chromium`. Visual baselines are per OS (`test/__screenshots__/<platform>`); after an intentional visual change, run `test:visual:update` locally and add the `update-visual-baselines` label to the PR, whose workflow commits the Linux baselines.
- `pnpm check:bundle` — gzip/brotli size of the initial and on-demand JS of every public entry (peers external) and starter route, against `bundle-budgets.json`; needs `pnpm build`. After an intended growth, `node scripts/check-bundle-size.ts --update` rewrites baselines and budgets (+10%), and the PR explains why.
- `pnpm check:licenses` — production dependencies of the consumer fixture and the starter must have an allowed license (`scripts/check-licenses.ts`).
- Consumer fixture tests (`fixtures/consumer`) import the compiled output and pack the tarball, the starter test (`templates/nextjs-starter`) and the browser suite serve production builds, so run `pnpm build` before `pnpm test` or `pnpm test:browser`.
- How to reproduce each CI failure locally: wiki page [Testes e integração contínua](https://github.com/DigUu-RL/midnight-indigo-ui/wiki/Testes-e-integração-contínua).

## Code conventions

These are enforced by ESLint where possible (`eslint.config.ts`); follow them everywhere else too.

- **TypeScript only.** Use JavaScript only when strictly unavoidable. Node scripts and tests run `.ts` directly (native type stripping), so keep syntax erasable (no `enum`, no `namespace`, no parameter properties).
- **Comments in English.**
- **No abbreviations.** Variables, functions, classes, interfaces and types use full, descriptive names (`sourceDirectory`, not `srcDir`; `entry`, not `e`).
- **Arrow functions.** Use `function` only when strictly necessary (e.g. generators, `this` binding).
- **Explicit types** on variables, parameters and return types, even when inference would work.
- **Ternaries over `if`/`else`; avoid `else`** (object calisthenics) — prefer early returns.
- **Braces for anything spanning more than one line** — `if`/`for`/`while` bodies, arrow function bodies, everything. Omit braces only when the whole construct fits on a single line (`const isEmpty = (list: string[]): boolean => list.length === 0;`). Enforced by the local rule in `eslint-rules/`.
- **No relative imports** (neither `../` nor `./`). Each workspace maps its folders in the `imports` field of its `package.json` (`#src/*`, `#test/*`, `#scripts/*`; the root has `#eslint-rules/*`) and imports through them: `import { Glyph } from '#src/shared/glyphs/index.tsx'`. Node only accepts `#` for these subpath imports, and they work unchanged in Node, tsc, Vitest and tsdown, which rewrites them in `dist`. Another workspace is imported by its package name. Enforced by `no-restricted-imports`.
- **One folder per component:** `src/<domain>/<component>/index.tsx` with its test in `index.test.tsx` next to it (e.g. `data-display/chip/`). Only `src/<domain>/index.ts` is a public entry.
- **JSX:** the closing `>` of a multi-line opening tag goes on its own line (Prettier `bracketSameLine: false`). Children follow the rule of statements: a child spanning more than one line is set apart from its siblings by blank lines, and children that fit on one line follow each other without one (local rule `jsx-children-spacing` in `eslint-rules/`).
- **Blank lines between groups, not between every statement.** Short related statements stay together (a `const` followed by the `return` that uses it needs no blank line); separate distinct groups, and set every multi-line statement (blocks, declarations and expressions such as a multi-line `await new Promise(...)` or `assert.match(...)`) apart with blank lines before and after.
