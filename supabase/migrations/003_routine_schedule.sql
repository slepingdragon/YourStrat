-- Day-of-week schedule for routines (0=Sun .. 6=Sat)
create table routine_days (
  routine_id uuid not null references routines(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  primary key (routine_id, day_of_week)
);

alter table routine_days enable row level security;

create policy "Users manage routine_days for own routines"
  on routine_days for all
  using (
    exists (
      select 1 from routines r
      where r.id = routine_days.routine_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from routines r
      where r.id = routine_days.routine_id and r.user_id = auth.uid()
    )
  );
