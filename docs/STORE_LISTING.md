<!-- DRAFT store-listing copy + Play Console answer cheat-sheet. Paste into
Play Console → Main store listing / App content. Review wording before publishing. -->

# YourStrat — Play Store listing

## App title (≤30 chars)
`YourStrat`

## Short description (≤80 chars)
`Scan meals, track macros, log workouts — calm, fast, no clutter.`  _(63)_

## Full description (≤4000 chars)

```
YourStrat is a calm, fast fitness tracker that does two things well: it helps you log what you eat and what you lift — without the clutter, streaks, or noise of other apps.

LOG A MEAL IN SECONDS
- Snap a photo and get an instant nutrition estimate — calories and macros, broken down by item.
- Scan a barcode for exact packaged-food nutrition.
- Every number is an estimate you can edit before saving. No false precision.

KNOW YOUR DAY AT A GLANCE
- Set your calorie and macro targets from a quick profile (or let YourStrat compute them).
- A clean daily ring shows what's left, with a pace cue so you know if you're on track.
- A 7-day trend and day-by-day history, in a quiet receipt-style view.

TRAIN AND TRACK
- Build routines, schedule them across your week.
- Run a session with a big readable weight display and a built-in rest timer.
- Calories burned flow back into your day.

BUILT TO FEEL FINISHED
- A focused dark design. No ads. No social feed. No notifications nagging you.
- Your data is yours — delete your account and everything in it anytime, right from the app.

YourStrat includes a free trial for AI photo scans (with a daily limit); barcode scanning and manual logging are always free.

Nutrition estimates from photos are produced by AI and are approximate — always check the label on packaged foods.
```

## Category & contact
- **Category:** Health & Fitness
- **Tags:** calorie counter, macro tracker, workout log
- **Contact email:** [CONTACT EMAIL]
- **Website / Privacy policy:** [https://yourstrat.xaeryx.com] / [https://yourstrat.xaeryx.com/privacy]

## Release notes — v1.0.0 ("What's new")
```
First release. Photo + barcode meal scanning, calorie & macro targets with a daily pace ring, routines with a live session + rest timer, and a 7-day nutrition trend — in a calm, ad-free design.
```

---

## Data safety form — answers cheat-sheet

> Play Console → App content → Data safety. Confirm against the privacy policy before submitting; update if any analytics/crash SDK is added.

**Does your app collect or share user data?** Yes.

| Data type | Collected | Shared | Purpose | Notes |
|---|---|---|---|---|
| Email address | Yes | No | Account management, App functionality | Supabase Auth |
| Health & fitness (weight, height, age, sex, goals, nutrition & workout logs) | Yes | No | App functionality | Core feature |
| Photos (meal images) | Yes | **Yes** | App functionality | **Shared with Google (Gemini API)** to estimate nutrition from the photo |
| App info & performance (crash logs/analytics) | [No — unless an SDK is added] | — | — | Confirm: state "none" or declare the SDK |

- **Is all data encrypted in transit?** Yes (HTTPS/TLS).
- **Can users request data deletion?** Yes — **in-app account deletion** (Profile → Delete account) plus an email request path. Provide the deletion URL/info Play asks for.
- **Is data processed only ephemerally?** No (meals/workouts are stored until you delete them).

## Content rating
- Run the questionnaire; expected **Everyone** — no violence, sexual content, gambling, or user-generated social content. It's a personal health/fitness tracker.

## Target audience & ads
- **Target age:** 13+ (not directed at children).
- **Ads:** No ads.

---

### To finalize (Brady)
- [ ] Fill `[CONTACT EMAIL]` + confirm website/privacy URLs are live.
- [ ] Confirm the **Photos → shared with Google** row (this is the one reviewers care about) matches the privacy policy.
- [ ] Confirm "crash logs/analytics" row (none vs. declare SDK).
- [ ] Capture 2–8 phone screenshots (Today ring, Scan result, Workouts session, Nutrition trend) + a 1024×500 feature graphic + 512×512 icon.
