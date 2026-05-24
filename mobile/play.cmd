@echo off
setlocal
cd /d "%~dp0"

REM YourStrat - one-click dev server.
REM Port 8888 chosen to avoid 8081 (Etsy OAuth callback + Metro default that
REM conflicts with other tools), Metro's 8082-8083 auto-fallback range, and
REM 8088 (another local dev server on this machine). Memorable.
REM
REM LAN mode (default): phone + desktop must be on the same WiFi network.
REM If you need cellular / different-network testing, switch to tunnel by
REM changing MODE_FLAGS below to "--dev-client --tunnel --port %PORT%" - but
REM tunnel requires a working @expo/ngrok account, which Expo SDK 51+ stopped
REM bundling. LAN is the path of least resistance for daily dev.
REM See CLAUDE.md "Running the dev server" for the full story.

set PORT=8888
set MODE_FLAGS=--dev-client --port %PORT%

REM --- Port-in-use check (uses PowerShell for a reliable check) ---
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
    echo.
    echo [play.cmd] Port %PORT% is already in use.
    echo Close whatever is using it, or change PORT at the top of this script.
    echo.
    pause
    exit /b 1
)

REM --- Get LAN IP so the phone knows where to connect ---
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    set LAN_IP=%%a
    goto :got_ip
)
:got_ip
set LAN_IP=%LAN_IP: =%

echo.
echo === YourStrat dev server ===
echo Port:  %PORT%
echo Mode:  Expo dev-client (LAN - phone must be on same WiFi as desktop)
echo LAN:   exp://%LAN_IP%:%PORT%
echo.
echo Phone: open YourStrat dev-client app, paste the exp:// URL above,
echo        or scan the QR code that Metro prints below.
echo Web:   press 'w' in this window once Metro is ready.
echo Stop:  Ctrl+C twice.
echo.

call npx expo start %MODE_FLAGS%

REM If we get here, expo exited - keep the window open so you can read the error.
echo.
echo [play.cmd] Dev server exited.
pause
