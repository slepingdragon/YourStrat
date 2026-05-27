# Session Handoff — resume on desktop (2026-05-27)

> Open this after `git pull` on the desktop, then paste the block in **§A** into Claude Code.
> The most important thing: **`origin/main` is now the LOVED ("classic") version.** Sync to it first so you are never editing an old version again.

---

## A. Paste this into Claude Code on the desktop

```
Resume YourStrat. Read SESSION_HANDOFF.md and CLAUDE.md fully before doing anything.

CRITICAL — get on the loved version first:
- `origin/main` is the LOVED "classic" design (commit 56b3685). That is the one I want.
- On this desktop, run: `git fetch origin`, then `git checkout main`, then `git reset --hard origin/main`.
  (If there is local work I care about, ask me before the reset.)
- Do NOT use the `new-design` branch — that is the OTHER (newer) design I rejected. It is kept only as a backup.

Then confirm: `git log --oneline -1` shows 56b3685, and `mobile/app/(tabs)/profile.tsx` has NO `useT(`/i18n (hardcoded English = correct loved version).

Primary goal this session: build a Play-Store-ready signed AAB locally (no EAS — out of credits). See §C.
Secondary goal: the feature backlog in §D, on the loved version.

Before running `npx expo prebuild --platform android`, STOP and confirm with me (it generates mobile/android/). Then proceed.
```

---

## B. What happened last session (so you have the story)

- This desktop was found **62 commits behind** GitHub. I synced it forward to the newer design, the user **disliked it**, and asked to revert to the loved older design and make it the live line.
- Result, all on GitHub now (nothing lost):
  - `origin/main` = `origin/classic` = **loved design** (56b3685 = original `a1c2f39` + a per-item-delete commit).
  - `origin/new-design` = the rejected newer design (cbfa459, 62 commits). **Backup only.**
  - Undo the whole thing (restore newer design as main): `git push --force origin new-design:main`.
- Railway auto-deploys the backend from `main`, so the **live backend is now the loved version** (health verified up, no outage). Per-item meal delete is therefore live and working.

## C. Build a signed AAB locally (primary goal)

Step 0 — verify the toolchain (the machine that ran last session had JDK 17 + Android SDK; a different desktop may not). Check, and install what's missing:
```powershell
java -version                       # need 17.x; if missing: winget install Microsoft.OpenJDK.17
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" version   # SDK present?
echo "JAVA_HOME=$env:JAVA_HOME  ANDROID_HOME=$env:ANDROID_HOME"
```
If the Android SDK is missing, install it (Android Studio, or `cmdline-tools` + `sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"`). Set `JAVA_HOME` to the JDK 17 path and `ANDROID_HOME` to the SDK path (`setx` for permanence), or at least export them for the build session. Restart the shell after `setx`.

Steps:
1. `npx expo prebuild --platform android` in `mobile/` — generates `mobile/android/` (git-ignored). **Confirm with the user before running.**
2. Signing key for the AAB:
   - To **update the EXISTING Play listing**, the AAB must be signed with the upload key Google expects. The listing was built by EAS, so the upload keystore lives in EAS — download it with `eas credentials` (Android → download keystore). Credential *viewing/download* does not consume build credits.
   - If starting a fresh listing instead, generate a new keystore: `keytool -genkeypair -v -keystore yourstrat-upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000`.
   - Wire it into `android/app/build.gradle` (`signingConfigs.release`) via a `keystore.properties` (keep it OUT of git).
3. Bump `app.json` → `expo.android.versionCode` (currently **1**) to a higher number, or Play will reject the upload as a duplicate.
4. Build: `cd mobile/android && .\gradlew bundleRelease` → output at `mobile/android/app/build/outputs/bundle/release/app-release.aab`. First build is slow (~10–20 min).
5. Upload the AAB at Google Play Console → your app → new release (internal testing track is easiest first).
6. iOS App Store is **not buildable on Windows** (needs a Mac/Xcode) — out of scope here.

Sanity APK alternative (to install/test on the phone over USB without the store): `.\gradlew assembleRelease` → `app/build/outputs/apk/release/`.

## D. Feature backlog (build on the loved version)

1. **Item-delete** — DONE and live (trash button on each `FoodItemNutritionCard`, `DELETE /meals/{meal_id}/items/{item_id}`, recomputes meal totals, deletes meal when last item removed). Present on saved meals and the scan-confirm screen.
2. **Simplify "Edit your details"** (`mobile/app/(tabs)/profile.tsx`) — user wants "one-click, easy, accessible." It's already collapsible; the expanded form is a long full re-entry. Three mocked layouts to pick from: **tap-to-edit rows (recommended)**, compact form, or essentials+more. *User hadn't chosen yet — ask.*
3. **Healthy vs added sugar** — APPROVED. Add `added_sugar_g` to `meal_items` + `total_added_sugar_g` to `meals` (migration **007** — this branch only has 001–006). Update the Gemini prompt (`backend/app/prompts/food_scan.py`) to estimate added sugar (≤ total sugar; whole foods → 0). Daily added-sugar limit = **AHA by sex (36g male / 25g female)** using the profile's `sex`. Show natural-vs-added split on items + summary and an added-sugar budget on Today. Estimate is rough → keep it editable on the scan-confirm screen. Old meals show 0.
4. **Portion-eaten slider** per item — a fun, visual slider (default 100%/as-scanned) that rescales that item's metrics, with an icon to its right showing how much is left/eaten. Optional feature. For SAVED meals it needs a `portion_fraction` column + recompute; for pre-save it's local math. Slider: build custom with the existing reanimated/gesture-handler (no new dependency) OR ask before adding a slider library.
5. **Photo + AI-outline highlights** — biggest one. Show the meal photo with outlines/boxes of what the AI detected; a photo preview step right after a scan before the items list; a **settings toggle, OFF by default**. Gemini can return bounding boxes — extend the prompt + store boxes + render an SVG overlay. Boxes won't be pixel-perfect; frame as visual-accuracy aid. Scope it on its own before building.

Overall design philosophy the user wants: **one-click, simple, accessible.**

## E. Constraints & gotchas (loved version)

- **No i18n in this version** — copy is hardcoded English. Match that; do not add `t()`/`useT`.
- **DB migrations** go up to `006`; next new one is `007`. (The `new-design` branch separately has 007–009 — different lineage, ignore.)
- **No EAS build credits** — build locally only.
- **Backend = Railway, deploys from `main`** (`git push` to main auto-deploys prod, which serves the live app). Test backend changes carefully; a local uvicorn (`backend/.venv`, port 18000) avoids touching prod.
- **CLAUDE.md is binding** (premium feel, 60fps, one theme from `mobile/theme`, real backend wiring, type-check before "done", ask before new routes/deps/schema/build-config). Scope guard in `YOURSTRAT_BUILD.md §2` still applies.
- **Published store binary is unchanged** by git/Railway — users only get the loved version once a new AAB is built (§C) and submitted.

## F. Dev loop (view on phone + hot reload)

Expo Go over USB + scrcpy (no EAS, no emulator). The S26 Ultra (`R5GYC4D2FXZ`) connects over USB; Expo Go is installed.

```powershell
# adb lives here (not on PATH); set ANDROID_HOME for the session
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# 1) Start Metro from mobile/
cd mobile; npx expo start --port 8081

# 2) Bridge USB + launch Expo Go on the phone
& $adb reverse tcp:8081 tcp:8081
& $adb shell am force-stop host.exp.exponent
& $adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

Notes: after a Metro restart, force-stop + relaunch Expo Go (it won't auto-reconnect). The phone has **Reduced motion ON** — turn it off (Settings → Accessibility) to judge animations. JS/UI edits hot-reload in ~1s; the app talks to the Railway backend via `EXPO_PUBLIC_API_URL`.

Type-check before claiming done: `cd mobile; npx tsc --noEmit`.
