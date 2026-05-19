-- 7-day trial tracking on profiles
alter table profiles
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz;

-- Backfill existing users: trial from profile created_at
update profiles
set
  trial_started_at = coalesce(trial_started_at, created_at, now()),
  trial_ends_at = coalesce(trial_ends_at, coalesce(created_at, now()) + interval '7 days')
where trial_started_at is null or trial_ends_at is null;

-- Daily food scan counts for rate limiting
create table if not exists daily_scan_counts (
  user_id uuid not null references profiles(id) on delete cascade,
  scan_date date not null default (current_date),
  count int not null default 0 check (count >= 0),
  primary key (user_id, scan_date)
);

create index if not exists daily_scan_counts_user_date_idx
  on daily_scan_counts (user_id, scan_date desc);
