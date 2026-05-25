# Story 6.5: Day-detail receipt density (N-A2)

Status: review

## Story

As a user drilling into a day,
I want a clean receipt-style breakdown,
so that the detail reads premium and scannable (N-A2).

Reworks `app/nutrition/day/[date].tsx` to Stripe-receipt density and makes it a swipe-dismissable modal.

## Acceptance Criteria

1. **Receipt density.** Card backgrounds dropped; the **date is a large header**; meals are flat **table rows** (name · kcal); **totals are bottom-anchored** (divider + total kcal + P/C/F).
2. **No redundant title bar; swipe-down dismisses.** The `BackHeader` is removed; the screen is presented as a **modal** (`presentation: "modal"`) so iOS swipe-down dismisses, plus a grabber + a close (`X`) affordance for cross-platform/Android dismiss.

## Scope note (§8)
The `presentation: "modal"` change to the one `nutrition/day/[date]` Stack.Screen is a navigation-config change — flagged in the prior turn and authorized by Brady's "proceed." Blast radius is that single route (pushed from the Nutrition tab's day rows); other screens unaffected. A tappable close `X` + grabber back the swipe so Android (no swipe-down) can still dismiss.

## Tasks / Subtasks

- [x] **Task 1 — Modal presentation** (AC: #2) — `app/_layout.tsx`: `nutrition/day/[date]` gets `options={{ presentation: "modal" }}`.
- [x] **Task 2 — Receipt rework** (AC: #1, #2) — grabber + close `X` top row; 28pt date header; flat meal rows (name · kcal, hairline dividers, tap → `/meal/[id]`); scrollable line items with a **bottom-anchored totals footer** (divider + big total kcal + P/C/F). Dropped `BackHeader`, `Card`, `NutritionRingsPanel`, `MealCard`.
- [x] **Task 3 — Verify** — `tsc --noEmit` clean.

## Dev Notes
- Reuse `formatKcal`/`formatMacroGrams`, `X`/`ChevronDown` icon, tokens. No new dep/token; no backend change. Layout = header (fixed) + meals `ScrollView` (flex) + totals footer (fixed bottom) so totals anchor to the bottom.
- **v1 limit:** the `NutritionRingsPanel` rings are dropped from this view (receipt is text-dense per N-A2); macro detail is the footer line.

### References
- [epics.md → Epic 6 / Story 6.5](../planning-artifacts/epics.md) (lines 1238–1252), N-A2.
- `app/nutrition/day/[date].tsx`, `app/_layout.tsx` (Stack), `lib/format.ts`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- `nutrition/day/[date]` → `presentation: "modal"` (one Stack.Screen option). Screen rewritten: grabber + close `X` row (no `BackHeader`), 28pt date header, flat meal rows (name · kcal, hairline dividers, tap → `/meal/[id]`) in a `flex:1` ScrollView, and a bottom-anchored totals footer (top border + 28pt total kcal + P/C/F line). Dropped `BackHeader`/`Card`/`NutritionRingsPanel`/`MealCard`/`targetsFromProfile`/`useStore`. tsc clean.
### ⚠️ Brady checklist (gates `done`)
1. Open a day from the Nutrition history scroll → it slides up as a modal; swipe-down dismisses (iOS); the close X / back dismisses (Android).
2. Large date header; meals are flat receipt rows (name · kcal) with hairline dividers, no cards/photos; tap a row → meal detail.
3. Totals sit at the bottom (divider + big total kcal + P/C/F); empty day reads cleanly with 0s.
### File List
- `mobile/app/nutrition/day/[date].tsx` (modified — receipt rework)
- `mobile/app/_layout.tsx` (modified — modal presentation)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous; modal change authorized via "proceed"). Status → review.
