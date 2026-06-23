---
paths:
  - "packages/*/src/**/*.ts"
  - "packages/*/test/**/*.ts"
---

## TypeScript code style

Formatting is Prettier 3 (`.prettierrc` at the repo root) wired into ESLint via `eslint-plugin-prettier/recommended`, so `npm run lint:fix` reformats *and* lints in one pass. Print width 100, single quotes, trailing commas everywhere, 2-space indent, LF line endings. The rule set lives in `eslint.config.js` (flat config) and rests on `typescript-eslint` plus `eslint-plugin-import-x` (registered under the `import/` prefix for backwards compatibility with inline disable comments). Run `npm run lint:fix` inside the package(s) you touched before handing off — root `npm run lint:fix` delegates via `lerna run lint:fix`.

A PostToolUse hook (`.claude/hooks/lint-fix-after-edit.sh`) runs `eslint --fix` on every Claude-edited `.ts`/`.tsx` file, and the pre-commit hooks (`.claude/hooks/typecheck-before-commit.sh`, `.claude/hooks/declarations-before-commit.sh`) run `typescript:check-types` and `typescript:declaration` on changed packages so type errors surface before a commit lands.

- **`'.ts'` suffix on relative TypeScript imports.** `tsconfig.json` sets `allowImportingTsExtensions: true` and `import/extensions` is `['error', 'always', { ts: 'always', tsx: 'always', js: 'always', jsx: 'never', ignorePackages: true }]`, so relative imports carry their extension while package imports (`ramda`, `minim`) stay extension-free. Babel rewrites the source `.ts` to the emitted `.mjs`/`.cjs` at build time.

- **Single quotes for strings.** `quotes: ['error', 'single', { avoidEscape: true }]`. Use a double-quoted literal only when the string contains a single quote and escaping would be noisier.

- **Imports are grouped and separated by blank lines.** `import/order` enforces two groups: `[builtin, external, internal]` then `[parent, sibling, index]`, with `newlines-between: 'always'`. The autofixer handles ordering; just run `lint:fix`.

- **No deep relative imports across packages.** Within a package, `../foo.ts` is fine. Reaching into another workspace package via relative paths is wrong — import its public entry (e.g. `@speclynx/apidom-core`). `import/no-extraneous-dependencies` blocks importing devDeps from non-test code (test trees under `packages/*/test/**` are exempt).

- **`_`-prefix for intentionally unused params and vars.** `@typescript-eslint/no-unused-vars` is `error` with `argsIgnorePattern: '^_'`, `varsIgnorePattern: '^_'`, `caughtErrorsIgnorePattern: '^_'`. Use `_result`, `_err` for "I have to declare it but I don't use it" cases. Don't disable the rule.

- **`any` is a warning, not an error — and a smell.** `@typescript-eslint/no-explicit-any: 'warn'`. Prefer `unknown` and narrow with type guards; reach for `Record<string, unknown>` for opaque object shapes.

- **`tsconfig.json` is strict on purpose.** `strict: true`, `isolatedModules: true`, `module`/`moduleResolution: nodenext`, `noEmit: true` (Babel emits; tsc only type-checks). Don't loosen these to silence errors — fix the type.

- **Empty interfaces are allowed.** `@typescript-eslint/no-empty-object-type` is off — empty interfaces are an intentional type-extension pattern in the namespaces.

- **No comments explaining what code already says.** Project-wide rule from `.claude/rules/karpathy-guidelines.md`: comments explain *why*, not *what*. Line comments (`//`) start lowercase; block comments (`/** */`) start uppercase.

When ESLint and Prettier disagree with a stylistic choice in your edit, the autofixer wins. If a rule is genuinely wrong for a specific line, prefer narrowing the rule in `eslint.config.js` over scattering inline `// eslint-disable` comments.
