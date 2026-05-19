# Trial and API cost assumptions

YourStrat v1 uses a **7-day free trial** with **rate-limited food scans** to control Gemini API spend. There is no Stripe or paywall in v1 — only trial tracking and limits. For future list pricing ideas, see [PREMIUM_PRICING.md](./PREMIUM_PRICING.md).

## Trial rules

| Setting | Default | Env override |
|--------|---------|--------------|
| Trial length | 7 days | (fixed in `trial.py`) |
| Scans per day (during trial) | 10 | `DAILY_SCAN_LIMIT` |
| Gemini model | `gemini-2.0-flash` | `GEMINI_MODEL` |

- Trial starts on `POST /profile/onboard` (`trial_started_at`, `trial_ends_at` on `profiles`).
- Each `POST /meals/scan` increments `daily_scan_counts` for the user’s local calendar date.
- After trial end: scans return **403** with a friendly message (Today and other tabs still work).
- At daily limit: scans return **429**.

## Token and cost estimate

Rough assumptions per food photo scan:

- **Input:** ~800 tokens (prompt + image encoding overhead; varies by resolution).
- **Output:** ~200 tokens (JSON nutrients for a few items).
- **Total:** ~**1,000 tokens / scan**

At **10 scans/day** during the 7-day trial:

- **~70 scans / user / trial** → ~70k tokens
- **gemini-2.0-flash** (illustrative; check [Google AI pricing](https://ai.google.dev/pricing)):
  - If blended ~$0.10 / 1M tokens → **~$0.007 / user / trial**
  - Steady state after trial (if limits unchanged): ~300k tokens/month at 10 scans/day → **~$0.03 / user / month** at the same rate

These numbers are planning estimates, not billing guarantees. Image size, item count, and model pricing change actual cost.

## Operational notes

- Run `supabase/migrations/004_trial.sql` in Supabase SQL editor (or your migration workflow).
- Backend reads limits from `backend/.env` (`DAILY_SCAN_LIMIT`, `GEMINI_MODEL`).
- Mobile shows trial status on Profile and a dismissible banner on Today when the trial is ending soon.

## Premium pricing (post–v1)

Trial limits above are the **v1 cost-control** mechanism. The intended **user-first subscription model** (Free / Core / Active, optional high-accuracy pass-through, ~20% margin on net revenue after store fees, and illustrative list prices) is documented in **[Premium pricing](./PREMIUM_PRICING.md)**. That doc also defines what counts as a food review (`POST /meals/scan`), standard vs high-accuracy models, and future billing hooks—without implementing Stripe or paywalls in v1.
