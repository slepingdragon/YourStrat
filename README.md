# YourStrat

Focused fitness coach: food scan, workouts, daily snapshot.

See [YOURSTRAT_BUILD.md](YOURSTRAT_BUILD.md) for the full spec.

## Setup

### Supabase

1. Create a project and run [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
2. Create private bucket `meal-photos` with per-user policies (see [supabase/README.md](supabase/README.md))
3. Configure auth redirect URLs: `yourstrat://` and `yourstrat://reset-confirm`

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# fill SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Mobile

```powershell
cd mobile
copy .env.example .env
# fill EXPO_PUBLIC_* vars; use LAN IP for API on device
npm install
npx expo start
```

### Deploy

- **Railway:** connect repo, set root to `backend`, env vars from `.env.example`
- **TestFlight:** `cd mobile && npx eas build --platform ios --profile production` (after `eas init`)

## Git workflow

From the repo root:

```powershell
git add -A
git commit -m "describe your change"
git push origin main
```

Do not commit secrets: `mobile/.env` and `backend/.env` are gitignored; use the `.env.example` files as templates.
