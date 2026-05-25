# Story 1.8: `WaterRow` scope audit

Status: done

## Story

As the product owner protecting the scope guard,
I want `nutrition/WaterRow.tsx` audited,
so that out-of-scope water tracking (build §4.1) doesn't ship by accident.

## Acceptance Criteria

1. Given the component and its usages, when audited, **then** a determination is recorded — accidental scope creep (remove) or intentional/approved (keep + document) — and acted on.

## Outcome — REMOVED (verified 2026-05-24)

Audit (recorded in [epics.md → Story 1.8](../planning-artifacts/epics.md)) found `mobile/components/nutrition/WaterRow.tsx` was a full water-tracking feature — out of v1 scope (build §4.1) — persisting only to `AsyncStorage`, i.e. a backend-orphan UI (violates NFR4 / CLAUDE §5). It was live in `NutritionDayView` (the "Hydration" section). Removed the import + section and deleted the file.

**Verification this session:** `git grep "WaterRow"` across `*.tsx`/`*.ts` → **zero references**; file absent from the working tree; `NutritionDayView.tsx` no longer renders a hydration section; `tsc --noEmit` clean. Determination: **accidental scope creep → removed**. Reversible via git if Brady wants it back.

## File List
- `mobile/components/nutrition/WaterRow.tsx` (deleted).
- `mobile/components/nutrition/NutritionDayView.tsx` (modified — removed the import + Hydration section).

## Change Log
- **2026-05-24** — Audit → REMOVED (out-of-scope water tracking + backend-orphan UI). Verified clean: no references, tsc clean. Status → done.
