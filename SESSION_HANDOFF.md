# Session Handoff — laptop → desktop (2026-05-23)

Switched machines mid-Android-Studio setup. Open this file on the desktop after `git pull`, then paste the block below into Claude Code. The detail section after is just for your reference.

---

## Paste this into Claude Code on the desktop

```
/bmad-help

Quick orientation — I switched from laptop to desktop. Pick up where we left off.

Where we are: mid-setup of Android Studio for YourStrat. End-state we want is "press Run in Android Studio → app installs on AVD → it talks to the Railway backend (https://yourstrat-production.up.railway.app)". JS/TS edits hot-reload via Metro after that; only native changes need a rebuild.

Done on laptop (not transferable to desktop): installed Microsoft.OpenJDK.17 via winget. Everything else needs to be redone here.

To do on desktop, in order:
1. Toolchain check: `java -version` (need JDK 17), `adb version`, `$env:ANDROID_HOME`, `$env:JAVA_HOME`. If JDK 17 missing: `winget install Microsoft.OpenJDK.17`. If Android SDK missing or in a non-default path, find it (typically `%LOCALAPPDATA%\Android\Sdk`).
2. Set permanent env vars: `setx ANDROID_HOME "<sdk>"`, `setx JAVA_HOME "<jdk17>"`, and add `%ANDROID_HOME%\platform-tools` + `%ANDROID_HOME%\emulator` to user PATH. Restart PowerShell.
3. Verify in a fresh shell: `adb devices` works, `java -version` reports 17.x.
4. STOP and ask me before running `npx expo prebuild --platform android` in `mobile/`. It generates the `mobile/android/` folder (~50 native files) and is a meaningful one-way change.
5. After prebuild: open `mobile/android/` in Android Studio → wait for Gradle sync → press Run on an AVD.

Two things to ignore:
- The "Cannot find native module 'ExpoSecureStore'/'ExpoCrypto'" errors I showed last session were from a DIFFERENT project (`C:\Users\bania\Desktop\ember-pod\autopod-app`), not YourStrat. YourStrat doesn't depend on expo-secure-store. Don't try to "fix" them in YourStrat.
- The working tree may show hundreds of modified BMad files (`.agents/skills/bmad-*`, `.claude/skills/bmad-*`, `_bmad/*`). They are LF→CRLF line-ending noise only — `git diff -w` returns empty. Leave them alone or run `git checkout -- .agents .claude _bmad`.

Backend stays on Railway. Android Studio's Run button only builds/installs the app — backend redeploys via `git push`.

Confirm you've read this, run a quick toolchain check, and tell me what JDK and SDK state the desktop is in before we touch anything else.
```

---

## Detail (reference, not part of the prompt above)

### Repo state at handoff

- Branch: `main`, in sync with `origin/main` apart from this `SESSION_HANDOFF.md`.
- Modified files in working tree (LF→CRLF only, no content diff — confirmed with `git diff -w`):
  - `.agents/skills/bmad-*/**`
  - `.claude/skills/bmad-*/**`
  - `_bmad/_config/*`, `_bmad/bmm/*`, `_bmad/core/*`, `_bmad/scripts/*`, `_bmad/config.toml`, `_bmad/config.user.toml`
- Untracked `.bak` files in `_bmad/` (cruft from a BMad customize step).
- None of the above were committed — they aren't real changes.

### Laptop toolchain audit (what we found, for comparison with desktop)

| Component | Laptop status |
|---|---|
| Android SDK | `C:\Users\bania\AppData\Local\Android\Sdk` — complete (platform-tools, platforms, build-tools, emulator, cmdline-tools). |
| `adb` | Works at `<sdk>\platform-tools\adb.exe`. **Not on PATH.** |
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | Empty. |
| Android Studio | `C:\Program Files\Android\Android Studio`. |
| Bundled JBR | JDK 21 (AGP 8 supports it, Expo prefers 17). |
| AVDs | `Medium_Phone`, `Pixel_2`, `Pixel_9_Pro`. |
| System Java on PATH | JDK 1.8 (Java 8) — wrong version, why we needed to install 17. |
| JDK 17 | Installed via `winget install Microsoft.OpenJDK.17` (exit 0). |

The desktop likely has a different set — re-run the audit there before anything else.

### Decisions already made

- **Stay on Railway** for the dev build's backend URL. We did not wire a local-uvicorn toggle.
- **Goal is the "press play" workflow** — i.e. generate `mobile/android/`, open in Android Studio, run on AVD. Not just terminal `expo run:android`.
- **Use JDK 17, not the Android Studio bundled JDK 21** — to stay on Expo's officially supported path.
- **Set env vars permanently with `setx`**, not session-only.

### What NOT to do

- Don't commit the CRLF noise.
- Don't run `expo prebuild` without re-confirming with me — per repo CLAUDE.md §8, build-config changes need approval, and prebuild is the biggest one.
- Don't touch `mobile/babel.config.js`, `mobile/metro.config.js`, `mobile/app.json` plugin list without asking.
- Don't try to "fix" the ember-pod ExpoSecureStore errors inside YourStrat — they aren't from this app.

### Commands you'll actually use (desktop)

```powershell
# Toolchain check
java -version
adb version
echo "ANDROID_HOME=$env:ANDROID_HOME  JAVA_HOME=$env:JAVA_HOME"

# Install JDK 17 if missing
winget install Microsoft.OpenJDK.17 --silent --accept-source-agreements --accept-package-agreements

# Set env vars permanently (replace paths with what `Test-Path` confirmed)
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
# Then close + reopen PowerShell

# Add to user PATH (run in fresh PS after setx above)
$user = [Environment]::GetEnvironmentVariable("Path","User")
$add  = "$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator"
if ($user -notlike "*$add*") { [Environment]::SetEnvironmentVariable("Path","$user;$add","User") }

# After restart of shell:
adb devices
emulator -list-avds
```
