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
- **Website:** `https://yourstrat.xaeryx.com`
- **Privacy policy:** `https://yourstrat.xaeryx.com/privacy`

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

---

## Apple App Store (mirror — doing iOS later this week)

> Same product, same copy. App Store Connect uses different field names than Play; map them as below so the listing is consistent across both stores. Keep the **release notes identical** to Play's "What's new" for every version.

| App Store field | Value (mirror of Play) |
|---|---|
| **Name** (≤30) | `YourStrat` |
| **Subtitle** (≤30) | `Scan meals. Track macros.` _(Apple's subtitle ≈ Play's short description; the full 63-char short desc won't fit — this is the trimmed mirror)_ |
| **Promotional text** (≤170, editable without review) | `Log a meal in seconds with a photo or barcode, see your day on a calm pace ring, and run workouts with a built-in rest timer. No ads, no noise.` |
| **Description** (≤4000) | Reuse the **Full description** above verbatim. |
| **Keywords** (≤100, comma-separated) | `calorie,macro,counter,nutrition,meal,scan,barcode,workout,fitness,tracker,diet,gym` |
| **What's New** (release notes) | Mirror the Play **v1.0.0** notes above, identical. |
| **Support URL** / **Marketing URL** | `https://yourstrat.xaeryx.com` |
| **Privacy policy URL** | `https://yourstrat.xaeryx.com/privacy` (same page) |
| **Category** | Health & Fitness |

**App Privacy ("nutrition labels" — Apple's Data-safety equivalent):** answer the same as the Play Data-safety table above —
- Email → *Data Linked to You* (App Functionality).
- Health & Fitness → *Data Linked to You* (App Functionality).
- Photos → *Data Linked to You* (App Functionality); declare it's **shared with a third party (Google/Gemini)** to estimate nutrition. **Not** used for tracking/advertising.
- Crash/analytics → declare only if an SDK is added (none today).

**Age rating questionnaire:** expect **4+** (no objectionable content); answer "None" across the board.

**EAS / build (iOS):** fill the real values in `mobile/eas.json` → `submit.production.ios` (`appleId`, `ascAppId`, `appleTeamId` — currently placeholders), create the app in App Store Connect (bundle `com.yourstrat.app`), then `eas build -p ios --profile production` (EAS manages certs/profiles) → `eas submit -p ios`. ~24h review.

**Website mirror:** when the App Store listing is live, add an **App Store badge** next to the Google Play CTA in `site/index.html` (today it's Play-only) and point it at the App Store URL. _(Don't add the badge before the listing is live — a dead link looks broken.)_
