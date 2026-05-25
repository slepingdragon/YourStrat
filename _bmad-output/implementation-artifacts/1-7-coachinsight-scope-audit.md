# Story 1.7: `CoachInsight` scope audit

Status: done

## Story

As the product owner protecting the scope guard,
I want `nutrition/CoachInsight.tsx` audited,
so that no AI-commentary copy ships (§2, AP-15).

## Acceptance Criteria

1. Given the component's rendered copy, when audited, **then** if it emits AI-commentary ("Based on your recent meals…"-style) it is removed/refactored to a non-commentary form; if already compliant, the finding is recorded.

## Outcome — REMOVED (verified 2026-05-24)

Audit (recorded in [epics.md → Story 1.7](../planning-artifacts/epics.md)) found `mobile/components/nutrition/CoachInsight.tsx` rendered a "COACH" insight-line card — a §2-forbidden coach-commentary surface — and was **imported nowhere** (dead code). Deleted.

**Verification this session:** `git grep "CoachInsight"` across `*.tsx`/`*.ts` → **zero references**; file absent from the working tree; `tsc --noEmit` clean. Zero blast radius. AC satisfied (the audit found a violation and it was removed). Reversible via git if ever needed.

## File List
- `mobile/components/nutrition/CoachInsight.tsx` (deleted).

## Change Log
- **2026-05-24** — Audit → REMOVED (AI-commentary scope violation, dead code). Verified clean: no references, tsc clean. Status → done.
