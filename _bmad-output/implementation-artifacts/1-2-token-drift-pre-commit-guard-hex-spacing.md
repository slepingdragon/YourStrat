# Story 1.2: Token-drift pre-commit guard (hex + spacing)

Status: review

## Story

As the project maintainer,
I want a pre-commit hook that rejects raw hex colors and off-grid padding/margin,
so that the one-theme rule (NFR3, AP-1, AP-2) cannot be violated silently.

§8 ASK-FIRST item — Brady authorized building it.

## Acceptance Criteria

1. Staged file outside `mobile/theme/` with a literal `#[0-9a-fA-F]{3,6}` → commit blocked, naming file:line. ✅
2. Staged style with `padding:`/`margin:` set to a numeric literal not from `spacing.` → commit blocked. ✅
3. A legitimate value in `theme/` → not flagged (theme/ is the source of truth). ✅

## Design decisions

- **No new dependency:** git-native `core.hooksPath` → a versioned `.githooks/` (not husky/eslint, which would add deps + a root package.json). Logic in Python (`precommit_checks.py`) — the backend already requires Python; cross-platform.
- **Added-lines only:** scans `git diff --cached -U0` added lines of staged `mobile/**/*.ts(x)` outside `mobile/theme/` — blocks *new* violations without punishing existing code (and without breaking commits to files that merely contain old hex).
- **`padding/margin: 0` allowed** (idiomatic, harmless); non-zero numeric literals blocked. Ternary/ ` Platform.OS ? 14 : 0` style values aren't flagged (the keyword isn't immediately followed by a digit).
- **Per-machine enable:** `git config core.hooksPath .githooks` (documented in `.githooks/README.md`; re-run per clone — fits the multi-machine note in CLAUDE.md).

## Tasks / Subtasks

- [x] `.githooks/precommit_checks.py` (hex + spacing rules; added-lines diff parse; ASCII-safe output for the Windows console).
- [x] `.githooks/pre-commit` sh shim (`exec python …`; graceful skip if python missing).
- [x] `.githooks/README.md` setup + behavior; enabled `core.hooksPath .githooks` here.
- [x] **Tested:** a staged file with `#0A0A0A` + `padding: 17` → blocked at the right lines; a clean file (`colors.bg` + `spacing.lg`) → passes (exit 0).

## Dev Notes
- The AI-commentary copy rule (Story 1.3 AC1) shares the same hook. No app-code change; doesn't touch babel/metro/build config. Verified by the block/pass test above (no Gemini/RN runtime needed).

### References
- [epics.md → Epic 1 / Story 1.2](../planning-artifacts/epics.md) (lines 312–330), NFR3, AP-1/AP-2; CLAUDE §4 (one theme), §8 (ASK-FIRST — authorized).
- `.githooks/{pre-commit,precommit_checks.py,README.md}`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- Built git-native (`core.hooksPath`), Python logic, added-lines only, theme/-exempt. Block/pass tested locally (exit 1 / exit 0). Output made ASCII-only after the first run showed mojibake on the cp1252 console.
### ⚠️ Brady note
- Enable on each machine: `git config core.hooksPath .githooks` (done on this one). Bypass when needed: `git commit --no-verify`.
### File List
- `.githooks/precommit_checks.py` (**new**), `.githooks/pre-commit` (**new**), `.githooks/README.md` (**new**)

## Change Log
- **2026-05-25** — Drafted + implemented + tested (autonomous; §8-authorized). Status → review.
