# Supabase setup

1. Create a new project at https://supabase.com
2. Run `supabase/migrations/001_init.sql` in the SQL editor
3. Run `supabase/migrations/002_storage.sql` (bucket + policies)
4. Run `supabase/migrations/003_routine_schedule.sql` (routine day-of-week schedule)
5. Run `supabase/migrations/004_trial.sql` (7-day trial columns + daily scan counts)

### If SQL Editor shows `ECONNREFUSED` / `connect ECONNREFUSED …:5432`

That means the dashboard could not reach your database — not a syntax error in the migration.

1. **Project status** — Dashboard → project home. If it says **Paused**, click **Restore project** and wait 1–2 minutes.
2. **New project** — If you just created it, wait until status is **Active** (not still provisioning).
3. **Smoke test** — In SQL Editor run only: `select 1;`  
   - If that also fails with `ECONNREFUSED`, fix connectivity before running `001_init.sql`.
4. **Network** — Try another network, disable VPN, or use a mobile hotspot (some networks block IPv6 to Supabase).
5. **Browser** — Hard refresh or try an incognito window; check https://status.supabase.com
6. **CLI fallback** (optional):
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

After `select 1;` works, paste and run the full `001_init.sql`, then `002_storage.sql`.

### Partial run

If a previous attempt created some tables, you may see `relation already exists`. Either drop those tables in the Table Editor and re-run, or create a fresh Supabase project.

---

4. Auth → URL Configuration:
   - Site URL: `yourstrat://`
   - Redirect URLs: `yourstrat://reset-confirm`
5. Copy keys to `backend/.env` and `mobile/.env` (Settings → API)
