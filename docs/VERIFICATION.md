# YourStrat — device verification runbook

One phone-in-hand pass over everything shipped to `review` this cycle (14 stories).
Go top-to-bottom; flip each story `review → done` in
`_bmad-output/implementation-artifacts/sprint-status.yaml` as it passes.

**Fastest way to get a build on the phone (no Play Console needed):**
`cd mobile && eas build --profile preview-apk --platform android` → install the APK on the S24 Ultra.
(Or the production AAB via Internal testing — but the APK is quicker for this pass.)

🔴 = must-pass before any release. 🟡 = polish/feel.

---

## 0. Smoke (cold start)
- [ ] App cold-starts to login; sign up → onboarding → lands on Today. No `SetupEnvScreen`, no crash. 🔴

## 1. Today (4.7)
- [ ] Ring is a compact "crown"; **remaining-kcal is a big 96pt number below it**; "over" turns it red. 🟡
- [ ] 7-day sparkline is a quiet ~28px whisper (faint target line, cyan today dot). 🟡
- [ ] Meals are compact single-line rows (name · kcal · P/C/F tri-bar); **tap expands** (items + macros + "Open"→meal detail), tap again collapses. 🔴
- [ ] No "· Evening" tagline on the header (date only). 🟡

## 2. Scan (3.4) — 🔴 don't-break-the-scan
- [ ] **Photo scan still works**: snap a meal → result screen populates with items/macros (this is the critical one — the scan pipeline was only touched for a derived field). 🔴
- [ ] Macros show small **whisker ticks** — short/none on confident items, taller on uncertain; none when no confidence. 🟡
- [ ] A low-confidence result still shows the calm banner + per-item note. 🟡
- [ ] **Barcode** scan still returns exact packaged-food data. 🔴
- [ ] VoiceOver on a macro row reads the estimated range. 🟡

## 3. Workouts list (5.8 / 5.9)
- [ ] **DayChip strip**: today highlighted (+ dot when you tap another day); tapping a chip scrolls to that day; scroll-spy lights the right chip. 🟡
- [ ] **Swipe-left a routine** → green Start reveal → inline RPE strip springs open → pick/skip → session starts. 🔴
- [ ] **Swipe-right** → red Delete reveal → confirm → row goes. 🔴
- [ ] Vertical list scroll still works (swipe only triggers on a deliberate horizontal drag); **tap opens** the routine. 🔴
- [ ] A 0-exercise routine can't start (no green reveal); opening it still works. 🟡
- [ ] No page tagline; empty days read "<day> … Rest day" quietly. 🟡

## 4. Active session (5.6 / 5.7)
- [ ] Start a routine → the **Workouts tab becomes the live session** (not a pushed screen). 🔴
- [ ] **96pt WeightHero**; unit is kg/lb per your profile; reps below; "—" when empty. 🟡
- [ ] Log set 1 with a weight → set 2 **pre-fills** it; advancing to the **next exercise clears** the weight. 🟡
- [ ] Strong-style **spreadsheet**: logged cells show weight, active cell has the 2pt cyan left border, active row highlighted. 🟡
- [ ] After logging, a **slim REST pill** appears (countdown + Skip) without hiding the hero/Log; logging again mid-rest restarts it. 🟡
- [ ] **#1 unknown — tab-unmount-on-blur:** begin a rest, tab to Today → the Workouts tab icon shows a **counting-down badge**; tab back → still on the **same set** with the timer running. If progress reset to exercise 1, the tab is unmounting on blur (set `unmountOnBlur:false` / lift state). 🔴
- [ ] "Log set & finish" on the final set → summary; "Finish workout" confirms; pause overlay + Resume work (incl. after scrolling). 🔴
- [ ] Calories burned show back on Today. 🟡

## 5. Nutrition (6.1–6.5)
- [ ] **Hero**: 72pt today-kcal over a faint sparkline; **"+N vs 7-day avg" pill** once 2+ prior days have data; fresh day shows "0 — of {target}, eat something." (no pill). 🟡
- [ ] **"This week" heatmap**: 7 bars, height = calories, green = macros on-point / grey = off; today's bar outlined. 🟡
- [ ] **History**: smooth scroll of 64pt day rows (date · kcal · tri-bar); a **month chip** appears top-center and tracks the visible month; ≥10 days scrolls smoothly (virtualized). 🔴
- [ ] Tap a day → **slides up as a modal**; swipe-down dismisses (iOS) / close-X works (Android); receipt layout (big date, flat meal rows, bottom totals). 🔴
- [ ] Confirm you're OK that the **per-nutrient trend rows + chip strip are gone** from the tab (per-nutrient detail still opens via a metric drill-down). If not, tell me to restore them. 🟡

## 6. Profile (2.7)
- [ ] **72pt lifetime-burn hero** at top; no "This is your space." tagline; **no daily-targets card** (targets live on Today/Nutrition). 🟡
- [ ] Trial reads as **one quiet line** ("N days · X/10 scans today"). 🟡
- [ ] Account is a **grouped settings list**; AI section shows honest scan stats + the accuracy caveat; "How scanning works" opens the info screen. 🟡
- [ ] Edit-your-details still expands, previews, and **saves (recompute targets)**. 🔴

## 7. 🔴 Account deletion (Play-mandatory) — test on a THROWAWAY account
- [ ] Profile → **Delete account** → confirm → you're signed out, and in Supabase the row is gone from `auth.users`, the user's data, and the `meal-photos/{uid}/…` objects. (Migration 008 must be applied — done.) 🔴

## 8. Trial notice (4.8)
- [ ] With ≤3 days left, **dismiss** the banner → it stays gone for the session (tab away/back, refresh) and doesn't re-nag. 🟡
- [ ] **Tap** the banner → lands on the Profile trial section; no emoji; dismiss is the X icon. 🟡

## 9. Pace ring (4.5 / 4.6 — earlier `review`)
- [ ] Ring animates in; "ahead" gap-arc reads green and sits correctly (z-order); pace cue matches your day. 🟡

## 10. Dev-side (not on the phone) — 1.2 / 1.3
- [x] Pre-commit guard tested (blocks raw hex / padding-margin literals / AI-copy on staged `mobile` code; passes clean code) and **active** on this machine. On your other machine, run `git config core.hooksPath .githooks` once.
- PR template renders on PR open.

---

### After the pass
- Flip each passed story to `done` in `sprint-status.yaml`.
- Anything that fails → tell me the surface + what you saw; most fixes are small.
- Then proceed with the Play release (build AAB, listing, data-safety) per `RELEASE_CHECKLIST.md`.
