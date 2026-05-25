# YourStrat — Play Store Release Checklist

_Last updated: 2026-05-25 (release-prep pass)._

This tracks getting YourStrat onto the Google Play Store. It's split into two gates:

- **Gate A — buildable for Internal testing** (config/code correct enough to produce a signed AAB and upload to the Internal testing track).
- **Gate B — promotable to Production / public** (everything in A **plus** real verification, store listing, and legal/compliance).

> ⚠️ **The #1 blocker is verification, not config.** 14 stories shipped this run are in `review` and have **not been device-verified** (only 6.2 / 3.4 / 1.2 / 1.3 carry automated tests). Do **not** promote to Production until the device pass below is done. Internal-testing-track is the right place to do that pass on real hardware.

---

## ✅ Done in this release-prep pass (code/config)

- **In-app account deletion (Play-mandatory).** `supabase/migrations/008_delete_user_rpc.sql` adds `public.delete_user()` (SECURITY DEFINER): deletes the caller's `meal-photos/{uid}/...` storage objects, then the `auth.users` row, which **cascades** to all user data (profiles → meals/exercises/routines/sessions/daily_scan_counts and children). Profile → "Delete account" already calls `supabase.rpc("delete_user")`; the inaccurate "edge function" error copy was fixed + the real error is now logged. **→ You must run migration 008 (below).**
- **Permissions trimmed.** Removed the unused `RECORD_AUDIO` Android permission (no audio feature) and set `expo-camera` `recordAudioAndroidPermission: false`. Manifest now requests only `CAMERA` + `READ_EXTERNAL_STORAGE`.
- **Production build config present** (`mobile/eas.json`): `production` profile → **AAB** (no `buildType` ⇒ app-bundle, which Play requires), `autoIncrement: true` (versionCode bumps per build), `appVersionSource: "remote"`, and prod env baked in (`EXPO_PUBLIC_API_URL=https://yourstrat-production.up.railway.app`, Supabase URL + anon key).
- **App identity** (`mobile/app.json`): name "YourStrat", `android.package` `com.yourstrat.app`, `version` 1.0.0 / `versionCode` 1, dark theme, adaptive icon + splash, scheme `yourstrat`, EAS `projectId`/`owner` set.
- **No dev surfaces in prod:** `SetupEnvScreen` only renders when Supabase env is unset; production bakes it via eas.json, so it won't appear. API base resolves to the baked HTTPS URL on native (no localhost/Metro proxy in release).

---

## 🔧 Gate A — Brady action items to produce + upload an Internal-testing AAB

### Backend / data
- [x] **Run migration 008** in the Supabase SQL editor — **done (Brady, 2026-05-25)**. `public.delete_user()` now exists.
- [ ] **Verify deletion end-to-end** on a throwaway account (Profile → Delete account → confirm the row is gone in `auth.users` + data + the `meal-photos/{uid}/…` objects).
- [ ] **Confirm the production backend is live + keyed:** `curl https://yourstrat-production.up.railway.app/health` → `{"ok":true,...}`; Railway has `GEMINI_API_KEY` (Tier-1 billing), `GEMINI_MODEL=gemini-2.5-flash`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
- [ ] **Confirm the Supabase project + anon key in `eas.json`** (`nfwjmiauopafosltkbbq` / `sb_publishable_…`) is the intended production project and the `meal-photos` bucket exists (private).

### Build & signing
- [ ] **Play App Signing / keystore.** Let EAS manage the upload keystore (`eas build` creates one on first run) **or** supply your existing keystore. Decide once — the upload key must stay consistent across releases.
- [ ] **Build the AAB:** `cd mobile && eas build --profile production --platform android` → produces the `.aab`.
- [ ] **Create the app in Play Console** (package `com.yourstrat.app`), then upload the AAB to the **Internal testing** track (manually, or wire `eas submit` — see below).

### (Optional) automated submit
- [ ] `eas.json` → `submit.production.android` expects `./play-service-account.json` (a Play Console service-account JSON with the "Release manager" role) and `track: internal`. Provide that file (gitignored) to use `eas submit --profile production --platform android`. Otherwise upload the AAB by hand.

---

## 🔧 Gate B — required before Production / public release

### Verification (the real gate)
- [ ] **Device-verify the 14 `review` stories** on the Internal-testing build. Each has a checklist in `_bmad-output/implementation-artifacts/*.md`. Priorities:
  - **Scan still works** (3.4 touched the scan response — derived field only, but confirm a photo scan populates + the confidence whiskers render).
  - Active-session instrument (5.7) + tab takeover/badge (5.6, esp. tab-unmount-on-blur).
  - Workouts swipe rows + DayChips + inline RPE (5.8); Today hero/sparkline/meal rows (4.7); Nutrition heatmap + month scroll + day-detail modal (6.1–6.5); Profile hero + grouped account + AI stats (2.7); trial notice (4.8).
  - Flip each `review`→`done` in `sprint-status.yaml` as it passes.
- [ ] **Cold-start + crash check** on a real device (first launch, sign-up → onboarding → scan → log workout, sign out, delete account).

### Store listing assets — **draft copy ready: [docs/STORE_LISTING.md](docs/STORE_LISTING.md)**
- [ ] **App icon** — confirm `assets/logo/yourstrat-star.png` source is ≥1024×1024; provide the 512×512 hi-res icon for the listing.
- [ ] **Feature graphic** (1024×500) + **phone screenshots** (≥2; Today ring / Scan result / Workouts session / Nutrition trend).
- [ ] **Title / short / full description + release notes + category** — paste from `docs/STORE_LISTING.md` (fill contact email).

### Legal / compliance (Play will reject without these)
- [ ] **Privacy policy** — **draft ready: [docs/legal/PRIVACY_POLICY.md](docs/legal/PRIVACY_POLICY.md)**. Fill the brackets, confirm the analytics/crash-SDK line, host it (e.g. `yourstrat.xaeryx.com/privacy`), add the URL in Play Console.
- [ ] **Data safety form** — answer from the cheat-sheet in `docs/STORE_LISTING.md` (key row: meal **photos are *shared* with Google/Gemini**; email + health collected-not-shared; encrypted in transit; in-app deletion available).
- [ ] **Content rating** questionnaire (likely Everyone).
- [ ] **Target audience & ads** — not directed at children; declare no ads.
- [ ] **Health apps declaration** — if Play prompts one, complete it (no Health Connect integration today).

---

## Build commands (reference)

```bash
cd mobile
eas build --profile production --platform android       # -> signed AAB for Play
eas submit --profile production --platform android      # optional: needs play-service-account.json
# Internal/preview APK to sideload for the device pass:
eas build --profile preview-apk --platform android
```

## Notes / open
- `READ_EXTERNAL_STORAGE` kept for gallery picks; modern `expo-image-picker` uses the Android photo picker (no permission on Android 13+) — consider removing to minimize permissions **after** confirming gallery pick still works on a device.
- No OTA `runtimeVersion`/`expo-updates` set up — fine for v1; add later if you want EAS Update.
- versionCode 1 + `autoIncrement` → first build is 1, subsequent auto-bump.
