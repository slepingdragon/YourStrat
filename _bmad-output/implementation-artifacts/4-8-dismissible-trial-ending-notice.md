# Story 4.8: Dismissible trial-ending notice

Status: review

## Story

As a trial user near day 7,
I want a respectful heads-up,
so that I'm informed without being hijacked (FR30-Today).

Enhances the **existing** `components/TrialBanner.tsx` (already rendered at the top of Today) to fully meet the ACs — it is **not** a new component (CLAUDE §1.2 edit-don't-duplicate).

## Gaps found in the existing banner (what this story fixes)

1. **AC2 violated — urgent banner re-nags after dismiss.** The effect short-circuits `if (days_remaining <= 3) setVisible(true)` **before** checking the dismissed key, so dismissing a ≤3-day banner doesn't stick — it reappears on the next Today focus within the same session.
2. **AC3 unmet — not tappable.** Only the `×` dismisses; tapping the banner does nothing. It must route to the Profile trial section.
3. **Polish — emoji/glyph.** Uses a `⚠` emoji and a `×` text glyph; CLAUDE §2 forbids emojis and wants the icon set (`X`).

## Acceptance Criteria

1. **Inline, top, dismissible.** When the trial is ending soon, a dismissible inline notice renders at the top of Today (never a full-screen takeover). *(Already true.)*
2. **Dismiss sticks within the session.** Dismissing it hides it and it does **not** re-nag within the session — **including** the ≤3-day urgent case. (Cross-app-open: still suppressed for the rest of the calendar day for the non-urgent case via the existing daily key.)
3. **Tap routes to Profile trial status.** Tapping the notice opens the Profile screen (its trial-status section). *(Section-scroll simplified to "opens Profile" — there is no section anchor; documented.)*
4. **Scope-safe copy (§7).** No paywall/upgrade plumbing. The notice is informational ("Trial ends today · N/N scans used today") and routes to Profile to view status — the AC's literal "Upgrade to keep scanning" CTA is intentionally **not** added (forbidden by the Scope Guard).
5. **Theme/icons.** No emoji; dismiss uses the `X` icon; urgency carried by `colors.urgent`. Tokens only.
6. **Verification.** `tsc --noEmit` clean; runtime (tap→Profile, dismiss-no-renag incl. urgent) is Brady's checklist.

## Tasks / Subtasks

- [x] **Task 1 — Dismiss sticks within session** (AC: #2) — module-level `dismissedThisSession` flag checked before the urgent short-circuit; `dismiss()` sets it (and still writes the daily key). Survives remounts within the app session.
- [x] **Task 2 — Tap → Profile** (AC: #3) — wrap the banner body in a `Pressable` → `router.push("/profile")` with an a11y label; the `×` stays a separate dismiss target.
- [x] **Task 3 — Copy + icons** (AC: #4, #5) — informational ending-soon copy ("Trial ends today/tomorrow", else "N days left"); drop the `⚠` emoji; dismiss uses the `X` icon.
- [x] **Task 4 — Verify** (AC: #6) — `tsc --noEmit` clean.

## Dev Notes
- Reuse `Card`, `X` icon, `useRouter`. No new dep/component/token. No backend change (reads the existing `trial` prop / `normalizeTrial`).
- **v1 limit:** "Profile trial-status section" = routing to the Profile tab (no section anchor exists to scroll to). `dismissedThisSession` is in-memory (resets on app relaunch) — that's the intended "within the session" scope; the daily key still throttles non-urgent across opens.

### References
- [epics.md → Epic 4 / Story 4.8](../planning-artifacts/epics.md) (lines 954–972), FR30-Today; CLAUDE §2 (no emoji), §7 (no paywall plumbing).
- `components/TrialBanner.tsx`, `app/(tabs)/index.tsx` (host), `app/(tabs)/profile.tsx` (trial section), `lib/api.ts` (`normalizeTrial`/`TrialStatus`).

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- **AC2 (re-nag) fixed:** added a module-level `dismissedThisSession` flag checked at the top of the effect (before the ≤3-day urgent short-circuit), set in `dismiss()`. Now dismissing sticks for the app session in every state; the daily `DISMISS_KEY` still throttles the non-urgent case across opens.
- **AC3 (routing) added:** the banner body is now a `Pressable` → `router.push("/profile")` with an a11y label "Opens your trial status in Profile"; the `X` dismiss stays a separate target.
- **AC4/AC5 (scope + polish):** copy is informational ("Trial ends today/tomorrow" / "N days left in your trial" + scans-used + "tap to manage") — **no upgrade/paywall CTA** (§7). Dropped the `⚠` emoji; dismiss uses the `X` icon; urgency carried by `colors.urgent`. Tokens only.
- `tsc --noEmit` clean. No new dep/component/token; backend untouched. (The pre-existing dead `ended` render branch is left as-is — out of scope, not cleaned up in passing.)
### ⚠️ Brady checklist (gates `done`)
1. With ≤3 days left, dismiss the banner → it stays gone for the session (tab away/back, refresh) and doesn't reappear.
2. Tap the banner → lands on the Profile tab (trial-status section visible).
3. No emoji; the dismiss is the `X` glyph icon; urgent state is red-bordered.
### File List
- `mobile/components/TrialBanner.tsx` (modified)

## Change Log
- **2026-05-24** — Drafted + implemented (autonomous). Status → review.
