-- 008 — In-app account deletion RPC (Google Play / GDPR requirement).
--
-- WHY: Play Store policy requires apps that let users create an account to also
-- offer in-app account deletion that removes the account + associated data.
-- YourStrat's Profile → "Delete account" calls `supabase.rpc("delete_user")`,
-- which did not exist (the FE fell back to "contact support"). This adds it.
--
-- HOW: a SECURITY DEFINER function so an authenticated user can delete THEIR OWN
-- account in one call. Deleting the `auth.users` row cascades to `profiles` and
-- every user table — all FKs are ON DELETE CASCADE:
--   auth.users → profiles → meals → meal_items
--                         → exercises
--                         → routines → routine_exercises, routine_days
--                         → sessions → session_sets
--                         → daily_scan_counts
-- Meal photos in storage (meal-photos/{uid}/...) are NOT covered by the DB
-- cascade, so they're deleted explicitly first.
--
-- RUN: paste into the Supabase SQL editor (same as migration 007). The function
-- is owned by the running role (postgres), which can delete from auth.users +
-- storage.objects; callers run it with those privileges via SECURITY DEFINER.

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Meal photos (not covered by the DB cascade). Stored under "{uid}/...".
  delete from storage.objects
   where bucket_id = 'meal-photos'
     and name like uid::text || '/%';

  -- Cascades to profiles + all user data (see header).
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
