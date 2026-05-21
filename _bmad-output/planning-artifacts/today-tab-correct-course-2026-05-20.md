# Today Tab — Course Correction

**Module:** BMad Method · `bmad-correct-course` (CC)
**Date:** 2026-05-20
**Preceded by:**
- [today-tab-brainstorm-2026-05-20.md](today-tab-brainstorm-2026-05-20.md) — diagnosis
- [today-tab-ux-design-2026-05-20.md](today-tab-ux-design-2026-05-20.md) — design spec

**Target plan amended:** `~/.claude/plans/1-open-for-revision-jiggly-river.md`

---

## 1. Why a course correction

Phase 1 of the Today screen redesign shipped. The user verified the screen typechecks and reads cleanly — but raised the underlying behavioral issue: **the Today tab isn't pull-worthy enough yet.** Stated target: 6+ pulls per day. Current: well below that.

The brainstorm pinned the gap: the screen answers *"how many calories are left?"* but not *"am I tracking right **for this hour of the day**?"* — and that second question is what drives the 4th, 5th, 6th pull.

The UX pass committed to a fully geometric pacing instrument (gap arc + ring tonal shift, no pace-state language) as the lead change.

**This course correction folds Phase 1b — Pacing Instrument into the existing plan**, before Phase 2 widgets. Phase 2 also gets re-spec'd because the pace tick is the natural lead visual for a small widget.

---

## 2. Decisions resolved in this CC

The four open questions raised at the end of the UX artifact are now answered:

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Compute `pace_position` client-side, or also on `/today/` response? | **Both.** Add `pace_position: float` to the `/today/` response now. App still computes locally for snappy reactivity. | Forward-compat for Phase 2 widgets, which cannot run RN code. ~10 LOC backend, 1 new test. Cheap insurance. |
| 2 | NextActionButton "Move" label for ahead-of-pace + no-workout state? | **Cut it.** Button falls back to existing logic (likely `Log food`). | Brushes §2 (inserts activity prompt). The ring + arc carry the "ease off" signal geometrically — no need for a CTA prompting motion. |
| 3 | Workout card "quiet state" (e.g. `Next: push day Wednesday`) when no workout today? | **Don't add.** Slot stays empty. | Same §2 concern. Calm screens beat full screens. The hero does the pacing work without a populated workout slot. |
| 4 | Hero label when `\|remaining\| ≤ 5` (essentially at target)? | **"at target"** — hero number stays, label switches from "calories left" to "at target". | Brief, calm, accurate. Avoids the alarming "0 calories left" reading on what is actually a perfect day. |

All four resolve on the most disciplined option. Pattern: pacing instrument carries the meaning; words stay navigational.

---

## 3. What changes in the plan

### 3.1 Goals — augmented (additive)
- (NEW) **6. Today tab is pull-worthy 6+ times per day** via a glanceable pacing instrument.

### 3.2 Status — Phase 1 marked complete
All sections A–F in "Design — New Today Screen, Section by Section" and items 1–9 in "Implementation Order" are **shipped**. The amendment marks them ✅ in place rather than removing them.

### 3.3 New section: Phase 1b — Pacing Instrument
Inserted between section F (Meals refresh) and the Backend Changes section. Full content is in the UX artifact — the plan gets a condensed spec + sequenced implementation steps. The lead deliverables:

- **`mobile/lib/pace.ts`** — `computePaceTick(now, target, burned) → { fraction: number; state: "behind"|"on"|"ahead" }` + `PACE_CURVE` const table
- **`mobile/theme/colors.ts`** — new tokens `paceWarmGap`, `paceCoolGap`
- **`IntakeRing.tsx`** — accepts `paceMark?: number` (0.0–1.0), draws gap arc, applies ring tonal shift, mount-settle + data-change animations via `react-native-reanimated`
- **`TodayHeader.tsx`** — strip pace copy, time-of-day greeting only
- **`TodayDashboard.tsx`** — pipe pace state to ring, "at target" copy edge case, pass `effective_target = target + burned`
- **`nextAction.ts`** — accept pace state as input, refined label mapping (no "Move" label)
- **`CalorieSparkline.tsx`** — faint horizontal target line, today-bar fill variant
- **`(tabs)/index.tsx`** — skeleton state during fetch
- **Meals list** — reverse-chronological sort

### 3.4 Backend — incremental addition
Single new field on the `/today/` response:
- **`pace_position: float | null`** — 0.0–1.0, computed against the same `PACE_CURVE` curve from the local timezone hour. Null if `target == 0` or outside eating window.
- New test in `backend/tests/test_today.py` — pace_position at 3 representative timestamps (pre-window 5am, mid-window 1pm, post-window 11pm).

### 3.5 Widgets (Phase 2) — re-spec'd
The widget's lead visual is now the **pace tick**, not "calories left." Updates to the existing widget plan:

- **Snapshot shape** gains `pace_position: float | null`. New field is forward-additive — server already returns it.
- **Small widget** — calorie number stays the lead text, but the surrounding ring shows the pace arc. (For lock-screen circular: tick position becomes the only visual cue, since text is constrained.)
- **Medium widget** — left half: ring + arc + number. Right half unchanged.
- All three widgets now reuse the same pace tokens (need to be expressible in SwiftUI / Kotlin — `rgba(251, 191, 36, 0.25)` and `rgba(201, 204, 214, 0.25)`).

### 3.6 "Deliberately NOT doing" — appended
Four new items, from the four resolved decisions:
- No "Move" CTA in the ahead-of-pace state — geometry carries the signal.
- No workout-card quiet state ("Next: push day Wednesday") — empty is intentional.
- No pace-state copy on the screen — no eyebrow sentence, no status word, no number tint on the hero.
- No idle drift animation — tick is static after mount-settle.

---

## 4. Sequenced implementation — Phase 1b inserted

Items 1–9 are shipped (Phase 1). Items 10–12 are Phase 2 widgets (re-spec'd). **New items 9a–9g land between them.**

| # | Item | Est | Status |
|---|---|---|---|
| 1–9 | Phase 1 (sections A–F, header, hero, trio, sparkline, etc.) | ~13 hr | ✅ shipped |
| **9a** | **Backend `/today/` extension: `pace_position` field + test** | ~30 min | new |
| **9b** | **`mobile/lib/pace.ts` pure function + curve const + unit tests** | ~45 min | new |
| **9c** | **`mobile/theme/colors.ts` — new `paceWarmGap`, `paceCoolGap` tokens** | ~10 min | new |
| **9d** | **`IntakeRing.tsx` — `paceMark` prop, gap arc render, ring tonal shift; no animation yet** | ~1.5 hr | new |
| **9e** | **`TodayDashboard.tsx` wiring + `TodayHeader.tsx` strip pace copy + "at target" edge + meals reverse-chronological + `nextAction.ts` pace-aware labels + `CalorieSparkline.tsx` target line** | ~2 hr | new |
| **9f** | **`react-native-reanimated` animations on `IntakeRing.tsx` — mount-settle + data-change reaction** | ~1.5 hr | new |
| **9g** | **Loading skeleton on `(tabs)/index.tsx`** | ~30 min | new |
| 10 | Widgets — iOS (now using pace_position) | ~2 days | re-spec'd |
| 11 | Widgets — Android (now using pace_position) | ~1.5 days | re-spec'd |
| 12 | EAS build + TestFlight + Android internal track smoke test | ~half day | unchanged |

**Phase 1b total:** ~6.75 hr in-app work. Drops into a single PR or two (9a–9d as one, 9e–9g as a second).

**Recommended PR split:**
- **PR-1 (Backend + ring foundation):** 9a + 9b + 9c + 9d. Ship the gap arc rendering with hardcoded inputs first; verify visually.
- **PR-2 (Wiring + animations + polish):** 9e + 9f + 9g. Wire to live data, add animations, ship the skeleton.

---

## 5. Verification — Phase 1b additions

End-to-end checks for the pacing instrument (added to the existing verification list):

**Hero / pace state:**
- [ ] At 10am with target 2,000 cal and 200 cal consumed: ring fill at 10%, pace arc warm-amber from 10% to 20% (pace_position ≈ 0.20), ring fill color is `star`, big number is `textPrimary`.
- [ ] At 1pm with same target and 1,100 cal consumed: ring fill at 55%, pace arc cool from 50% to 55%, ring fill color shifts to `starDim`, big number stays `textPrimary`.
- [ ] At 1pm with same target and exactly 1,000 cal consumed (on pace, within 5%): no pace arc visible, ring fill `star`, big number `textPrimary`.
- [ ] At 9pm with 2,005 cal consumed (over by 5): label reads "at target", hero number `textPrimary`, no error red yet.
- [ ] At 9pm with 2,100 cal consumed (over by 100): label reads "calories over", hero number + ring fill go `colors.error`, no pace arc (irrelevant when over).
- [ ] At 5am with 0 consumed: no pace arc (outside eating window), ring empty, label reads target normally.

**Animation:**
- [ ] Pull-to-refresh — ring stroke draws from 0 to current over ~400ms, gap arc fades in at ~200ms.
- [ ] Log a meal — ring fill tweens from prev to new (~300ms), gap arc length/color crossfades cleanly. No popping when crossing the 5% threshold.
- [ ] Finish a workout — target effectively grows, fill ratio drops, pace position recomputes. Both layers tween in lockstep without jank.
- [ ] No idle drift animation when sitting on the screen for a minute.

**Status copy / cascading:**
- [ ] TodayHeader shows only time-of-day greeting ("Good evening.") — never any pace-state words.
- [ ] NextActionButton in ahead-of-pace + no-workout state shows existing default (`Log food` or similar) — never "Move".
- [ ] Workout card slot is empty (not "Next: push day Wednesday") on days with no active/scheduled/completed routine.
- [ ] Meals list shows most recently logged meal at the top.
- [ ] Sparkline has a faint horizontal target line; today's bar is visually distinguished from prior days.

**Backend:**
- [ ] New test in `backend/tests/test_today.py` covers `pace_position` at 5am (null/0), 1pm (~0.50), 11pm (~1.0).
- [ ] Existing 27 tests still pass.

---

## 6. Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Gap arc reads as "the day is half over" instead of "you're behind/ahead" | Medium | UX artifact's geometry is unambiguous on close inspection; ship behind a TestFlight first. Have the user pull at 3+ distinct times of day on real device. |
| `react-native-reanimated` mount animation jank on low-end Android | Low | All animations use shared values on UI thread; budget headroom verified. Phase 1's screen already animates cleanly. |
| Server pace_position drifts from client pace_position due to timezone handling | Medium | Server uses request's `X-Timezone` header (already in `/today/` plumbing — verify) or falls back to user's stored profile timezone. Client computes from `new Date().getHours()` directly. Pick one source of truth: **server value wins when present, client computes only when offline.** |
| 5% on-pace threshold feels too lenient (or too strict) on real targets | Medium | Threshold is a single constant in `pace.ts`. Tunable in <5 min after user feedback. |

---

## 7. Out of scope (still)

The §2 Scope Guard rules are unchanged. Phase 1b does not introduce:
- Per-macro pace ticks (protein-pace, carb-pace).
- User-configurable eating-window curve.
- Pace-state push notifications or in-app nudges.
- Celebration on hitting target.
- Multi-day pace history (e.g. "you've been on pace 3 days in a row" — this is a streak by another name).
- Haptic feedback on pace-state changes.

---

## 8. Next BMad step

**SP — Sprint Planning** to break Phase 1b into the two PRs identified in §4, then **CS — Create Story** for the first PR. The plan is ready for implementation as soon as the user signs off on this CC.

If any of §2's four resolutions need revisiting, do that before sprint planning. Otherwise: proceed.
