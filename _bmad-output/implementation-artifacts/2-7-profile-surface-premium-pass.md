# Story 2.7: Profile surface premium pass (P-S1, P-E1, P-E2, P-C1, P-A1)

Status: review

## Story

As a user opening Profile,
I want a calm trophy-case, not an admin panel,
so that the surface reads premium and answers "who am I + my status" instantly (FR28, FR29, FR30-Profile).

Premium pass on the Profile tab — completes the main-tab premium set (Today 4.7, Workouts 5.8, Nutrition Epic 6). The edit-details form (Story 2.6) + save/hydrate/sign-out/delete logic are preserved; only the surrounding surface is reworked.

## Acceptance Criteria

1. **Hero (P-S1)** lifetime kcal-burned at **72pt tabular**; **section taglines removed (P-E1)**; **duplicate daily-targets card removed (P-E2)** (targets live on Today/Nutrition).
2. **Trial single line (P-C1)** — "N days · X/10 scans today", no card chrome, from real trial state.
3. **Account grouped rows (P-A1)** — Apple-Settings grouped text-row density; **Delete Account is a destructive row**.
4. **AI transparency** — loads `GET /profile/ai-stats` and shows total scans, scans-this-week, avg confidence, low-confidence count honestly (+ the backend `accuracy_note` caveat; no accuracy claim — NFR12).

## Design decisions

- **Hero**: 72pt `formatKcal(lifetime_calories_burned)` + "calories burned · all-time" + a sessions/effort sub-line; zero workouts → "0" + calm "Your all-time burn tallies here." (no apology).
- **Account/AI as grouped lists**: a local `Row`/`Group` (rounded `surface` container, hairline dividers, label + value/chevron) — local helpers, not a new shared primitive. Delete row label is `error`.
- Trial line replaces the trial Card; the per-state explanatory paragraphs are dropped (P-C1 wants one line). "How scanning works" stays as a Row → `/ai-info`.

## Tasks / Subtasks

- [x] **Task 1 — Hero + trim** (AC: #1) — 72pt lifetime-burn hero near top; remove the page tagline, the trial Card chrome, the lifetime Card, and the daily-targets Card.
- [x] **Task 2 — Trial line** (AC: #2) — single `textSecondary` line (admin / active / ended variants).
- [x] **Task 3 — AI stats inline** (AC: #4) — fetch `getAiStats()` in the focus effect; grouped rows (total / this week / avg confidence / low-confidence) + `accuracy_note` caption + "How scanning works" row.
- [x] **Task 4 — Account grouped rows** (AC: #3) — `Group`/`Row` helpers; Sign out + Delete (destructive) as rows.
- [x] **Task 5 — Verify** — `tsc --noEmit` clean.

## Dev Notes
- Reuse `formatKcal`, `getAiStats`/`AiStats`, `getSessionStats`/`SessionStats`, `normalizeTrial`, tokens. Edit form, `computeTargets` preview, `save`, `signOut`, `performDelete`, `deleteAccount`, the `!profile` skeleton — all preserved. No new dep/token/route; no backend change.

### References
- [epics.md → Epic 2 / Story 2.7](../planning-artifacts/epics.md) (lines 572–596), P-S1/P-E1/P-E2/P-C1/P-A1, FR28/29/30-Profile, NFR12.
- `app/(tabs)/profile.tsx`, `lib/api.ts` (`getAiStats`/`AiStats`, `getSessionStats`/`SessionStats`), `components/ProfileIdentity.tsx`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- 72pt `allowFontScaling={false}` lifetime-burn hero (0 → "Your all-time burn tallies here."); removed the page tagline, the trial Card, the lifetime Card, and the daily-targets Card. Single-line trial (admin/active/ended). `getAiStats()` added to the focus effect → grouped AI rows (total / this week / avg confidence% / low-confidence) + `accuracy_note` caption (graceful when the fetch fails — only the "How scanning works" row shows). Account is a grouped list (`SettingsGroup`/`SettingsRow` local helpers) with Sign out + a red destructive Delete row (still confirms → `performDelete`). Edit-details form + save/preview/hydrate untouched.
- `tsc --noEmit` clean (cast `fontVariant` tuple in the styles object). Dead style keys from the removed cards left in the `styles` object (harmless object props).
### ⚠️ Brady checklist (gates `done`)
1. Profile: big 72pt lifetime-burn hero up top; no "This is your space." tagline; no daily-targets card (targets still on Today/Nutrition).
2. Trial reads as one quiet line ("N days · X/10 scans today"); admin/ended variants correct.
3. AI section shows honest scan stats + the accuracy caveat; "How scanning works" opens the info screen.
4. Account is a grouped settings list; Delete account is a red destructive row and still confirms before deleting; Sign out works.
5. Edit-your-details still expands, previews, and saves (recompute targets) unchanged.
### File List
- `mobile/app/(tabs)/profile.tsx` (modified)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous). Status → review.
