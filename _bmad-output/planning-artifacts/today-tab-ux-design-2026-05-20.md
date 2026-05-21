# Today Tab UX Design — Pacing Instrument

**Module:** BMad Method · `bmad-create-ux-design` (CU)
**Date:** 2026-05-20
**Preceded by:** [today-tab-brainstorm-2026-05-20.md](today-tab-brainstorm-2026-05-20.md)
**Designer:** Claude (acting Sally — UX)

---

## 1. Design thesis

The Today tab becomes a **single-glance pacing instrument**. No words carry pace state — only geometry and tone. Three visual layers do the entire job:

1. **Ring fill** — *what you've consumed*
2. **Gap arc** — *the distance between where you are and where you should be*
3. **Ring tonal shift** — *which side of pace you're on*

Words on the screen go back to being navigational (Next Action, eyebrow greeting, equation row, meal labels). Pace-state language is **removed** — the instrument speaks geometrically. This is the brand voice ("calm, direct, navigational") taken to its conclusion.

---

## 2. Anatomy of the hero

```
            ┌───────────────────┐
            │   TodayHeader     │     ← time-of-day greeting only,
            │   "Good evening." │       no pace copy
            └───────────────────┘

                ─ ─ ─ ─ ─ ─ ─         ← ring track (border, dim)
              ╱                 ╲
            ╱   ███████░░░       ╲    ← ring fill (consumed, star/starDim)
           │   ████████▒▒▒        │   ← gap arc (warm or cool, 25% α)
           │                      │
           │       1,240          │   ← hero number (textPrimary, never tinted)
           │     cal left         │   ← hero label (textSecondary)
           │                      │
            ╲                    ╱
              ╲                ╱
                ─ ─ ─ ─ ─ ─ ─

            1,240 in · 280 burned · 1,240 left    ← equation row, all three cells
```

**Three rendered ring layers (in z-order, back to front):**

| Layer | Element | Color | Notes |
|---|---|---|---|
| 1 | Track | `colors.border` (#26262F) | Full circle, always present. |
| 2 | Gap arc | `paceWarmGap` or `paceCoolGap` (25% α) | Only present when |fill − pace| > 5%. See §5. |
| 3 | Fill | `colors.star` (default) / `colors.starDim` (when ahead) / `colors.error` (when over) | The consumed-vs-target stroke. |

Layer ordering matters: the gap arc sits **between** the track and the fill so the fill always reads as the foreground statement.

---

## 3. The four pace states (geometry only)

Let `f` = consumed / effective_target (0.0–∞), `p` = pace position (0.0–1.0), `δ` = `f − p`.

| State | Condition | Fill color | Gap arc | Hero number color |
|---|---|---|---|---|
| **On pace** | `\|δ\| ≤ 0.05` | `colors.star` | none | `colors.textPrimary` |
| **Behind pace** | `δ < −0.05` and `f < 1.0` | `colors.star` | warm, from `f` → `p` | `colors.textPrimary` |
| **Ahead of pace** | `δ > 0.05` and `f ≤ 1.0` | `colors.starDim` | cool, from `p` → `f` | `colors.textPrimary` |
| **Over target** | `f > 1.0` | `colors.error` (existing overLen behavior) | none | `colors.error` |

**On the "behind pace" gap arc:** rendered from the *current fill endpoint* (clockwise from 12 o'clock) to the *pace position*. It visually says "this empty stretch is where you'd be if you were on pace."

**On the "ahead of pace" gap arc:** rendered from the *pace position* to the *current fill endpoint*. It says "this filled-past stretch is how far ahead you are."

**The 5% threshold** prevents jitter near the pace mark. Roughly ±100 cal on a 2,000 cal target — comfortably inside meal-by-meal noise.

**Why "ahead" desaturates the fill but doesn't redden it:** ahead of pace is not an error — it's a heads-up. Going from `#FFFFFF` to `#C9CCD6` is a quiet, ~10% perceptual luminance drop. The user sees the change without it screaming.

---

## 4. New color tokens

Add to [mobile/theme/colors.ts](../../mobile/theme/colors.ts):

```ts
paceWarmGap: "rgba(251, 191, 36, 0.25)",  // amber, "room to eat" — distinct from spark blue ("burned") and warning yellow
paceCoolGap: "rgba(201, 204, 214, 0.25)", // starDim @ 25% — quiet ease-off signal, no alarm
```

**Color reasoning:**
- `paceWarmGap` is not `colors.warning` (#FBBF24 at 100%) — that's a notification color, too loud. The same hue at 25% alpha reads as inviting warmth, not alarm.
- `paceCoolGap` deliberately reuses `starDim` to keep the cool side in the same value family as the ring itself — pulls the ring inward rather than introducing a new hue (the way `colors.spark` would). This avoids visually clashing with the equation row's "burned" cell which already uses `spark`.

No new ring-fill colors — `star` / `starDim` / `error` already cover the four states.

---

## 5. Pacing curve (default)

Pace position is a **piecewise-linear function of local time**, not a clock-fraction-of-24. Curve:

```
Hour        0  6  7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23
% target    0  0  0  10  15  20  30  40  50  58  64  68  72  75  80  88  94  98  100
```

Visualized:

```
100% │                                       ╭────────
     │                              ╭────────╯
     │                     ╭────────╯
     │            ╭────────╯
     │   ╭────────╯
  0% │───╯
     └───────────────────────────────────────────────
       6am   9am   12pm   3pm   6pm   9pm   12am
```

**Properties:**
- Outside eating window (00:00–07:00): pace = 0, gap arc never drawn.
- Late evening (22:00–24:00): pace = 1.0, gap arc never drawn (you're past the window).
- Slight front-load: breakfast + lunch carry ~50% by 1pm.
- Dinner taper: ~75% by 6pm, last ~25% spread over 6pm–10pm.

**Implementation:** a `const PACE_CURVE: Array<[hour, fraction]>` table + linear interpolation between adjacent points. Pure function. No flags needed.

**Out of scope for v1:** user-configurable curve, weekend variants, time-zone awareness beyond the device clock.

---

## 6. Animation

Two animation classes. All easings: `Easing.out(Easing.cubic)` unless noted.

### 6.1 Mount-settle (on screen mount or pull-to-refresh)

```
t=0ms      ──  ring stroke at length 0, gap arc at α=0
t=0–400ms  ──  ring fill stroke length grows 0 → f · circ
t=200ms    ──  gap arc begins to fade in (200ms ease-in, target α=0.25)
t=400ms    ──  all elements at rest
```

The hero number does **not** count up — it renders at its final value immediately. Number animation feels gimmicky on a calm screen.

### 6.2 Data-change reaction (meal logged or workout finished)

Triggered when `today` updates (new meal in list, or `burned_calories` changes).

```
t=0ms      ──  ring fill at prev length, prev gap arc visible
t=0–300ms  ──  ring fill length tweens prev → new
t=0–200ms  ──  gap arc length + color crossfade to new state
t=300ms    ──  at rest
```

If the **state crosses a threshold** (e.g. behind → on, or ahead → over):
- Fill color crossfades 200ms during the same window
- Old gap arc fades out as new arc fades in (no popping)

The hero number ticks instantly to the new value — no counting animation. Lets the eye lock on the geometry change.

### 6.3 What does NOT animate

- **No idle / drift animation.** Tick does not slide minute-by-minute while the screen sits open. This was considered and rejected — the user pulls Today many times; mount-settle handles freshness.
- **No celebration on hitting target.** §2 scope guard.
- **No haptic on state change.** Subtle visual is the language.

### 6.4 Performance budget

- All animations driven by `react-native-reanimated` shared values, no JS-thread tweens.
- Total mount animation cost: 1 ring stroke length + 1 arc opacity + 1 arc length tween. <16ms per frame at 60fps on Pixel 4a-class. Headroom is fine.

---

## 7. Cascading hero changes

### 7.1 TodayHeader — pace copy removed

[mobile/components/today/TodayHeader.tsx](../../mobile/components/today/TodayHeader.tsx) reverts to a pure time-of-day greeting. No pace sentence. No status word. Examples:

- 05:00–11:59 → "Good morning."
- 12:00–17:59 → "Good afternoon."
- 18:00–22:59 → "Good evening."
- 23:00–04:59 → "Late." *(neutral, not corrective)*

When `profile == null` (onboarding incomplete): "Find your North."

### 7.2 Hero number — no tonal shift

The big number stays `colors.textPrimary` in all pace states. Goes `colors.error` only when `remaining_calories < 0` (existing behavior, preserved).

Reasoning: the gap arc and ring shift carry pace state. Adding number tint would triple-encode the signal and read as cluttered.

### 7.3 Equation row — kept verbatim

`1,240 in · 280 burned · 1,240 left` — kept all three cells per user decision. The "left" cell duplicates the hero number; this is deliberate redundancy for users who want the explicit math.

The middle cell ("burned") stays `colors.spark` blue when > 0 — unchanged from current implementation. This is now the only place blue appears on the hero, anchoring "burned = activity" in a single color slot.

### 7.4 Hero number "calories left" → "calories" when over

Today: shows "calories over" when `remaining < 0`. Keep this.

But also: when the hero hits exactly `remaining = 0`, the label currently still says "calories left" with value 0. Edge case — a "0 calories left" reading is misleading (it implies you have 0 to spend, which is true, but feels alarming for what is actually a perfect day). Consider showing "—" or "at target" when `|remaining| ≤ 5`. **Defer to implementation.**

---

## 8. Empty state — first open, no target, before window

Three empty-state scenarios. The ring + arc system handles all three quietly.

| Scenario | Ring fill | Pace arc | Hero number | Eyebrow |
|---|---|---|---|---|
| No profile yet | 0% | none | (current copy: "Find your North — finish onboarding…") | hidden |
| Profile set, no meals, pre-window (5am) | 0% | none (pace = 0) | `[target]` cal in muted color | "Late." or "Good morning." |
| Profile set, no meals, mid-window (2pm) | 0% | warm arc from 0 to 50% pace | `[target]` cal | "Good afternoon." |
| Profile set, no meals, post-window (11pm) | 0% | none (pace = 1.0, you missed it) | `[target]` cal | "Late." |

The mid-window empty state with a warm pacing arc is the design's quiet pull: a brand-new user who opens the app at 2pm without logging will see a 50% warm arc curving away from zero. That arc is the entire "you should be eating" signal — no banner, no nag.

---

## 9. Pull-to-refresh feel

- Skeleton replaces the spinner: ring at `colors.border`, hero number as a dim placeholder block, equation row as 3 dim placeholder pills. Renders instantly while fetch is in flight.
- On fetch settle: skeleton crossfades to real data (200ms), then mount-settle animation kicks in (400ms).
- One light haptic (`Haptics.ImpactFeedbackStyle.Light`) on successful refresh completion. **Cheap, optional — implementation can defer.**
- No haptic on data-change animations (meal logged etc.) — those don't originate from the Today tab itself.

---

## 10. Below the hero — cascading changes

The brainstorm flagged changes throughout the screen. The pace tick is the lead; these follow.

### 10.1 NextActionButton — pace-aware label
Existing state machine in [mobile/lib/nextAction.ts](../../mobile/lib/nextAction.ts) gains pace state as input. New labels:

| Pace state + activity | Label |
|---|---|
| Behind, no workout pending | "Log a meal" |
| Behind, workout scheduled today | "Start [Routine]" *(workout brings burn → grows headroom)* |
| On pace, workout scheduled | "Start [Routine]" |
| Ahead of pace, workout scheduled | "Start [Routine]" *(eases off the ahead state)* |
| Ahead of pace, no workout | "Move" *(soft suggestion to add activity)* |
| Over target | "Move" |
| Post-window, on pace | "Plan tomorrow" *(opens nutrition history)* — **optional, defer** |

The "Move" label is new and brushes §2 (could be read as nudgy). Confirm before shipping.

### 10.2 TodayTrioCards — keep as macros
Stay as protein / carbs / fat. Don't replicate the equation row's in/burned/net inside the trio. **Verify current implementation** before deciding final hierarchy.

### 10.3 Sparkline — pace line overlay
Add a faint horizontal line at the daily target on [CalorieSparkline.tsx](../../mobile/components/today/CalorieSparkline.tsx). Color: `colors.textMuted` at 30% α. Today's bar shaded with a subtle different fill (e.g. striped or a slightly different alpha) to mark "in progress."

### 10.4 Meals list — reverse-chronological
Most recent meal on top. Reasoning: a 6×-per-day user opens Today after logging — the meal they just added should be the first card.

### 10.5 Compact meals (3+ meals)
When 3 or more meals logged, switch each MealCard to a single-line summary (thumbnail · name · time · cal) with the existing full card available on tap. **Defer to implementation — design-only sketch.**

### 10.6 Workout card "quiet state" — DEFERRED
Brainstorm flagged a "rest day" / "next: push day Wednesday" state for when there's no active/scheduled/completed workout today. This brushes §2 ("inserts activity into a calm screen"). **Confirm with user before adding.**

---

## 11. What stays exactly the same

Anchoring decisions, not up for revision in this UX pass:

- 24px screen padding, max content width 400.
- IntakeRing stroke width: `Math.max(6, round(size * 0.09))` — already calibrated.
- Hero ring size: 200px on Today (current value).
- Hero number: `fontSize: 52, fontWeight: "800", letterSpacing: -1`.
- Voice: calm, direct, navigational. No emojis, no exclamation marks.
- Numbers: cal nearest 5, macros nearest gram.
- Tab haptics: only on refresh completion (if added).

---

## 12. Open questions for the planning phase (CC)

These don't block the UX design but need decisions in the Correct Course step:

1. **Server- vs. client-side pace computation.** Pure function, can run either side. Server-side enables widget parity (Phase 2). Suggest: add `pace_position` to the `/today/` response now, even though v1 of the in-app screen could compute locally. Forward compat.
2. **Edge: workout finishes mid-screen.** When burn jumps from 0 → 280, `effective_target` jumps, and *both* the fill ratio and the pace position move (fill drops, pace stays). Confirm the animation runs cleanly — both layers tween in lockstep.
3. **"Move" label in NextActionButton (§10.1).** Brushes §2 scope guard. User confirmation needed.
4. **Workout card quiet state (§10.6).** Same — confirm before implementation.
5. **"0 calories left" copy edge (§7.4).** Implementation detail; design suggests "at target."

---

## 13. Hand-off checklist for the dev story

When this lands in [bmad-create-story](../implementation-artifacts/), the story should cover:

- [ ] `mobile/lib/pace.ts` — `computePaceTick(now, target, burned)` pure function + `PACE_CURVE` const
- [ ] `mobile/theme/colors.ts` — add `paceWarmGap` and `paceCoolGap` tokens
- [ ] [IntakeRing.tsx](../../mobile/components/IntakeRing.tsx) — accept `paceMark?: number` (0.0–1.0), draw gap arc in the right z-order, apply ring tonal shift when ahead
- [ ] [IntakeRing.tsx](../../mobile/components/IntakeRing.tsx) — react-native-reanimated mount-settle + data-change animations
- [ ] [TodayHeader.tsx](../../mobile/components/today/TodayHeader.tsx) — strip pace copy, time-of-day greeting only
- [ ] [TodayDashboard.tsx](../../mobile/components/TodayDashboard.tsx) — pipe pace state to ring; pass `effective_target = target + burned`; keep equation row all-three-cells
- [ ] [nextAction.ts](../../mobile/lib/nextAction.ts) — accept pace state as input, new label mapping
- [ ] [CalorieSparkline.tsx](../../mobile/components/today/CalorieSparkline.tsx) — target line overlay, today-bar fill variant
- [ ] [(tabs)/index.tsx](../../mobile/app/(tabs)/index.tsx) — skeleton state during fetch, optional success haptic
- [ ] (Optional) [backend/app/services/today.py](../../backend/app/services/today.py) + [schemas.py](../../backend/app/models/schemas.py) — `pace_position` field on response, for widget parity
- [ ] (Optional) [backend/tests/test_today.py](../../backend/tests/test_today.py) — pace_position test at 3 representative timestamps
- [ ] Meals list reverse-chronological sort

**Phase 2 (widgets):** the widget's lead visual is now the pace tick, not "calories left." Sub-spec deferred to Phase 2 stories.
