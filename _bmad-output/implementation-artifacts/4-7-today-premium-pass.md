# Story 4.7: Today premium pass (T-M1, T-E1, T-M2, T-C2, T-A1)

Status: review

## Story

As a user,
I want Today to read like a finished instrument,
so that hierarchy is obvious and nothing is noisy (UX-DR8, 9, 15, 32, 33).

Premium pass on the Today surface. The **Pace Ring component (`IntakeRing`, 4.3–4.6) is untouched** — only the layout *around* it changes (the number moves out from the ring centre to a 96pt hero below it). 4.8's `TrialBanner` and the pace logic are untouched.

## Acceptance Criteria

1. **Hero kcal 96pt below the ring (T-M1).** Remaining-kcal renders at **96pt tabular, `allowFontScaling={false}`, below the ring**; the ring becomes a compact pace "crown" above it (keeps fill + paceMark + paceState).
2. **Taglines removed (T-E1).** The decorative time-of-day flourish on the header is removed (date stays).
3. **Sparkline whisper (T-M2).** The 7-day sparkline is a ~24pt inline whisper — faint dashed target line + a distinct today-point fill, minimal chrome.
4. **Compact expandable meal rows (T-C2).** Each meal is a compact single line — name · kcal · an 8pt P/C/F tri-bar — that **expands on tap** (items + full macros + an "Open" link to the meal detail for edit/delete). No photo thumbnail in the collapsed row.
5. **Meal springs in (T-A1).** A newly-logged meal animates into the list (~320ms, gentle easing) via a Reanimated entering animation, **respecting reduce-motion** (no force-play).
6. **Premium/theme/60fps.** Tokens only, no raw hex; 96pt number `tabular-nums`; meal rows memoized; expand is local state. `tsc` clean.
7. **Verification.** `tsc --noEmit` clean; runtime (hero hierarchy, sparkline whisper, expand, spring-in, reduce-motion) is Brady's device checklist.

## Design decisions (judgment calls — documented)

- **Hero composition (T-M1 ambiguous on the ring):** ring → compact crown (~132px, empty centre, pace preserved) with the **96pt remaining-kcal number below it**, then the existing in·burned·left equation row. The big number is the headline; the equation is the breakdown (mild redundancy, intentional — like 5.7's WeightHero). Tap still routes to the calories metric detail.
- **T-E1 "section-header taglines":** Today's only tagline-like flourish is the header's `· {timeOfDay}` tag — removed (the date line stays, it's information not flavour). If Brady meant something else, easy to revert.
- **T-C2 tap = expand (not navigate):** tapping toggles an inline expansion (items + macros); an **"Open" link inside the expanded panel** navigates to `/meal/[id]` (where 4-2 edit/delete lives), preserving that path.
- **T-A1 self-contained:** implemented as a per-row `entering` animation, so only the newly-mounted (new) meal animates on return from Scan — no cross-screen coordination. Reanimated entering respects OS reduce-motion by default (unlike the deliberately force-played micro-anims elsewhere).

## Tasks / Subtasks

- [x] **Task 1 — Header tagline (T-E1)** — `today/TodayHeader.tsx`: drop the `· {tag}` flourish; keep the date.
- [x] **Task 2 — Sparkline whisper (T-M2)** — `today/CalorieSparkline.tsx`: ~24–28px height, drop the label row, faint dashed target, emphasized today point.
- [x] **Task 3 — Meal row (T-C2 + T-A1)** — `MealCard.tsx`: compact single line (name · kcal · 8pt P/C/F tri-bar), local expand (items + macros + Open link), `entering` spring; `onOpen` prop for the detail nav.
- [x] **Task 4 — Hero recomposition (T-M1)** — `TodayDashboard.tsx`: ring crown + 96pt number below + equation row; wire MealCard `onOpen`.
- [x] **Task 5 — Verify** — `tsc --noEmit` clean; device checklist.

## Dev Notes
- Reuse `IntakeRing` (unchanged), `formatKcal`/`formatMacroGrams`, `colors`/`spacing`, Reanimated (`FadeInDown`). No new dep/component/token; no backend change. P/C/F tri-bar uses `total_protein_g`/`total_carbs_g`/`total_fat_g` (+ `protein`/`carbs`/`fat` color tokens).
- **v1 limits:** tri-bar is proportional to the meal's own P/C/F grams (not calorie-weighted); expand shows up to the meal's items; the hero stays tap-to-nutrition-detail.

### References
- [epics.md → Epic 4 / Story 4.7](../planning-artifacts/epics.md) (lines 934–952), UX-DR8/9/15/32/33; T-M1/T-E1/T-M2/T-C2/T-A1.
- `components/TodayDashboard.tsx`, `components/MealCard.tsx`, `components/today/{TodayHeader,CalorieSparkline}.tsx`, `components/IntakeRing.tsx` (unchanged), `lib/format.ts`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Debug Log References
- `tsc --noEmit` (mobile): clean (after a mid-build fix — see the MealRow note).

### Completion Notes List
- **T-M1:** `IntakeRing` shrunk to a 132px pace "crown" (component unchanged — still fill + paceMark + paceState); the remaining-kcal number moved out of the ring centre to a **96pt tabular `allowFontScaling={false}`** hero below it, then the existing in·burned·left equation row (all inside the same tap→nutrition Pressable).
- **T-E1:** dropped the header's `· {timeOfDay}` flourish (date kept).
- **T-M2:** `CalorieSparkline` → ~28px whisper: removed the "Last 7 days / avg" label row, fainter dashed target (`2,4`), thinner `starDim` line, distinct `spark` today-point; a11y label retains the avg.
- **T-C2 + T-A1:** new `components/today/MealRow.tsx` — compact single line (name · kcal · 8pt P/C/F tri-bar), tap toggles an inline expansion (items + macros + an "Open" link → `/meal/[id]`), and the row springs in via `FadeInDown.duration(320)` which **respects OS reduce-motion** (not force-played).
- **Key decision change during build:** the story planned to modify `MealCard`, but `MealCard` is shared by three **out-of-scope Nutrition screens** (`nutrition/day/[date]`, `MealSlotsList`, `NutritionPastDays`) that rely on `onPress`=navigate. Changing it would silently alter their tap behavior. So I **left `MealCard` untouched** and put the Today row in a dedicated `today/MealRow.tsx` (distinct surface + interaction — not duplication). `TodayDashboard` now renders `MealRow`.
- Tokens only (P/C/F use `protein`/`carbs`/`fat`); no new dep; no backend change.

### ⚠️ Brady on-device/preview checklist (gates `done`)
1. **Hero:** the remaining-kcal number is huge (96pt) below a compact ring crown; pace fill/mark still reads on the ring; "over" turns it red; tap → nutrition detail.
2. **Sparkline:** a quiet ~28px whisper (no label row), faint target line, cyan today dot; tap → nutrition.
3. **Meal rows:** single line with the P/C/F tri-bar; tap expands (items + macros + Open→detail); tap again collapses.
4. **Spring-in:** after logging via Scan and returning to Today, the new meal animates in; with OS reduce-motion ON it appears without motion. (If rows re-animate on *every* Today visit and that feels busy, the tab is unmounting on blur — gate with a first-appearance flag.)
5. **Tagline gone** from the header (date stays). Confirm the `· Evening` flourish is the right thing to have removed.

## Code Review (2026-05-24, self / 3-layer adversarial)
Reviewer: Claude Opus 4.7 (1M). Verdict: **code-complete + reviewed → `review`** (visual hierarchy/animation = device pass).
- **Blind Hunter:** pace-ring component untouched (only composition); MealRow keyed by `meal.id` so re-focus doesn't re-animate existing rows (only genuinely new meals); reverted MealCard keeps the 3 Nutrition callers compiling (tsc clean).
- **Edge Case Hunter:** zero-macro meal → tri-bar hidden; no items → expand shows just the macros line + Open; `over` hero uses `error`; reduce-motion handled by Reanimated default.
- **Acceptance Auditor:** T-M1/T-E1/T-M2/T-C2/T-A1 met at code level; visual/motion → checklist.

### File List
- `mobile/components/today/TodayHeader.tsx` (modified — T-E1)
- `mobile/components/today/CalorieSparkline.tsx` (modified — T-M2 whisper)
- `mobile/components/today/MealRow.tsx` (**new** — T-C2/T-A1 compact expandable spring row)
- `mobile/components/TodayDashboard.tsx` (modified — T-M1 hero recomposition + MealRow wiring)
- `mobile/components/MealCard.tsx` (**unchanged** — left intact for the Nutrition screens; see notes)

## Change Log
- **2026-05-24** — Drafted + implemented (autonomous, "build it all now, I verify"). Status → review.
