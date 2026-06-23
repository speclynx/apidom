## Branches

- Branch naming: `char0n/<issue-number>--<description>` (kebab-case description).
- If no issue exists, use a short kebab-case description after the slash.

## Commits

- Break work into **atomic** logical units — each commit should stand on its own and be reviewable in isolation.
- Reference related issues with `Refs #<issue>` in the commit body.
- Do NOT use GitHub magic close-keywords (`Closes`, `Fixes`, `Resolves`) in commit messages — those belong in the PR body so they close issues on merge, not on every push.
- Follow Conventional Commits (see `conventional-commits.md`).
- Sign off every commit with DCO: `git commit -s` (per `CONTRIBUTING.md`).

## Issues

If you spot something worth tracking outside the current task, surface it and offer to file a GitHub issue — don't let findings get buried in chat. Never create one yourself unless the user explicitly asks. Before creating any issue:

- Verify the claim (re-read the code, run the relevant test, reproduce if possible).
- Search existing issues (`gh issue list --search "..."`) to avoid duplicates. If a match exists, comment on it with new findings instead of opening a new one.

## Pull requests

- Keep PRs **small and focused**. Split unrelated changes into separate PRs.
- Before opening a PR, search existing issues (`gh issue list --search "..."`) and link the ones the change touches in the PR **body** (never the title).
- Use `Closes #N` / `Fixes #N` for issues the PR fully resolves — they auto-close on merge. Use `Refs #N` for partial relation.
- The squash/merge commit message must follow Conventional Commits (see `conventional-commits.md`).
- When a PR adds or changes a feature, update the relevant documentation in the same PR.
