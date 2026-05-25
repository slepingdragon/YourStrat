# Story 1.5: `Button` destructive variant

Status: done

## Story

As a user performing a destructive action,
I want a clearly distinct destructive button,
so that delete actions read as dangerous without a one-off styled button (NFR3).

## Acceptance Criteria

1. A `destructive` variant added to the `Button` primitive renders with the `urgent` color token on text/border, keeps the pill shape and 56px min-height, and lives **in `Button.tsx`** (not a forked `DangerButton.tsx`).
2. The destructive variant carries `accessibilityRole="button"` and a descriptive `accessibilityLabel`.

## Tasks / Subtasks

- [x] **Task 1 — Add the variant** (AC: #1)
  - [x] `Variant` union gains `"destructive"`. Styling: `fg`/`borderColor` = `colors.urgent`, outlined (2px border, transparent fill), pill (`borderRadius: 999`), `minHeight` 56 (48 compact) — all unchanged from the shared style. Fires a **Medium** haptic on press (heavier than primary's Light, signals caution).
- [x] **Task 2 — Accessibility** (AC: #2)
  - [x] Added `accessibilityRole="button"` + `accessibilityLabel={accessibilityLabel ?? label}` + `accessibilityState={{ disabled }}` to the Pressable. (The base `Button` had **no** a11y attributes before — this improves every variant, not just destructive.) New optional `accessibilityLabel` prop lets callers override the spoken label.
- [x] **Task 3 — Wire real consumers** (CLAUDE §5 — no new UI without a consumer)
  - [x] Migrated the two genuine destructive actions to `variant="destructive"`: **Delete meal** (`app/meal/[id].tsx`, was `secondary`) and **Delete account** (`app/(tabs)/profile.tsx`, was `ghost`). "Sign out" left as `secondary` (reversible, not destructive).
- [x] **Task 4 — Verify**
  - [x] `tsc --noEmit` clean.

## Dev Notes

- `colors.urgent` (`#FB7185`) already exists in the theme — no new token.
- No fork: the destructive styling is a branch inside `Button.tsx`'s existing `fg`/`border` logic, reusing the same animated press-scale, pill geometry, and min-height.

### Brady visual glance (not blocking)
- Delete meal (meal detail) + Delete account (Profile → Account) now render as `urgent`-outlined pills. Confirm the red reads as "dangerous but calm" against the dark surface; if the shade needs tuning it's a one-line `colors.urgent` change, not a Button change.

## File List
- `mobile/components/ui/Button.tsx` (modified) — `destructive` variant + a11y (role/label/state) + optional `accessibilityLabel` prop.
- `mobile/app/meal/[id].tsx` (modified) — Delete meal → `destructive`.
- `mobile/app/(tabs)/profile.tsx` (modified) — Delete account → `destructive`.

## Code Review (2026-05-24, self / 3-layer)
- **Blind Hunter:** branch logic correct (`fg`/`borderColor`=urgent, outlined); existing variants unchanged (primary fill, secondary star-outline, ghost) — verified the ternary chain preserves each; a11y added without altering layout. tsc clean.
- **Edge Case Hunter:** `disabled`/`loading` path unchanged (opacity 0.4, ActivityIndicator uses `fg`=urgent); compact still 48px.
- **Acceptance Auditor:** AC1 (urgent text+border, pill, 56px, in Button.tsx) ✓; AC2 (role + descriptive label, defaults to `label`) ✓.

## Change Log
- **2026-05-24** — Implemented Story 1.5: `Button` `destructive` variant (`urgent`-outlined pill) + a11y role/label/state; wired Delete meal + Delete account. tsc clean; self-reviewed. Status → done.
