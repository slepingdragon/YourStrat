# Premium pricing (planning)

YourStrat v1 ships with a **7-day free trial** and scan rate limits only. There is **no Stripe, paywall, or subscription UI** in the app yet. This document is for future pricing decisions and cost modeling.

## Planned positioning

| Tier | Intent | Notes |
|------|--------|--------|
| **Trial** | 7 days, limited food scans | See [TRIAL_AND_COSTS.md](./TRIAL_AND_COSTS.md) |
| **Premium (future)** | Unlimited scans + full coach features in scope | Price TBD before launch |

## Cost floor (per active user / month)

Use [TRIAL_AND_COSTS.md](./TRIAL_AND_COSTS.md) for Gemini token assumptions. At illustrative **10 scans/day** on `gemini-2.0-flash`, API cost is on the order of **cents per user per month** — pricing should cover API, Supabase, hosting, and margin, not just tokens.

## Pricing principles (when we add billing)

- One simple monthly plan first; no tiers, badges, or gamification hooks.
- Grandfather trial users or offer a launch discount — decide before Stripe goes live.
- Keep food scan on a single Flash model; do not add multi-model pipelines to justify price.

## Out of scope for v1

- Stripe Checkout, App Store subscriptions, promo codes, admin billing dashboards
- Feature flags per tier beyond scan limits (already handled by trial backend)

When billing is in scope, update this file with list price, annual option, and App Store product IDs.
