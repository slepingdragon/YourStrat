# Story 1.3: Scope & motion review checks (AI-whisper, animation, lists)

Status: review

## Story

As a reviewer,
I want automated/checklist guards against AI-commentary copy, unjustified animation, and non-virtualized lists,
so that scope-guard (§2) and 60-FPS (NFR1) violations are caught before merge.

§8 ASK-FIRST item — Brady authorized building it. Shares the Story 1.2 hook + adds a PR template.

## Acceptance Criteria

1. Staged file with `"Based on"` / `"It looks like"` in user-facing copy → commit blocked pending review (AP-15). ✅ (in the pre-commit hook)
2. A PR introducing a new animation → the PR template requires it be justified against LAW-3's three approved animations (AP-3/AP-4). ✅ (PR template checklist)
3. A list rendering ≥10 items → must use `FlatList`/`FlashList`, not `.map()` in a `ScrollView` (AP-17) → PR check. ✅ (PR template checklist)

## Design decisions

- **AI-copy = hard hook block** (regex-detectable on added lines, alongside 1.2's hex/spacing).
- **Animation + lists = PR template**, not a hook: list length / "is this animation justified" can't be detected reliably by regex (false-positive-prone) — the AC itself says "reviewed / PR check." So `.github/pull_request_template.md` carries an explicit, checkbox-gated checklist (animation justification, ≥10-item virtualization, scope guard, wired+verified).

## Tasks / Subtasks

- [x] AI-commentary copy rule in `.githooks/precommit_checks.py` (`Based on` / `It looks like` on added `mobile/**/*.ts(x)` lines) — tested (blocked).
- [x] `.github/pull_request_template.md` — premium/scope/60-FPS checklist (one-theme guard-enforced note + animation LAW-3 justification + ≥10-item FlatList + scope guard + wired/verified).

## Dev Notes
- Hex/spacing half is Story 1.2 (same hook). No app-code change. The hook half tested (the AI-copy line blocked in the 1.2 block test). PR template is process tooling (GitHub renders it on PR open).

### References
- [epics.md → Epic 1 / Story 1.3](../planning-artifacts/epics.md) (lines 332–350), §2 scope guard, NFR1, AP-3/AP-4/AP-15/AP-17, LAW-3; CLAUDE §8 (ASK-FIRST — authorized).
- `.githooks/precommit_checks.py` (AI-copy rule), `.github/pull_request_template.md`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- AI-copy hard-blocked by the hook (tested); animation + list checks are PR-template gates (regex can't judge list length or animation justification). No runtime needed.
### File List
- `.githooks/precommit_checks.py` (modified — AI-copy rule; shared with 1.2)
- `.github/pull_request_template.md` (**new**)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous; §8-authorized). Status → review.
