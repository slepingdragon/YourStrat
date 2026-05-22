# YourStrat dev: free ports 18000/18081-18083, start API + Expo web (fresh Metro).

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Mobile = Join-Path $Root "mobile"
$python = Join-Path $Backend ".venv\Scripts\python.exe"
$envFile = Join-Path $Mobile ".env"
$ApiPort = 18000
$ExpoPort = 18081

if (-not (Test-Path $python)) {
    Write-Error "Backend venv not found at $python. Run: cd backend; python -m venv .venv; pip install -r requirements.txt"
}

if (-not (Test-Path $envFile)) {
    Write-Error "Missing mobile/.env - copy mobile/.env.example and fill Supabase keys + EXPO_PUBLIC_API_URL=http://127.0.0.1:18000"
}

function Stop-ListenersOnPort([int]$Port) {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        $procId = $c.OwningProcess
        if ($procId -gt 0) {
            Write-Host "  Stopping PID $procId on port $Port"
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}

function Wait-ApiHealth([int]$Seconds = 45) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri "http://127.0.0.1:18000/health" -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -eq 200 -and $r.Content -match '"ok"\s*:\s*true') { return $r.Content }
        } catch { }
        Start-Sleep -Milliseconds 400
    }
    return $null
}

function Wait-ExpoWeb([int]$Port, [int]$Seconds = 120) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    $root = "http://127.0.0.1:$Port/"
    $proxyHealth = "http://127.0.0.1:$Port/api/health"
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $root -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200) {
                try {
                    $h = Invoke-RestMethod -Uri $proxyHealth -TimeoutSec 3
                    if ($h.ok -eq $true) { return $true }
                } catch { }
            }
        } catch { }
        Start-Sleep -Seconds 2
    }
    return $false
}

Write-Host "YourStrat - preparing dev servers..."
Write-Host "  API:          http://127.0.0.1:18000"
Write-Host "  Expo web:     http://127.0.0.1:$ExpoPort"
Write-Host "  Proxy health: http://127.0.0.1:$ExpoPort/api/health"
Write-Host ""

Write-Host "Freeing ports 18000, 18081, 18082, 18083 (stale Metro/API)..."
Stop-ListenersOnPort 18000
Stop-ListenersOnPort 18081
Stop-ListenersOnPort 18082
Stop-ListenersOnPort 18083
Start-Sleep -Seconds 1

Write-Host "Starting backend..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Backend'; & '$python' -m uvicorn app.main:app --host 0.0.0.0 --port $ApiPort --reload"
)

Write-Host "Waiting for API /health..."
$healthBody = Wait-ApiHealth
if (-not $healthBody) {
    Write-Warning "API did not respond on http://127.0.0.1:18000/health within 45s. Check the backend terminal."
} else {
    Write-Host "API is up: $healthBody"
}

Write-Host "Starting Expo web (port $ExpoPort, --clear for Metro proxy + .env)..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Mobile'; `$env:EXPO_NO_TELEMETRY='1'; npx expo start --web --port $ExpoPort --clear"
)

Write-Host "Waiting for Expo + /api/health proxy (up to 2 min)..."
if (Wait-ExpoWeb $ExpoPort) {
    Write-Host "Expo web and API proxy are up."
} else {
    Write-Warning "Expo or /api/health not ready yet - check the Expo terminal (Metro must load metro.config.js)."
}

Write-Host ""
Write-Host "=== Ready ==="
Write-Host "  App:              http://127.0.0.1:$ExpoPort/login"
Write-Host "  Proxy health:     http://127.0.0.1:$ExpoPort/api/health"
Write-Host "  API health:       http://127.0.0.1:18000/health"
Write-Host "  API docs:         http://127.0.0.1:18000/docs"
Write-Host ""
Write-Host "Stop old Expo terminals first if you still see connection errors, then re-run this script."
Write-Host "Or: Terminal -> Run Build Task -> YourStrat: Mobile Preview"
Write-Host 'Tip: EXPO_PUBLIC_API_URL in mobile/.env must be http://127.0.0.1:18000 (not localhost).'
