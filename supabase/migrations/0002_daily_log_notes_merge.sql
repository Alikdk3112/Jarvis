-- ═════════════════════════════════════════════════════════════════════
-- Atomic shallow-merge into os_daily_logs.notes
--
-- The app used to read the row, spread the patch over it in JS, and write
-- the whole `notes` object back. Habits, nutrition, goals and the finance
-- cron all write the same row, so two of those overlapping dropped one
-- module's keys — the last writer won with a stale copy of everyone else.
--
-- `jsonb ||` does the same shallow merge Postgres-side, inside the upsert,
-- so concurrent writers to different top-level keys no longer clobber.
-- ═════════════════════════════════════════════════════════════════════

create or replace function public.merge_os_daily_log_notes(
  p_user_id  text,
  p_log_date date,
  p_patch    jsonb
)
returns public.os_daily_logs
language sql
as $$
  insert into public.os_daily_logs as dl (user_id, log_date, notes, updated_at)
  values (p_user_id, p_log_date, p_patch, now())
  on conflict (user_id, log_date) do update
    set notes      = dl.notes || excluded.notes,
        updated_at = now()
  returning dl.*;
$$;
