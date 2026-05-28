-- User-local "nutrition day" window: day resets at day_start_minutes after local midnight (default 02:00).
alter table profiles
  add column if not exists timezone text not null default 'UTC',
  add column if not exists day_start_minutes int not null default 120
    check (day_start_minutes >= 0 and day_start_minutes < 1440);
