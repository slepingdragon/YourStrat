## What & why

<!-- Describe the change and link the story (e.g. _bmad-output/implementation-artifacts/X-Y-*.md). -->

## Premium · scope · 60-FPS checklist (Stories 1.2 + 1.3)

The pre-commit guard (`.githooks/pre-commit`) already blocks **raw hex**, **off-grid padding/margin**, and **AI-commentary copy** on staged `mobile` code. Confirm the items a regex can't catch:

- [ ] **One theme** — all color from `theme/colors.ts`, all spacing/radius from `theme/spacing.ts` (guard-enforced; no raw hex / magic numbers).
- [ ] **Animation (LAW-3, AP-3/AP-4)** — any new animation is one of the **three approved** animations, runs on the **UI thread** (Reanimated worklet), respects reduce-motion, and is justified here → <!-- which animation + why --> _or_ "no new animation."
- [ ] **Lists (AP-17, NFR1)** — any list that can render **≥10 items** uses `FlatList`/`FlashList`, never `.map()` inside a `ScrollView`.
- [ ] **Scope guard (§2)** — introduces **no forbidden features** (streaks, leaderboards, social, push/notifications, AI commentary/insights, achievements, paywall plumbing, etc.).
- [ ] **Wired + verified** — every new button hits a real backend route via `lib/api.ts`; `cd mobile && npx tsc --noEmit` is clean; exercised the screen happy-path **and** one edge case (empty / error / slow) per CLAUDE §1.
