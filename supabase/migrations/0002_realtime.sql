-- ============================================================================
-- Live updates: publish tasks and trades over Supabase Realtime so household
-- members see each other's changes without reloading. Realtime applies the
-- same RLS policies to postgres_changes, so nobody receives rows they can't
-- read. Guarded so the migration also applies on a plain Postgres (tests).
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.tasks, public.task_trades;
  end if;
end $$;
