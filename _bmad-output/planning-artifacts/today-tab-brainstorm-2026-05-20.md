# Today Tab Brainstorm — 2026-05-20

**Module:** BMad Method · `bmad-brainstorming` (BSP)
**Scope:** YourStrat mobile app, Today tab (post-Phase 1)
**Facilitator:** Claude (acting Analyst)
**Stakeholder:** Brady (sole product owner + engineer)

---

## 1. Diagnosis

Phase 1 of the Today screen redesign shipped — new hero (ring + big number + equation), `NextActionButton`, `WorkoutCard`, `TodayTrioCards`, 7-day `CalorieSparkline`, deep-link to scheduled routines. Components live in [mobile/components/today/](../../mobile/components/today/).

The screen typechecks, ships, and reads cleanly. But the **stated symptom is not visual** — it's behavioral.

> "Not enough — I want it to be 6+ pulls per day."

The Today tab is not pull-worthy yet. The polish pass alone won't fix that. The screen is missing a reason to come back between meals.

---

## 2. The core job-to-be-done

When the user pulls the Today tab the 4th time in a day (mid-afternoon, between meals), the one thing they want in under 2 seconds is:

> **On-track confidence.** A single visual cue — color, position on ring — that says *on pace / behind / ahead* without reading numbers.

The current screen answers *"how many calories are left?"*. It does **not** answer *"am I tracking right **for this hour of the day**?"* — and that gap is the gap.

A "1,240 calories left" reading is great at 9am, alarming at 8pm. Same number, opposite signal. The hero gives no time-of-day context.

---

## 3. The chosen mental model: Pace tick on the ring

```
         ─────
     ╱           ╲
    /     1,240    \
   |    cal left    |
   |•  ← pace tick  |     ← second mark on the ring at "where you should be by now"
    \               /
     ╲           ╱
         ─────
```

A second mark on the calorie intake ring at the *expected consumption position* for the current hour. Read in one glance:

- Fill **past the tick** → ahead of pace (consumed more than expected for this hour)
- Fill **before the tick** → behind pace (room to eat, or moderating)
- Fill **at the tick** → on pace

Quiet. Geometric. No language. No traffic-light feel. No nag.

### Pacing curve
Pace is **not linear** — most users don't eat 1/24th of their daily target per hour. A reasonable v1 default:
- 7am–10pm = the eating window (15 hours)
- Slight front-load (breakfast + lunch represent a larger fraction)
- Suggested curve to start: 0% by 7am · 20% by 10am · 50% by 1pm · 75% by 6pm · 100% by 10pm
- Outside the window: tick stays at the boundary (0% before 7am, 100% after 10pm)

This is a v1 default — should be configurable later if it doesn't fit. **Out of scope to make user-configurable now.**

### Edge cases
- Empty target (no profile yet) → no tick, no pace logic
- User just woke up at 11am → tick already at 20%, hero still shows nearly-full ring → "behind pace, eat"
- User logs nothing all day, opens at 9pm → tick at ~90%, ring empty → strong visual "you forgot to eat" without saying it
- Burn (exercise) raises the target — tick should compute against the **adjusted** target (`target + burned`)

---

## 4. Cross-cutting principles for the redesign

These follow from the diagnosis and govern every zone-level decision in §5.

1. **Glanceable beats accurate.** A user pulling 6×/day needs <2s reads. Tight numbers belong on the metric detail screens.
2. **Time-of-day awareness everywhere.** The hero pace tick is the lead, but eyebrow copy, Next Action, and even the empty state should change with the clock.
3. **Geometry, not language.** Visual cues (tick position, color tone, fill state) carry the signal. Words are backup, not primary.
4. **Scope guard intact.** No streaks. No badges. No push. No AI commentary. The pacing instrument is a *measurement*, not a *nudge*. (See [YOURSTRAT_BUILD.md §2](../../YOURSTRAT_BUILD.md).)
5. **Workouts are a peer of meals.** Already partly done in Phase 1 — keep extending: today's burn affects the pace tick (because target grows), and the workout card needs first-class real estate, not a footer.

---

## 5. Zone-by-zone findings

### 5.1 Hero zone (ring + big number + trio cards)

**Status:** functioning but information-flat. The biggest number is calories remaining, the ring is consumed/target. Nothing on the screen tells the user whether *this snapshot* is good or bad.

**Findings:**
- **H1. Pace tick.** Add a second mark on the existing ring at the time-of-day expected fill. Lead change. Affects all other hero copy. (See §3.)
- **H2. Hero color follows pace state, not absolute over/under.** Currently the big number turns `colors.error` red only when remaining < 0. Soft tonal shift earlier — when "ahead of pace" — gives the user a heads-up before they're actually over. Subtle, not a traffic light.
- **H3. Status eyebrow.** Replace or augment the static `TodayHeader` greeting with a one-line pace sentence: *"On pace."* / *"~320 under for this hour."* / *"~180 ahead — ease off."*  Single sentence, calm voice. Becomes the literal "on-track confidence" sentence the user asked for.
- **H4. Equation row is doing two jobs.** "1,240 in · 280 burned · 1,240 left" duplicates the big number ("left") and competes with the trio cards below. Consider dropping the "left" cell from the equation row since the hero number already says it. Or drop the equation row entirely and absorb its info into the trio (in / burned / net).
- **H5. Trio card hierarchy.** Need to inspect what the trio currently shows (protein/carb/fat? or in/burned/net?). If macros — re-evaluate whether macros belong at hero level, since the user's stated job is calories, not macros. Macros could move down or behind a tap.

### 5.2 Action zone (Next Action button + workouts)

**Status:** state-aware label exists and works; surfacing of active/scheduled/completed sessions exists. But the action zone is **one button + one optional card** — light for a screen aiming at 6× daily pulls.

**Findings:**
- **A1. Next Action label needs pace awareness.** Right now it routes based on intake state. With the pace tick in place, the button label should incorporate "behind pace → 'Log a meal'", "ahead → 'Move' (link to workout)" etc. The button is the *resolution* of the pace tick, not a separate signal.
- **A2. Workout card placement.** Currently shows when active/scheduled/completed today. When there's no workout activity, the slot is empty. Consider a quieter "rest day" or "next: push day on Wednesday" state so the slot has consistent presence — not silent. (Edge of §2 scope guard — check before adding.)
- **A3. Deep-link "Start [Routine]" stays.** Confirmed approved. Keep.
- **A4. Re-entry friction.** When user finishes a meal scan and returns to Today, the screen should *visibly* register the change (animated ring fill, brief tick re-position) so the act of returning to Today feels like progress, not refresh. Animation must respect §2 (no celebration, no confetti — just the geometry settling).

### 5.3 Data / history (sparkline + meals list)

**Status:** sparkline shows 7 days when ≥2 days of data exist. Meals list is below.

**Findings:**
- **D1. Sparkline could carry a pace line.** A faint horizontal line at the daily target gives the day-over-day chart context. Today's bar shaded differently (still in progress). Already-approved 7-day cap in §2.
- **D2. Meals list density.** Currently each meal is a `MealCard`. For a 6×/day pull screen, the meals stack pushes the hero further out of view as the day progresses. Consider a compact mode for 3+ meals (one-line summary with thumbnail) and expand-on-tap.
- **D3. Today's burn(s).** Workouts that contributed to today's burned calories aren't represented in the meals list (they shouldn't be) and currently appear only in the workout card and the equation row. Could a unified "today's events" list (meals + workouts, time-ordered) replace the meals-only list? Probably yes, and that strengthens "workouts as peer of meals."
- **D4. Meals list ordering.** Verify current ordering (chronological vs. reverse). Reverse-chronological (most recent on top) is more useful for 6×/day pulls.

### 5.4 Polish (copy, spacing, empty state, loading)

**Status:** functional. Voice is largely on-brand per the YOURSTRAT_BUILD.md constraints.

**Findings:**
- **P1. Empty-state pull on first open.** When a brand-new user lands with zero meals and zero workouts, the screen reads as setup-incomplete or empty. The pace tick + status sentence *naturally* fills this gap ("Day's just starting. Find your North.") — making the empty state feel intentional, not unfinished.
- **P2. Loading feel.** [(tabs)/index.tsx](../../mobile/app/(tabs)/index.tsx) uses `Promise.allSettled` to fan out three calls (`getToday`, `listRoutines`, `getNutritionJournal(7)`). Verify pull-to-refresh visibly settles all three. Verify no layout shift when sparkline late-arrives.
- **P3. Skeleton vs. spinner.** A skeleton of the hero ring + number while loading is more "alive" than a spinner. Cheap.
- **P4. Typography weight on the hero.** `fontSize: 52, fontWeight: "800", letterSpacing: -1` — verify this reads well on small Android devices (Pixel 4a class). The high-contrast big number is the brand's center of gravity.
- **P5. Page padding consistency.** Confirm 24px screen padding per [CLAUDE.md](../../CLAUDE.md) is uniform — TodayDashboard uses `CONTENT_MAX_WIDTH = 400` and centers, but doesn't set horizontal padding directly. Worth a visual sweep on narrow devices.
- **P6. Tab haptic on pull-to-refresh.** Tiny — but a single light haptic when the refresh completes makes the act of pulling Today *feel* like checking in.

---

## 6. Out of scope (parked or rejected)

These came up in the conceptual space but are blocked by §2 or by the user's stated allergies:

- **Per-meal AI commentary** ("nice protein hit") — banned.
- **Streaks** (consecutive on-pace days) — banned.
- **Pacing nudges via push notification** — banned.
- **Celebration animation when hitting target** — banned.
- **Multi-week pacing history** — banned (7-day cap on sparkline).
- **Macro pace ticks (protein-pace, carb-pace)** — out of scope for v1; calorie-pace only. Could revisit after measurement.
- **User-configurable eating-window curve** — out of scope for v1; ship a sane default.

---

## 7. Implementation surface (preview, not committed)

This is a **sketch**, not the implementation plan. The next BMad step (CC — Correct Course) will turn this into a concrete amendment to [the existing plan file](../../../.claude/plans/1-open-for-revision-jiggly-river.md).

**Backend** — likely no schema change needed. The pace curve is a pure function of `(target, burned, current_hour)` and can run client-side. If a server-side computation is preferred for widget parity, add a `pace_position` (0.0–1.0) field to the `/today/` response. ([backend/app/services/today.py](../../backend/app/services/today.py))

**Mobile — new logic:**
- `mobile/lib/pace.ts` — `computePaceTick(now: Date, target: number, burned: number): { fraction: number; state: "ahead" | "on" | "behind" }`
- Default curve as a const, swap-able later.

**Mobile — component changes:**
- [IntakeRing.tsx](../../mobile/components/IntakeRing.tsx) — accept optional `paceMark` prop (0.0–1.0). Draw a small notch/dot on the ring at that fraction. Color follows state.
- [TodayHeader.tsx](../../mobile/components/today/TodayHeader.tsx) — replace static greeting with pace status sentence (computed from same `pace.ts`). Falls back to a calm "find your North" line when no target / before eating window.
- [TodayDashboard.tsx](../../mobile/components/TodayDashboard.tsx) — pipe `paceMark` to the ring; consider dropping the redundant "left" cell from the equation row.
- [NextActionButton.tsx](../../mobile/components/today/NextActionButton.tsx) — `pickNextAction` in [nextAction.ts](../../mobile/lib/nextAction.ts) gains pace state as input.
- Polish: skeleton state for hero, reverse-chronological meals, optional unified "today's events" list.

**Widget impact (Phase 2):**
- The pace tick is the entire reason a small widget exists. Widget should show: big number + tick + (optional) one-word state. Adds urgency to Phase 2 of the existing plan.

---

## 8. Recommended next BMad step

**CC — Correct Course.** The existing plan file ([1-open-for-revision-jiggly-river.md](../../../.claude/plans/1-open-for-revision-jiggly-river.md)) is mid-stream — Phase 1 shipped, Phase 2 (widgets) queued. The findings here reframe both phases:
- Phase 1 gains a follow-up sub-phase ("1b: pacing instrument")
- Phase 2 widgets gain the pace tick as their lead visual

Folding into the existing plan keeps continuity with Phase 1's shipped components and avoids orphaning the widget work.

**Alternative:** **CU — Create UX** before CC, to deep-dive the visual design of the pace tick (notch shape, animation on tick movement, color tokens, status-sentence copy variants). Worth doing if the user wants the UX language nailed before code lands.

---

## 9. Appendix: signals collected

- **Pull frequency:** "Not enough — I want it to be 6+" → screen must be glanceable.
- **4th-pull info need:** "On-track confidence" → time-of-day-aware pace cue is the lead.
- **Mental model:** "Pace tick on the ring" → geometric, quiet, no language.
- **Weak zones flagged:** all four (hero, action, data, polish) — holistic refresh, not surgical.
- **Voice / scope:** unchanged from [CLAUDE.md](../../CLAUDE.md) and [YOURSTRAT_BUILD.md §2](../../YOURSTRAT_BUILD.md).
