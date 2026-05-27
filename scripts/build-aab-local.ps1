<#
  build-aab-local.ps1 — produce a Play-ready, release-signed .aab locally (no EAS, no quota).

  WHY THIS EXISTS (desktop only): on this machine the Android SDK/NDK lives under
  "C:\Users\Brady J Bania\..." and the space breaks the native C++ link (clang gets
  called via its 8.3 short name CLANG_~1 and links in C mode). The fix is to build from
  genuinely space-free paths: a C:\dev\YourStrat copy + a synthetic C:\dev\android-sdk
  that junctions the real SDK but holds a REAL copy of the NDK. On the laptop
  (C:\Users\bania, no space) you don't need any of this — just build in mobile\android.

  SIGNING: uses the upload keystore at C:\Users\Brady J Bania\keystores\yourstrat-upload.jks,
  referenced via keystore.properties (loaded by android\app\build.gradle). Back that .jks
  + its password up — it signs every future update of the app.

  PREREQS (already set up 2026-05-26): C:\dev\YourStrat, C:\dev\android-sdk (NDK real-copied),
  the keystore + keystore.properties, and the release signingConfig in
  C:\dev\YourStrat\mobile\android\app\build.gradle. If you re-run `expo prebuild` the
  signing edit in build.gradle is regenerated away — re-apply it (release signingConfig +
  buildTypes.release.signingConfig = signingConfigs.release).

  IF YOU CHANGED APP CODE since the C:\dev copy was made, re-sync source first (safe, additive):
    robocopy "C:\Users\Brady J Bania\Desktop\ADEV\YourStrat\mobile" "C:\dev\YourStrat\mobile" /E /XD node_modules android\build android\app\build android\.cxx .expo .gradle

  USAGE:  powershell -ExecutionPolicy Bypass -File scripts\build-aab-local.ps1 [-AllAbis]
    -AllAbis  also build armeabi-v7a (32-bit) for broader device support. Default is arm64-v8a only.
#>
param([switch]$AllAbis)
$ErrorActionPreference = "Stop"

$work    = "C:\dev\YourStrat\mobile\android"
$sdk     = "C:\dev\android-sdk"
$jbr     = "C:\Program Files\Android\Android Studio\jbr"
$props   = "C:\Users\Brady J Bania\keystores\yourstrat-keystore.properties"
$abis    = if ($AllAbis) { "arm64-v8a,armeabi-v7a" } else { "arm64-v8a" }

foreach ($p in @($work,$sdk,$jbr,$props)) {
  if (-not (Test-Path $p)) { throw "Missing prerequisite: $p  (see header — rerun the one-time setup)" }
}

# Space-free SDK + JBR java; prod env so the JS bundle bakes the live backend (matches eas.json).
$env:JAVA_HOME              = $jbr
$env:ANDROID_HOME           = $sdk
$env:ANDROID_SDK_ROOT       = $sdk
$env:EXPO_PUBLIC_API_URL    = "https://yourstrat-production.up.railway.app"
$env:EXPO_PUBLIC_SUPABASE_URL = "https://nfwjmiauopafosltkbbq.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_vO5O9PC27ZPL3-RF2ybx2w_iaEMghsj"

Write-Host "Building AAB ($abis) ..." -ForegroundColor Cyan
Push-Location $work
try {
  & ".\gradlew.bat" bundleRelease "-PreactNativeArchitectures=$abis"
  if ($LASTEXITCODE -ne 0) { throw "gradle bundleRelease failed (exit $LASTEXITCODE)" }
} finally { Pop-Location }

$aab = Join-Path $work "app\build\outputs\bundle\release\app-release.aab"
if (-not (Test-Path $aab)) { throw "Build reported success but AAB not found at $aab" }

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$dst = "C:\Users\Brady J Bania\Desktop\YourStrat-$stamp.aab"
Copy-Item $aab $dst -Force
Write-Host "AAB ready: $dst" -ForegroundColor Green
Write-Host "Reminder: each Play upload needs a higher versionCode (bump mobile\app.json android.versionCode)."
