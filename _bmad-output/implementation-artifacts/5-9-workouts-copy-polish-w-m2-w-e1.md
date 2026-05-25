# Story 5.9: Workouts copy polish (W-M2, W-E1)

Status: review

## Story

As a user on a rest day,
I want the screen calm and unannounced,
so that rest is felt, not narrated (UX-DR10 W-M2, UX-DR8 W-E1).

Small copy/treatment polish on the Workouts list. Implemented **together with 5.8** since both touch the same `workouts.tsx` day-group rendering (5.8 restructures the layout that 5.9 polishes — doing them separately would mean reworking 5.9).

## Acceptance Criteria

1. **Rest day = quiet line (W-M2).** A day with no scheduled routine shows **"Rest day" as an 11pt `textMuted` right-aligned line**, not a banner / not a sentence ("Rest day. Nothing scheduled.").
2. **No tagline (W-E1).** The Workouts page subtitle/tagline ("Your week, one day at a time.") is **removed**.

## Tasks / Subtasks

- [x] **Task 1 — Rest-day line** (AC: #1) — in `workouts.tsx`, the empty-day branch renders an 11pt `colors.textMuted` right-aligned "Rest day" line beside the day's quiet caption.
- [x] **Task 2 — Remove tagline** (AC: #2) — deleted the subtitle under the "Workouts" title.
- [x] **Task 3 — Verify** (AC: both) — `tsc --noEmit` clean; visual is Brady's device pass.

## Dev Notes
- No new component/dep/token/backend change. Tokens only. Bundled into the 5.8 commit/diff.

### References
- [epics.md → Epic 5 / Story 5.9](../planning-artifacts/epics.md) (lines 1148–1162), UX-DR10/UX-DR8.
- `app/(tabs)/workouts.tsx`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- Folded into the 5.8 `workouts.tsx` rework: subtitle removed; the empty-day branch now renders a right-aligned 11pt `textMuted` "Rest day" beside the quiet day caption (no banner sentence).
### File List
- `mobile/app/(tabs)/workouts.tsx` (modified — with 5.8)

## Change Log
- **2026-05-24** — Drafted + implemented with 5.8. Status → review.
