## Parallel sessions via worktrees

ApiDOM is a library monorepo — the build artifacts are npm packages, not a long-running service. So worktree coordination is simple: there are no ports to allocate, no DB files, no compose stacks. The one runnable app is `apidom-playground` (`npm start` → Vite dev server); if two worktrees run it concurrently, give the second a different port (`vite --port <n>`).

When the user asks for a worktree:

1. Create it with `EnterWorktree`.
2. Set the Node version: `source ~/.nvm/nvm.sh && nvm use` (the repo's `.nvmrc` pins =26.3.1 — see `nvm.md`).
3. Install deps: `npm install` at the worktree root. npm workspaces hoist into a single root `node_modules/`; husky reinstalls its trampoline on `prepare`.
4. Build the packages you'll touch: `cd packages/<pkg> && npm run build:es` (ES-only is fastest for development — see `building.md`). Set `CPU_CORES` to your core count for faster parallel builds.

### What's shared vs. isolated

Nothing needs to be copied into a fresh worktree — every artifact a worktree consumes (`node_modules/`, per-package `dist/`/`types/`, emitted `.mjs`/`.cjs`) is gitignored and regeneratable. There is no `.env` to forward.

### Tests across worktrees

Tests are Mocha per-package (`cd packages/<pkg> && npm test`) with no shared external state, so concurrent runs across worktrees are safe. Snapshot updates (`npm run test:update-snapshots`) write into the package's own `test/` tree — no cross-worktree collision.
