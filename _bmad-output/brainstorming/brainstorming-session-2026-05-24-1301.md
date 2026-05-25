---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'App-wide visual language for YourStrat — animation patterns, fun-but-premium feel, hero metric visualizations across Today/Nutrition/Scan/Workouts/Profile'
session_goals: 'A rework of the UI to make it easy for users, animated, polished, with visible-metric UI and connectivity throughout UI ↔ backend.'
selected_approach: 'ai-recommended'
techniques_used: ['Analogical Thinking + Cross-Pollination', 'SCAMPER Method (per-surface)', 'What If Scenarios', 'Reverse Brainstorming']
ideas_generated: 94
priority_picks: ['T-S1 Pace Ring', 'W-C2 Active session takes over Workouts tab']
vetoes: ['WI-1 persistent ambient kcal in tab bar — Brady veto: not on every tab']
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Brady J Bania
**Date:** 2026-05-24
**Total captured insights:** 94 (5 DNA Laws + 59 SCAMPER per-surface ideas + 12 What-Ifs + 18 Anti-Patterns)

---

## Session Overview

**Topic:** App-wide visual language for YourStrat — animation patterns, fun-but-premium feel, hero metric visualizations across Today / Nutrition / Scan / Workouts / Profile.

**Goals:** A rework of the UI to make it easy for users, animated, polished, with visible-metric UI and connectivity throughout UI ↔ backend.

**Rails (CLAUDE.md):** Premium feel, 60 FPS, one theme, every UI wired to real backend. Forbidden: streaks, social, confetti, AI commentary, push notifications, avatars, multi-model AI, paywall plumbing, graphs beyond 7-day sparkline.

**Surfaces confirmed:** `mobile/app/(tabs)/index.tsx` (Today), `nutrition.tsx`, `scan.tsx`, `workouts.tsx`, `profile.tsx`.

---

## Technique Selection

**Approach:** AI-Recommended Techniques — 3-phase flow.

- **Phase 1 — DNA Transfer:** Analogical Thinking + Cross-Pollination across Apple Health, Linear, Strong, Whoop, Things 3, Strava (sparkline only), Stripe Dashboard, Headspace/Calm.
- **Phase 2 — Surface-by-Surface Divergence:** SCAMPER (all 7 lenses) on Today / Nutrition / Scan / Workouts / Profile.
- **Phase 3 — Hero Metric Moments + Anti-Pattern Catalog:** What-If Scenarios + Reverse Brainstorming.

---

# Phase 1 — The 5 DNA Laws (Locked Compass)

References stolen from: Apple Health, Linear, Strong, Whoop, Things 3, Strava (sparkline-only), Stripe Dashboard, Headspace/Calm. Curated from 8 candidate traits to 5 muscular, non-overlapping laws.

### [LAW-1] Hero Law
One dominant number per surface, 56–72pt. Today = kcal-remaining (rendered as ring stack). Nutrition = total-kcal-today. Scan-result = scanned-meal kcal. Workouts = current-set weight / workout-total volume. Profile = current weight or weekly progress delta. *No surface is ambiguous about its purpose in 0.5 seconds.*

### [LAW-2] Numeric Law
Every digit uses `fontVariant: ['tabular-nums']`, weight 600. Digits never jitter when values change. Workouts surface uses this maximally — full spreadsheet-grade table, zero gauges or progress bars decorating numbers. *Numbers ARE the typeface signature of YourStrat.*

### [LAW-3] Motion Law
Motion only fires on meaning change. **Three approved animations:**
1. **State-flip spring** (Linear) — 300ms on real state change.
2. **Completion micro-tap** (Things 3) — 200ms strike/lock on action commit.
3. **Digit-cycle tally** — summary numbers count up via digit cycling, not fade-in.

Curve: `cubic-bezier(.32, .72, 0, 1)` (Headspace). Steady state = dead-still. **No ambient/decorative motion. Ever.**

### [LAW-4] Density Law
Hierarchy by weight (700 / 600 / 400) and vertical rhythm (16 / 24 / 32px), not by boxes. No nested cards. No row dividers if fewer than 4 rows. No "box-in-a-box."

### [LAW-5] Sparkline Law
7-day sparklines as quiet trend whispers next to hero numbers. 36pt wide, single line, no axes / labels / tooltips. Always secondary chrome.

**The DNA Test (Phase 2 + Phase 3 Filter):** Any idea must pass at least one:
- ✅ Hero-able (LAW-1)
- ✅ Number-honest (LAW-2)
- ✅ Motion-meaningful (LAW-3)
- ✅ Subtractive (removes noise, doesn't add)

---

# Phase 2 — SCAMPER Per-Surface Idea Pool (59 ideas)

> Format per idea: `[ID]` mnemonic title, concept, novelty, DNA tag(s). Wiring notes appended where backend changes surface.

## SURFACE 1: TODAY

*`mobile/app/(tabs)/index.tsx` → `TodayDashboard.tsx`. Ring hero (200pt), meals list, sparkline, trio cards, next-action button.*

**[T-S1] Ring Becomes "Pace"** (LAW-1, LAW-3) ⭐ *Priority pick*
> Outer ring shows ahead/behind-pace vs. even-day expectation. Subtle green band if ahead, warning band if behind. Same data, different signal: "am I on track *right now*."
> *Wiring:* needs `target_pace_kcal_now` derived field in `backend/app/routers/today.py`.

**[T-S2] Hero Verb Swap** (LAW-1, LAW-2)
> Hero label flips from "calories left" → imperative verb-state: **"Eat 412"** / **"Wait"** / **"Done"**. Three discrete states.

**[T-C1] Ring × Workout Status** (LAW-1)
> Inner ring of IntakeRing becomes workout-completion ring. One-glance: "am I fed + lifted?"
> *Wiring:* `today.py` needs `workout_completion_today` boolean.

**[T-C2] Meal Row × Macro Bar** (LAW-2, LAW-4)
> MealCard collapses to a single horizontal row: name | kcal (tabular) | 8pt P/C/F tri-bar. Tap to expand.

**[T-A1] Linear Issue-Move Animation on Meal Log** (LAW-3)
> Returning to Today after logging via Scan: new meal springs into list with Linear-style issue-move animation. 320ms, Headspace easing.

**[T-A2] Whoop-Style Day Score Strip** (LAW-1, LAW-5)
> Below the ring: horizontal strip with 3 mini-metrics in Whoop secondary-stack style (tiny label, big tabular number, sparkline below each). Replaces `TodayTrioCards`.

**[T-M1] Hero Goes to 96pt** (LAW-1, LAW-2)
> "calories left" number separates from ring — 96pt tabular below. Ring = progress (visual). Number = magnitude (data).

**[T-M2] Sparkline Minify to "Pulse"** (LAW-5)
> CalorieSparkline shrinks to 24pt inline whisper beside hero. No longer a section block.

**[T-P1] Ring as "Tomorrow's Plan"** (LAW-1)
> Tap-and-hold ring → morphs (LAW-3 spring) to show tomorrow's projected fill given trajectory + planned workout. Release to return.

**[T-E1] Kill Section Labels** (LAW-4)
> Remove "Today's Meals" / "Up Next" / "Last 7 days" headings. Hierarchy via weight + whitespace alone.

**[T-E2] Kill TrialBanner Inline** (LAW-4)
> Move trial state to a subtle Profile-tab badge. Today exists to answer "what now," not admin.
> *Caveat:* could affect trial-conversion KPIs — verify before shipping.

**[T-R1] Show "Eaten" Not "Remaining"** (LAW-1, LAW-2)
> Hero flips to "calories eaten so far" with target as quiet caption (**1,247** / *of 2,400*). Journal-tone, not tax-tone.

**[T-R2] Empty State Inverted** (LAW-4)
> Empty meals: ring renders full-faded as target outline. Camera Scan CTA is the hero, not a button. *"The day is unwritten — go write it."*

---

## SURFACE 2: NUTRITION

*`(tabs)/nutrition.tsx` → `NutritionTrendsView`. Drill-downs: `nutrition/day/[date].tsx`, `nutrition/metric/[id].tsx`.*

**[N-S1] Heatmap-Strip Replaces Card Grid** (LAW-4, LAW-5)
> Weekly trends become one 80pt horizontal strip: 7 vertical bars (height = kcal vs. target, color = macro adherence).

**[N-S2] "Day Pages" Become Single Scroll-Spy Strip** (LAW-4)
> Month-as-long-scroll: each day a 64pt row (date | hero kcal | macro tri-bar). Header chip shows currently-visible date. Eliminates date picker.

**[N-C1] Hero × Trend Inline** (LAW-1, LAW-5)
> Today's hero kcal (72pt) sits ON the 7-day sparkline rendered in its negative space — like a roof on a horizon.

**[N-C2] Macros × Day Rows** (LAW-2, LAW-4)
> Each day row: date (tabular) | kcal total (32pt tabular) | tri-color macro bar (4pt). No labels. Eliminates protein/carb/fat view toggles.

**[N-A1] Apple Health "Today vs. Average" Pill** (LAW-1)
> Under hero kcal: tiny pill **"+212 vs 7-day avg"**. Surfaces relative context without a chart.
> *Wiring:* derived field `vs_avg_kcal` in nutrition API.

**[N-A2] Stripe-Style Vertical Rhythm on Day Detail** (LAW-4)
> `nutrition/day/[date].tsx`: drop all card backgrounds. Date as huge 28pt header, meals as table rows, totals bottom-anchored. Reads like a Stripe receipt.

**[N-M1] Magnify the Macros** (LAW-1, LAW-2)
> P/C/F values become 32pt tabular columns at top of Nutrition. The 4pt macro bar demoted to summary.

**[N-M2] Minify Drill-Down Chrome** (LAW-4)
> `nutrition/metric/[id].tsx` loses title bar. Big number top-left, sparkline below, contributing meals as table. Swipe-down to dismiss.

**[N-P1] Sparkline Becomes a Scrubber** (LAW-3, LAW-5)
> Drag finger across 7-day sparkline → hero number swaps to that day's value live. Lift → snap back to today.

**[N-E1] Kill the "Today / Week / Month" Toggle** (LAW-4)
> Nutrition is *always* today-hero + 7-day strip. Anything deeper lives in the long scroll-spy (N-S2).

**[N-E2] Kill Empty-State Illustration** (LAW-4)
> 0 logged: hero renders tabular "0" with caption *"of 2,400 — eat something."* Data tells the truth.

**[N-R1] "Days Until" Reversal** (LAW-1)
> Hero stat = **"3 days under target this week"** or **"On track for 7/7."**
> *Caveat:* verify with CLAUDE.md §7 no-streaks rail — these are adherence counts, not consecutive streaks. *Ask before shipping.*

**[N-R2] Macro "Deficits" Not "Totals"** (LAW-2)
> Macros render as **"Protein: -42g"** (gap) instead of "158g of 200g." The gap IS the action.

---

## SURFACE 3: SCAN

*`(tabs)/scan.tsx` → CameraView, ShutterButton (reanimated spring), photo-library fallback. Routes to `scan-result.tsx`.*

**[SC-S1] Live Macro Estimate Preview** (LAW-3)
> Camera view shows placeholder pill "—— kcal · — P · — C · — F" pre-shutter. Resolves into focus post-capture. Teaches the user what to expect.

**[SC-S2] Shutter Becomes Hold-to-Capture** (LAW-3)
> 200ms hold to capture; inner circle scales smoothly. Tap remains as fallback. Prevents accidental captures.

**[SC-C1] Result View × Macro Bar × Confidence Whiskers** (LAW-1, LAW-2)
> `scan-result.tsx`: hero kcal (72pt tabular) + macro tri-bar + 1pt confidence whiskers on each macro value. Encodes Gemini uncertainty visually, no text.
> *Wiring:* AI scan response needs `confidence_range` per macro in `backend/app/routers/meals.py`.

**[SC-C2] Recent Scans Strip on Camera View** (LAW-4)
> Below shutter: 48pt strip with last 3 scanned meals (thumb + kcal). Tap to re-log without re-scanning.

**[SC-A1] Things-3 Strike-In on Save** (LAW-3) ⭐ *Strong candidate*
> "Save meal" → meal row strikes-in toward bottom (200ms), screen dismisses, meal appears on Today already animating its entry. **Cross-screen motion continuity.**

**[SC-A2] Apple Photos-Style "Adjust" Sheet** (LAW-3, LAW-4)
> Edit meal = bottom sheet with portion-size sliders. Macros animate live (LAW-3 spring) as user drags. No form, no buttons until "Save."

**[SC-M1] Magnify Capture Feedback** (LAW-3)
> Capture moment: 80ms 60%-opacity white flash, then photo drops into loading state. Real shutter cinema feel.

**[SC-M2] Minify the Library Button** (LAW-4)
> "Photo library" link shrinks to top-right 24pt icon. Camera-first means camera-first.

**[SC-P1] Camera Idle = Live Macros Today** (LAW-1, LAW-2)
> >3 sec idle on Scan tab: translucent overlay shows today's running macro totals on the camera view. Camera becomes a HUD.

**[SC-E1] Kill the "Allow Camera" Modal Screen** (LAW-3, LAW-4)
> First-visit camera permission as inline sheet over camera-blackness, not a separate destination.

**[SC-R1] Result-First Workflow** (LAW-1)
> Tapping Scan tab opens empty `scan-result` with macros "—" and a "Tap to scan" hero CTA. Camera = tool, not destination.
> *Caveat:* adds a step — measure tap-to-meal latency before adopting.

---

## SURFACE 4: WORKOUTS

*`(tabs)/workouts.tsx` → routines grouped by day-of-week, RoutineCards, RPE picker modal. Drill-downs: `routine/[id]`, `routine/new`, `session/[id]`.*

**[W-S1] Day-Strip Replaces Day Sections** (LAW-4)
> Horizontal 7-day chip-strip at top. Page scroll jumps between days; tap chip to scroll. "Your week in one view."

**[W-S2] RoutineCard → Routine Row** (LAW-2, LAW-4)
> RoutineCard collapses to single line: name | duration (tabular) | exercise count. Swipe-left to start, swipe-right to delete.

**[W-C1] RPE Picker Inline Expansion** (LAW-3)
> Start gesture expands the routine row inline (LAW-3 spring) revealing a horizontal 1–10 RPE strip. Modal eliminated.

**[W-C2] Session-In-Progress × Workouts Tab** (LAW-1, LAW-3) ⭐ *Priority pick*
> Active session takes over the Workouts tab content — current exercise, current weight (huge tabular hero), rest timer. Tab badge shows rest seconds. **Coming back to the tab = picking up where you left off.**

**[W-A1] Strong-Style Active-Session Table** (LAW-2, LAW-4)
> `session/[id]/index.tsx` becomes a pure spreadsheet: exercises as rows, sets as columns. Active cell highlighted with 2pt left border.

**[W-A2] Linear-Style Section Pulse on Day-Change** (LAW-3)
> Midnight (or app foreground): "Today" chip animates highlight to new day via LAW-3 spring. Quiet clock-tick.

**[W-M1] Magnify Current-Set Weight** (LAW-1, LAW-2) ⭐ *Strong candidate*
> Active set: weight renders 96pt tabular bold across top half. Reps × set small below. Rest timer fills bottom third. Readable from 6 feet away on a bench.

**[W-M2] Minify "Rest day" Copy** (LAW-4)
> "Rest day. Nothing scheduled." → 11pt textMuted line aligned right. Rest days felt, not announced.

**[W-P1] Day Chip = Volume Sparkline** (LAW-5)
> Each W-S1 day chip carries a tiny 4-week volume sparkline below the letter. Pattern insight without analytics.

**[W-E1] Kill "Your week, one day at a time." Tagline** (LAW-4)
> Cut the page subtitle. Premium apps don't narrate themselves.

**[W-E2] Kill "Anytime · no day set" Section** (LAW-4)
> Folds into current day's list, sorted bottom with subtle dim. One list per visible day.

**[W-R1] Show "Recovery" Not "Workouts"** (LAW-1)
> Rest days: hero = hours-since-last-session or estimated recovery %. Rest IS the metric.
> *Wiring:* `recovery_hours_since_last_session` derived field.
> *Caveat:* verify with §7 — pure calculation, not commentary.

---

## SURFACE 5: PROFILE

*`(tabs)/profile.tsx` → ProfileIdentity, trial card, lifetime stats, daily targets, expandable edit form, AI info, sign out, delete.*

**[P-S1] Lifetime Stats Become Hero** (LAW-1, LAW-2)
> Page title replaced with hero stat: total kcal-burned-lifetime at 72pt tabular. Profile = trophy case, not admin panel.

**[P-S2] Targets Card Replaces Identity** (LAW-1)
> Hero current-weight (72pt) → hero target-kcal (32pt) → tiny 24pt avatar in corner. Identity becomes footnote.

**[P-C1] Trial Card × Hero Number** (LAW-1, LAW-2)
> Trial = single header line: "**8 days · 3/5 scans today**". No card chrome.

**[P-C2] Edit Form × Live Targets Preview** (LAW-2, LAW-3)
> Targets animate via LAW-3 digit-cycle as user adjusts weight/activity sliders. No "save to preview."

**[P-A1] Apple Settings-Style Grouped Density** (LAW-4)
> Account section (Sign out, Delete) = pure text rows, Apple-Settings style. Destructive = single red text. Admin should look like admin.

**[P-A2] Stripe-Style Trial Status Strip** (LAW-4, LAW-5)
> Trial replaced with horizontal 4pt-tall days-elapsed bar + tabular numbers. No card.

**[P-M1] Magnify Avatar + Name** (LAW-1)
> If keeping identity-first: 160pt avatar circle + 32pt 700 name. Halfway-sized identity reads as wireframe.

**[P-M2] Minify Activity / Goal Cards** (LAW-4)
> Few-choice OptionCards become a horizontal pill-button row (LAW-3 spring on selection). Saves 5 vertical rows.

**[P-P1] AI Info Becomes Inline Snippet** (LAW-4)
> Eliminate `/ai-info` screen. Inline expandable text block on Profile.

**[P-E1] Kill "This is your space." Tagline** (LAW-4)
> Cut. Same instinct as W-E1.

**[P-E2] Kill the Daily Targets Card** (LAW-4)
> Duplicates Today/Nutrition info. Edit form's "After save" preview is enough.

**[P-R1] Show "Targets" Not "Body"** (LAW-1)
> Profile leads with target kcal/protein/weight-goal, not current-state. Mission statement vs. snapshot.

---

# Phase 3 — What If Hero Metric Provocations (12 ideas)

**[WI-1] Persistent kcal in tab bar** 🚫 *VETOED — Brady rejected: "I don't want something shown on every single tab."* (Constraint captured for future sessions.)

**[WI-2] Hero number changes unit on tap** (LAW-1, LAW-3) — Tap → morphs via digit-cycle into "1 meal's worth" or "1 workout's worth." Number as concept.

**[WI-3] Time-to-zero clock as hero** (LAW-1, LAW-2) — "12h to refresh" or "4h until projected over-target." Calm countdown, no alarm aesthetic.

**[WI-4] Ambient strain bar in workout sessions** (LAW-5 ext.) — Top bar fills with cumulative volume during a session. No label, no %. Whoop-grade strain from inputs the app already has.

**[WI-5] Scan result auto-collapses if untouched** (LAW-3, LAW-4) — 3 sec → collapse to compact 80pt confirm strip + Save button. Default-correct UX.

**[WI-6] Pull-down "1-rep view"** (LAW-1 maximalism) — Gesture zooms any surface to its single hero number for 2 sec. User-controlled focus mode.

**[WI-7] Meal weighed in workout-equivalents** (LAW-2, LAW-3) — Logged meal animates derived figure: "≈ 23 min run." Pure arithmetic, no commentary.
> *Caveat:* §7 borderline — verify it's math, not coaching.

**[WI-8] Hero animates only at thresholds** (LAW-3 pure) — Dead-still during normal eating. Single spring at 50% / 75% / 90% / 100% of target. Milestones felt, not announced.

**[WI-9] Skeletons match final data shape** (LAW-4) ⭐ *Strong defensive pick* — Skeleton = frame-perfect preview including 0% ring, flat sparkline. Zero layout jump on hydrate.

**[WI-10] Long-press sparkline to mute** (LAW-5) — Fade to 30% opacity for 24h. Personalization via gesture, no settings.

**[WI-11] Layout weight = data weight** (LAW-4) — Meal rows physically scaled by kcal. 2,800 kcal lunch > 280 kcal snack in vertical space.

**[WI-12] Hardware-button binding during sessions** (LAW-4, ergonomic) — Volume buttons advance set state. Hands stay on the bar.

---

# Phase 3 — Anti-Pattern Catalog (18 anti-patterns)

> Each: trap + which guardrail kills it. These map to enforceable dev-agent rules.

| # | Anti-Pattern | The Trap | Killed By |
|---|---|---|---|
| AP-1 | **Random Hex Drift** | Inline `style={{ color: '#7DA8FF' }}` across components | LAW-2 + CLAUDE §2 — tokens only; grep `#[0-9a-f]{3,6}` in pre-commit |
| AP-2 | **Magic Padding** | `padding: 17`, `marginTop: 11` | LAW-4 — spacing tokens only |
| AP-3 | **Confetti Adjacent** | Subtle particle/bounce/haptic flash on logging | CLAUDE §7 + LAW-3 (only 3 approved animations) |
| AP-4 | **Decorative Motion** | Cards floating in, numbers popping, gradients breathing | LAW-3 — no signal, no motion |
| AP-5 | **Loader Strobing** | Spinner for 80ms before data arrives | LAW-4 + CLAUDE §2 — 200ms delay; skeletons match shape (WI-9) |
| AP-6 | **Empty-State Pity-Copy** | "Oops, nothing here yet!" | YourStrat voice — calm, declarative, never apologetic |
| AP-7 | **Section-Header Inflation** | 13pt uppercase letterspaced labels on every block | LAW-4 — already addressed in T-E1 |
| AP-8 | **Tap-Target Discounting** | 32pt "minimal" buttons that miss thumb targets | Min 44×44pt + `hitSlop` extension |
| AP-9 | **Toast Spam** | Toast on every action | LAW-3 — toasts for errors / invisible cross-screen results only |
| AP-10 | **Form-as-Wall** | 10 vertical OptionCards each 60pt | P-M2 pill-rows; LAW-4 inline grouping |
| AP-11 | **Numeric Cosmetic Drift** | "1,234.56 cal" vs "1234.6 calories" vs "1.2k" | LAW-2 — single `formatKcal()` helper in `mobile/lib/` |
| AP-12 | **Icon Inflation** | 24pt icon next to every row label | LAW-4 — icons earn placement only if faster than text |
| AP-13 | **Branded Loading States** | Custom-animated YourStrat logo loaders | WI-9 — skeleton-as-shape only |
| AP-14 | **Boundary-Less Scroll** | Tabs scroll into each other, no header anchoring | `Screen` wrapper (CLAUDE §4) |
| AP-15 | **AI Whisper Creep** | "Based on your recent meals…" copy | CLAUDE §7 hard rail — string-prefix grep in PR review |
| AP-16 | **Modal Stack Hell** | Modal → modal → sheet → confirm | Max one modal at a time; prefer inline expansion (W-C1) |
| AP-17 | **Performance Theater** | `.map()` of 80+ items inside `ScrollView` | CLAUDE §3 — FlatList/FlashList ≥10 items |
| AP-18 | **Off-Theme Native Components** | iOS-default switches/pickers mid-screen | All inputs through `mobile/components/ui/` |

---

# Idea Organization & Prioritization

## Thematic Clustering

**Cluster 1 — Hero & Number Discipline** (LAW-1 + LAW-2)
T-S1, T-S2, T-M1, T-R1, T-R2 / N-C1, N-M1, N-R2 / SC-C1, SC-R1 / W-C2, W-M1, W-R1 / P-S1, P-S2, P-R1 / WI-3, WI-7, WI-8
→ The "make numbers the visual signature" cluster.

**Cluster 2 — Motion as Signal** (LAW-3)
T-A1 / SC-A1, SC-A2, SC-M1 / W-A2 / N-P1 / WI-5, WI-8, WI-10 / AP-3, AP-4, AP-9
→ "Three animations, used purposefully" cluster. Cross-screen motion continuity (SC-A1) is the showcase.

**Cluster 3 — Subtractive Density** (LAW-4)
T-E1, T-E2 / N-S1, N-S2, N-A2, N-M2, N-E1, N-E2 / SC-C2, SC-E1, SC-M2 / W-S1, W-S2, W-M2, W-E1, W-E2 / P-A1, P-A2, P-M2, P-P1, P-E1, P-E2 / WI-9 / AP-2, AP-7, AP-8, AP-10, AP-12, AP-14
→ "Cut everything that doesn't earn its place" — largest cluster.

**Cluster 4 — Cross-Surface Coherence** (the "feels like one app" cluster)
T-C1, T-C2 / N-C1, N-C2 / SC-A1 (cross-screen motion) / W-C2 (active-session takeover) / WI-2, WI-6 / AP-11 (single formatKcal)
→ Patterns that propagate across surfaces consistently.

**Cluster 5 — Backend Wiring Gaps** (feeds the "UI ↔ backend connectivity" goal)
- `today.py`: `target_pace_kcal_now` (T-S1), `workout_completion_today` (T-C1), `recovery_hours_since_last_session` (W-R1)
- `meals.py` scan response: `confidence_range` per macro (SC-C1)
- Nutrition API: `vs_avg_kcal` derived field (N-A1)
→ 5 small backend additions unlock 5 high-value UI moments.

**Cluster 6 — Wild / Validate Later** (need user testing or §7 verification)
WI-2, WI-6, WI-7, WI-12 (hardware-button), N-R1, W-R1, SC-R1
→ High-novelty, higher-risk. Stage for prototype testing.

---

## Priority Tiers (Implementation Order)

### Tier 0 — DNA Compass (apply to ALL work, always)
The 5 DNA Laws. No code ships that violates them. Already binding via CLAUDE.md.

### Tier 1 — Brady's Hell-Yeses (Sprint 1 candidates)
- **[T-S1] Pace Ring** — outer ring becomes ahead/behind-pace indicator on Today.
- **[W-C2] Active Session Takes Over Workouts Tab** — coming back to Workouts during a session = pick up where you left off.

### Tier 2 — Anti-Pattern Guardrails (ship BEFORE major reworks)
Defensive infrastructure that makes Tier 3+ work survive long-term:
- **AP-1 + AP-11** — pre-commit grep for raw hex; `formatKcal()` / `formatWeight()` / `formatMacroGrams()` helpers; route all numeric rendering through them.
- **AP-2** — pre-commit grep for off-grid padding/margin.
- **AP-3 + AP-4** — code-review rule: any new animation gets justified against the 3 approved animations (LAW-3); if not one of those three, it doesn't ship.
- **AP-15** — string-prefix grep for "Based on" / "It looks like" in PR review.
- **AP-17** — code-review rule: lists ≥10 items must be FlatList/FlashList.

### Tier 3 — Surface Quick Wins (Sprint 1–2, low risk, high polish)
Subtractive moves with high visual impact, low engineering cost:
- **T-E1, P-E1, W-E1** — kill all section-header taglines + page subtitles.
- **T-M2** — sparkline minify to whisper.
- **W-M2** — minify "Rest day" copy.
- **P-E2** — kill duplicate daily targets card.
- **P-M2** — pill-row Activity / Goal pickers.
- **SC-M2** — minify library button.
- **WI-9** — skeletons match final data shape (zero layout jump).

### Tier 4 — Surface Reworks (Sprint 2–4, bigger lifts)
- **T-M1** — hero kcal 96pt below ring (Today hero refactor).
- **W-S1 + W-S2** — Workouts day-strip + row collapse.
- **W-M1** — 96pt active-set weight hero in `session/[id]/index.tsx`.
- **W-A1** — Strong-style active-session table.
- **N-S1 + N-S2** — Nutrition heatmap strip + scroll-spy.
- **N-C1** — hero × sparkline composite ("number on horizon").
- **N-M1** — magnified macros as 32pt columns.
- **SC-C1** — confidence whiskers on scan result.
- **SC-A1** — cross-screen Scan→Today motion continuity.
- **P-S1 or P-S2** — Profile hero refactor (pick one).

### Tier 5 — Backend Wiring (parallel to Tier 4)
- `today.py` derived fields: `target_pace_kcal_now`, `workout_completion_today`, `recovery_hours_since_last_session`.
- `meals.py` scan response: `confidence_range` per macro.
- Nutrition API: `vs_avg_kcal` derived field.

Each is a small addition to existing Pydantic schemas + matching TS types (per CLAUDE.md §5 rule 4: schema is the contract).

### Tier 6 — Wild / Prototype-Validate Later
- WI-2 (unit-morph), WI-3 (countdown hero), WI-6 (pull-down 1-rep), WI-7 (meal-as-workout-equivalent), WI-12 (volume-button bindings), N-R1 (adherence count), W-R1 (recovery hero), SC-R1 (result-first scan workflow).
- These need user testing OR explicit CLAUDE §7 verification before adoption.

### 🚫 Vetoed
- **WI-1** — Persistent kcal in tab bar. Brady veto: "I don't want something shown on every single tab." *Constraint captured for future sessions: no ambient cross-tab metrics; each tab has its own hero.*

---

## Action Plan for Tier 1 Priority Picks

### [T-S1] Pace Ring — Today screen
**Why this matters:** Solves "am I on track right now?" with zero UI added. Same component (`IntakeRing`), more honest signal.

**Steps:**
1. **Backend (`backend/app/routers/today.py`):** Add `target_pace_kcal_now` to the today snapshot — calculated as `daily_calorie_target * (current_time_of_day / 24h_or_eating_window)`. Decide window (24h vs. waking hours) before coding.
2. **Schema (`backend/app/models/schemas.py` + `mobile/lib/api.ts`):** Add field to `TodaySnapshot`. Keep both in sync (CLAUDE.md §5 rule 4).
3. **Component (`mobile/components/IntakeRing.tsx`):** Accept `targetPaceKcal` prop. Render outer ring as two arcs: `consumed/target` (existing) and a thin "pace marker" tick at `targetPaceKcal/target`. Subtle green tint band if `consumed >= pace`; warning band if `consumed << pace` AND it's mid-day-or-later.
4. **Verification:** Web preview (`scripts/start-dev.ps1`), exercise: morning (pace far ahead), evening (over/under), edge cases (zero meals).
5. **Type-check + read diff before commit.**

**Resources:** ~1 dev day. Single new field + single component change.
**Risk:** Window definition (24h vs. eating-window) needs a call. Otherwise low.
**Success indicator:** Today screen has a *new* signal value with zero new chrome.

---

### [W-C2] Active Session Takes Over Workouts Tab
**Why this matters:** Eliminates the "where did my workout go when I tabbed away?" friction. Coming back to Workouts during a session = picking up exactly where you left off.

**Steps:**
1. **State:** Active session ID already lives in Zustand (`useStore`). Check `session/[id]/index.tsx` for what's there.
2. **Logic:** In `(tabs)/workouts.tsx`, branch at render: if `activeSessionId !== null`, render the active-session view inline (or `<Redirect>` to `/session/[id]`). Otherwise render the routine list as today.
3. **Tab badge:** `(tabs)/_layout.tsx` — show a small dot or rest-timer countdown on the Workouts tab icon while a session is active.
4. **End-of-session:** When `finishSession` resolves, clear active session ID; tab reverts to routine list.
5. **Verification:** Start a session → tab away → come back. Verify continuity. Test edge: app cold-start with an active session in DB (does `getActiveSession()` exist? wire it up).
6. **Backend check:** confirm `/sessions/active` or equivalent endpoint exists; if not, add it.

**Resources:** ~1–2 dev days (depends on existing active-session endpoint).
**Risk:** Cold-start active-session restoration is the tricky part. May need a quick backend add.
**Success indicator:** Mid-set, tab-switch, tab-back — zero lost state.

---

## Session Summary & Insights

### Key Achievements
- **94 captured insights** across 4 brainstorming techniques in 3 phases.
- **5 named, locked DNA Laws** to guide every future UI decision — direct trip-wires that map to CLAUDE.md rails.
- **Per-surface SCAMPER coverage** of all 5 primary tabs (Today, Nutrition, Scan, Workouts, Profile).
- **18-item anti-pattern catalog** mapped to enforceable PR-review checks.
- **5 specific backend wiring gaps** identified — small derived-field additions that unlock 5 high-value UI moments.
- **2 priority Tier-1 picks** with full action plans (T-S1 Pace Ring, W-C2 Active Session Takeover).
- **1 explicit veto** captured as a constraint (no persistent ambient cross-tab metric).

### Session Reflections
- DNA-first sequencing worked: 5 Laws gave Phase 2 SCAMPER a "does this rhyme?" filter that prevented drift.
- Brady's "go" energy mapped well to AI-Recommended mode — minimal time spent on technique pre-explanation, maximal time generating.
- The CLAUDE.md scope rails (no streaks, no confetti, no AI commentary) actively *helped* idea quality — borderline ideas (N-R1, W-R1, WI-7) got flagged with explicit "verify with §7" caveats instead of being silently accepted.
- The Cross-Surface Coherence cluster (especially SC-A1 cross-screen motion continuity and W-C2 active-session takeover) is the most under-explored direction and may deserve a follow-up session specifically on it.

### Recommended Next Skills
1. **`bmad-create-ux-design`** — feed this session output as input. The 5 DNA Laws + Tier 1/3 picks are ready to become a structured `ux-design.md` deliverable.
2. **`bmad-agent-ux-designer`** (Sally) — for conversational iteration on specific Tier 3/4 picks before locking the UX spec.
3. **`bmad-create-story`** — once UX is locked, break Tier 1 picks (T-S1, W-C2) into implementable stories with the action plans above.

### Creative Facilitation Narrative
The session opened with explicit context — Brady had already validated a BSP → CC → CU vision pattern on the Today tab and wanted to extend it app-wide. Rather than start at "what should the app look like?", we anchored on "what's the *DNA* we're stealing?" first. Brady went wide on references (all 8 candidates picked), then trusted curation to land on 5 named Laws. Phase 2 SCAMPER produced 59 ideas at consistent density across all 5 surfaces. Brady's energy stayed pace-positive throughout — single hell-yes calls (T-S1, W-C2), one decisive veto (WI-1), no analysis paralysis. Phase 3 What-Ifs pushed into wilder territory (hardware buttons, layout-as-data-weight); Phase 3 Reverse Brainstorming surfaced 18 concrete anti-patterns that map directly to enforceable PR-review rules. Strong session, strong feed-doc for the next BMad skill.

---

**Workflow complete.** ✅
