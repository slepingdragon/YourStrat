# SESSION HANDOFF — desktop → laptop (2026-05-26)

> The next Claude session (on the laptop) should read this top-to-bottom before acting, then
> trim/delete it once absorbed. It's committed to git on purpose — that's how this reaches the
> laptop. The `~/.claude` memory and the desktop `C:\dev` build workspace do **not** travel.

## TL;DR
On the desktop I produced a working **local release APK** despite EAS being quota-blocked. The build
fight that consumed the session was caused by the **space in the desktop's user path
(`C:\Users\Brady J Bania`)** — and your **laptop user path is `C:\Users\bania` (no space), so this
bug does NOT apply on the laptop.** On the laptop a normal build should just work.

---

## Read this before trying to build on the laptop
- **`mobile/android/` is gitignored** and does NOT travel via git. After `git pull`, it won't exist
  on the laptop. A native build needs it regenerated: `npx expo prebuild --platform android` in
  `mobile/` — **ask Brady before running it** (CLAUDE.md §8: build-config change). It was already
  run once on the desktop.
- **You usually don't need a native build at all.** Everything shipped recently (multi-scan queue,
  EN/ID i18n, scan-accuracy fix) is JS/TS — the dev-client + Metro (`mobile/play.cmd`, port 8888,
  LAN) hot-reloads it. That's the right tool for the **device-verify pass**, which is the real blocker.
- If you DO build on the laptop: PATH `java` may be the wrong version — use Android Studio's JBR or
  the winget JDK 17. Laptop SDK is at `C:\Users\bania\AppData\Local\Android\Sdk` (no space → no NDK
  bug). `gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` (S24 = arm64) should link fine.

## The desktop-only build gotcha (context, NOT a laptop problem)
On the desktop, `gradlew assembleRelease` fails at the native link with a wall of `libc++` undefined
symbols and `CLANG_~1: error: linker command failed`. Cause: the NDK lives under
`C:\Users\Brady J Bania\…`; the space makes CMake call `clang++.exe` via its 8.3 short name
`CLANG_~1.EXE`, so clang links in **C mode** and drops the C++ runtime. The desktop workaround was to
build from space-free paths: a `C:\dev\YourStrat` copy + a synthetic `C:\dev\android-sdk` that
junctions the real SDK but holds a **real-copied NDK**. Full recipe is in desktop agent memory
`project_local_android_build_2026_05_25.md`. Permanent desktop fix would be reinstalling the SDK to
`C:\Android\Sdk`. **None of this is needed on the laptop.**

---

## Where the release stands
- **APK (desktop only):** `C:\Users\Brady J Bania\Desktop\yourstrat-arm64-release.apk` — `com.yourstrat.app`
  v1.0.0, arm64-v8a, prod env baked (Railway + prod Supabase), debug-signed (sideload-only, not a Play upload).
- **Device-verify (the gate):** install on the S24, walk signup → onboarding → scan meal → save →
  log workout → Profile→Language toggle → delete account. A lot shipped unverified.
- **Backend:** live + keyed (`/health` ok). **Privacy site:** live (https://yourstrat.xaeryx.com/privacy → 200).
- **Account deletion:** done (migrations 008 + 009; `supabase/migrations/009_delete_user_no_storage.sql`).
- **i18n:** Today / Nutrition / Workouts translated in recent commits (older "pending" memory note is stale).
  Indonesian is best-effort; wants a fluent proofread; not device-verified.
- **Play remaining:** EAS quota (~resets Jun 1, or upgrade) → AAB `eas build --profile production --platform android`
  (let EAS own the upload keystore, never rotate) → create `com.yourstrat.app` → Internal testing →
  store assets (512² icon, 1024×500 feature, ≥2 screenshots, contact email in `docs/STORE_LISTING.md`)
  → Data safety form (meal photos shared w/ Google/Gemini) → privacy URL above. **Apple** later: fill
  `mobile/eas.json` → submit.production.ios placeholders.

## Open decision for Brady (desktop)
Keep the ~6 GB `C:\dev` workspace (fast ~3-min rebuilds) or delete it
(`Remove-Item C:\dev\YourStrat, C:\dev\android-sdk -Recurse -Force`; junctions delete safely, real SDK untouched).

## Machine-switch checklist (per global CLAUDE.md)
On the laptop: `git pull` (gets this file), `npm install` in `mobile/` if `package-lock.json` changed,
re-create the `YourStrat Dev` desktop shortcut (per-machine, doesn't sync), re-add the Metro :8888
firewall rule, confirm `play.cmd` boots + Expo Go connects.

## Uncommitted in the working tree (not from this session)
`site/index.html`, `site/privacy.html` are modified — pre-existing, left untouched. This handoff +
the CLAUDE.md pointer are the only things I'm committing.

---
Canonical cross-chat context: `~/.claude/CONTEXT.md`.
