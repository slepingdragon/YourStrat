# Session Handoff — YourStrat (2026-05-27)

> Read this + CLAUDE.md before acting. Trim/delete once absorbed.

## TL;DR
`origin/main` is the **loved "classic"** version. This session ported the *design-agnostic*
work from the rejected `origin/new-design` back onto it — backend, release, and feature work —
**without** the visual redesign you rejected. **MERGED to `main` + pushed** (Railway redeployed
the backend); **versionCode bumped to 2**; a **signed release AAB was built**
(`~/Desktop/YourStrat-20260527-1704.aab`, 28.9 MB, upload-keystore signed). Brady chose to skip
device verification and test via the store download. **Remaining to ship:** deploy `site/` so the
privacy URL is live, then upload the AAB + fill App content in Play Console (see below). Type-checks
+ backend scan tests pass; not device-verified by design.

## What's on the branch (11 commits, +3634/-192, 45 files)
1. **Account deletion** (Play-mandatory) — migrations 007-009 + app.json permission trim. The
   FE already called `rpc("delete_user")`; the DB fn was missing. **Migrations 007-009 were
   already run on the live Supabase last session — do NOT re-run.**
2. **Scan-accuracy backend** — `gemini.py` structured outputs + accuracy prompt + `gemini-2.5-flash`.
   Loved had the older, less-accurate scan. (8 backend tests pass.)
3. **Public site + release docs** — `site/` (privacy + delete-account pages for Play) + store docs.
   Audited: no private-`xaeryx.com` links (only the `yourstrat.xaeryx.com` subdomain).
4. **API resilience** — retry idempotent GETs on cold-start 5xx, request timeout, diagnostic
   logging, quiet expected 404s. (Skipped the backend PGRST303 retry — needs `safe_single`,
   which the classic version predates.)
5. **Dev/build tooling** — `mobile/play.cmd` (8888 launcher), `scripts/build-aab-local.ps1`,
   `.githooks/` token-drift guard (see below), `.gitignore` android/ios.
6. **Barcode scanning** — Open Food Facts lookup (`backend/app/services/barcode.py` + route),
   camera detect → confirm popup → review. No new deps.
7. **Multi-scan queue** — keep shooting; results pile in an **app-wide ScanQueueBar** (you
   approved app-wide this session). `scanQueueStore` + bar + discard dialog.
8. **Confidence whiskers** — per-macro uncertainty on the scan-result card; `ScanResult` schema.
9. **i18n (scoped: infra + setup + scan)** — `lib/i18n.ts` engine + persisted Profile language
   toggle (EN / Bahasa Indonesia); setup flow (onboarding/login/signup) + scan flow translated.
   **Today / Nutrition / Workouts / rest of Profile + shared nutrient labels are NOT translated**
   (English via fallback) — the documented follow-up pass.

## ⚠ The pre-commit guard is ACTIVE
`.githooks/` is wired via `git config core.hooksPath .githooks` (set in this repo's git config
from prior sessions). It blocks **new** raw hex / non-token padding+margin / AI-commentary copy
in staged `mobile/**` files. Don't `--no-verify`; fix to theme tokens. (It caught + I fixed
several literals this session.)

## Gates before any of this goes live
- **Merging `port/new-design-features` → `main` triggers a Railway PROD deploy** of the new
  backend (scan accuracy, barcode, account-deletion route, ScanResult). The published store
  binary is unaffected until a new AAB is built + submitted.
- **Device-verify the branch first** (the real gate): signup → onboarding (try the language
  toggle → Indonesian) → scan a meal (photo + barcode) → multi-scan queue → save → delete account.
- **Indonesian is best-effort** — wants a fluent proofread; only setup + scan are translated.
- Rejected design is safe on `origin/new-design`; restore it as main with
  `git push --force origin new-design:main` if ever wanted.

## Recommended next steps
1. Device-verify the branch (above). Fix anything that breaks.
2. Merge to `main` → Railway redeploys the improved backend. Push.
3. Optionally continue i18n (Today/Nutrition/Workouts) — see commit `4332ffd`/`92db511`/`8dda4b8`
   for the pattern (wrap classic copy in `t()`, EN dict value MUST equal loved's exact copy).
4. The **§A feature backlog** below (separate from the port) is still pending.
5. Build the AAB (§B) when ready to ship the loved version to Play.

## A. Feature backlog (still pending — separate from the port)
1. **Simplify "Edit your details"** (`profile.tsx`) — "one-click, easy, accessible." Three mocked
   layouts: tap-to-edit rows (recommended), compact form, essentials+more. *Ask which.*
2. **Healthy vs added sugar** — APPROVED. `added_sugar_g` on `meal_items` + `total_added_sugar_g`
   on `meals` (**next migration = 010** now that 007-009 are ported). Gemini prompt estimates
   added sugar (≤ total; whole foods → 0). Daily limit = AHA by sex (36g M / 25g F). Editable on
   the scan-confirm screen; old meals show 0.
3. **Portion-eaten slider** per item (default 100%) — rescales metrics. Saved meals need a
   `portion_fraction` column; pre-save is local math. Custom slider (no new dep) or ask.
4. **Photo + AI-outline highlights** — biggest; settings toggle OFF by default. Scope on its own.

Design philosophy: **one-click, simple, accessible.**

## B. Build a signed AAB locally (no EAS credits)
Step 0 — toolchain: `java -version` (need 17; `winget install Microsoft.OpenJDK.17`),
`& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" version` (SDK present?). Set
`JAVA_HOME`/`ANDROID_HOME` (`setx`, restart shell). Or use `scripts/build-aab-local.ps1`.
1. `npx expo prebuild --platform android` in `mobile/` (generates git-ignored `mobile/android/`).
   **Confirm before running** (CLAUDE.md §8: build-config).
2. Signing: to update the EXISTING listing, download the EAS upload keystore via `eas credentials`
   (Android → download; viewing doesn't burn credits). Wire into `android/app/build.gradle` via a
   `keystore.properties` kept OUT of git. Fresh listing? `keytool -genkeypair ...`.
3. Bump `app.json` → `expo.android.versionCode` (currently **1**).
4. `cd mobile/android && .\gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`.
5. Upload at Play Console (internal testing first). Privacy URL = `https://yourstrat.xaeryx.com/privacy`
   (deploy `site/` to Vercel first — see `site/README.md`). iOS needs a Mac — out of scope.

## C. Dev loop (phone + hot reload)
Preferred: **`mobile/play.cmd`** (now on this branch) — port 8888, LAN dev-client. Per-machine
setup: desktop shortcut + `:8888` firewall rule. Phone + desktop on same WiFi.
Alt (USB, no launcher): `cd mobile; npx expo start --port 8081`, then
`& $adb reverse tcp:8081 tcp:8081` (adb at `$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe`).
Type-check before "done": `cd mobile; npx tsc --noEmit`. Backend tests need a dummy env:
`$env:SUPABASE_URL="http://localhost"; $env:SUPABASE_SERVICE_KEY="x"` then pytest from `backend/`.

Canonical cross-chat context: `~/.claude/CONTEXT.md`.
