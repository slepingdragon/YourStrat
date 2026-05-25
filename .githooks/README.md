# Git hooks (YourStrat)

Versioned pre-commit guards (Stories 1.2 + 1.3) — **no dependency** (uses git's
native `core.hooksPath` + Python, which the backend already requires).

## Enable (once per clone / per machine)

```sh
git config core.hooksPath .githooks
```

(Per-machine — re-run after cloning on a new machine. See CLAUDE.md "switching machines".)

## What `pre-commit` blocks

On staged `mobile/**/*.ts(x)` **outside `mobile/theme/`**, scanning only **added lines**:

- **raw hex color** (`#abc` / `#aabbcc`) → use a token from `theme/colors.ts` (NFR3, AP-1/AP-2)
- **padding/margin** set to a non-zero numeric literal → use a `spacing.*` token (AP-1/AP-2)
- **AI-commentary copy** (`Based on`, `It looks like`) → forbidden voice (§2, AP-15)

Logic lives in `precommit_checks.py` (testable on its own). Animation-justification
and ≥10-item-list checks are in `.github/pull_request_template.md` (can't be detected
reliably by regex).

Emergency bypass (owner, rare): `git commit --no-verify`.
