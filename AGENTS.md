# YourStrat Agent Instructions

Read [YOURSTRAT_BUILD.md](YOURSTRAT_BUILD.md) before writing code.

## Rules

1. **Scope Guard (§2)** — forbidden features are non-negotiable. Stop and ask if unsure.
2. **Build order (§11)** — Week 1 → 2 → 3. One screen or endpoint per task.
3. **API surface (§7)** — do not add routes beyond the spec.
4. **EmberPath reference** — primitives only from `../Business/EmberPath/` (Screen, Button, Input, supabase, deps). Never copy streak/leaderboard/tip/learn code.

## UX defaults

Prefer auto defaults and optional fields over required busywork. Name things for the user when they skip (template, picks, or date). Target casual users, not power users.

## UX review (after UI work)

When you finish a screen or flow, critique it as a first-time user: what draws the eye first, what feels like busywork, what is buried. Fix obvious friction (layout order, optional vs required fields, empty-state copy) without waiting to be asked. Stay within scope guard — polish, not new features.

## When done

If the current week's checklist in §11 is complete, stop. Do not invent features.
