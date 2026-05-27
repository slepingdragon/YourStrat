<!--
Filled in (date / entity / contact). Review once, then host at
https://yourstrat.xaeryx.com/privacy (the yourstrat.xaeryx.com subdomain off
xaeryx.com) and add that URL in Play Console → App content → Privacy policy.
The deployable version is site/privacy.html. This is not legal advice.
-->

# YourStrat — Privacy Policy

**Effective date:** May 25, 2026
**Last updated:** May 25, 2026

This Privacy Policy explains how **YourStrat** ("we", "us") collects, uses, and shares information when you use the **YourStrat** mobile app (the "App").

## Summary

YourStrat is a fitness and nutrition tracker. We collect the account and health/fitness information you provide so the App can work — your meals, workouts, and goals. Meal **photos you choose to scan are sent to Google's Gemini API** to estimate nutrition. We don't sell your data, and you can **delete your account and all associated data from within the App** at any time.

## Information we collect

- **Account information:** your email address and an authentication credential, used to create and secure your account. Authentication is handled by **Supabase Auth**.
- **Profile / health & fitness data you provide:** units, weight, height, age, sex, activity level, goal, and the calorie/macro targets computed from them.
- **Nutrition logs:** meals you log — food names/portions, calories and macronutrients, optional meal **photos**, and barcodes you scan.
- **Workout logs:** routines, exercises, sessions, sets/reps/weights, durations, calories burned, and effort (RPE) ratings.
- **Usage limited to operation:** a per-day food-scan count (to enforce trial limits) and basic trial state (start/end dates).

We do **not** request location, contacts, or microphone access. The App requests the **camera** (to scan meals) and **photo access** (to log a meal from an existing picture).

## How we use information

- To provide core features: compute targets, log and display meals and workouts, and track progress.
- To estimate nutrition from a meal photo or barcode (see "Third parties").
- To enforce the free-trial daily scan limit.
- To secure your account and operate the service.

We do **not** use your data for advertising, and we do not sell it.

## Third parties we share with (to operate the App)

- **Google (Gemini API):** when you scan a meal **photo**, the image is sent to Google's Gemini API to estimate the foods and nutrition. See Google's privacy terms. We send the photo for that request; we don't send your account identity for this purpose.
- **Open Food Facts:** when you scan a **barcode**, we look up that product code in the Open Food Facts database. Only the barcode is sent — no personal data.
- **Supabase:** our database, file storage (meal photos), and authentication provider. Your data is stored here.
- **Railway:** hosts our backend API.

These providers process data on our behalf to run the App. **We do not use third-party analytics or crash-reporting SDKs** (confirmed: no Sentry/Firebase/PostHog/etc. in the app).

## Data storage, security, and retention

- Data is stored in Supabase (Postgres + Storage) and transmitted over **HTTPS/TLS**.
- We retain your data while your account is active. When you delete your account, your profile, meals (and photos), workouts, and related records are removed (see below).

## Deleting your account and data

You can delete your account at any time in the App: **Profile → Delete account**. This permanently removes your profile, meals and meal photos, workouts, and associated records, and cannot be undone. If you can't access the App, email **baniabradyy@gmail.com** to request deletion.

## Children

YourStrat is **not directed to children under 13** (or the minimum age in your jurisdiction) and we do not knowingly collect their data.

## Your rights

Depending on where you live, you may have rights to access, correct, or delete your data (e.g., GDPR/CCPA). Contact **baniabradyy@gmail.com**. In-app deletion is available to everyone as described above.

## Changes

We may update this policy; we'll change the "Last updated" date and, for material changes, notify you in the App or by email.

## Contact

**baniabradyy@gmail.com** — YourStrat.

---

### Before you publish (fill / confirm)

- [x] Date / entity / contact: **filled** (effective May 25, 2026; entity "YourStrat"; contact `baniabradyy@gmail.com` — swap to a domain alias like `privacy@xaeryx.com` if you set one up).
- [x] Analytics/crash SDK: **none** (confirmed — no Sentry/Firebase/PostHog/etc. in `mobile/package.json`).
- [ ] Confirm whether the backend logs/keeps meal images or only forwards them to Gemini, and reflect that in "Data storage… retention."
- [ ] Deploy `site/` to **Vercel** (Root Directory = `site`) + add the `yourstrat.xaeryx.com` domain (CNAME → `cname.vercel-dns.com`, DNS-only, in Cloudflare); then add `https://yourstrat.xaeryx.com/privacy` in Play Console. (xaeryx.com launcher link → handled by the xaeryx.com agent.)
- [ ] (Recommended) Add an in-app "Privacy policy" link in Profile once the URL is live (left unwired to avoid a dead link).
