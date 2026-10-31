-- Replays the TypeScript-generated fixture (tests/recurrence.test.ts) through
-- the SQL recurrence engine; both implementations must agree date for date.
\set cases `cat "$FIXTURE"`
select set_config('t.cases', :'cases', false) \g /dev/null
do $$
declare
  v_case jsonb;
  v_rule jsonb;
  c public.chores;
  d date;
  v_sql date[];
  v_ts date[];
begin
  for v_case in select * from jsonb_array_elements(current_setting('t.cases')::jsonb) loop
    v_rule := v_case -> 'rule';
    c.freq := (v_rule ->> 'freq')::public.recurrence_freq;
    c.every := (v_rule ->> 'every')::int;
    c.by_weekday := array(select jsonb_array_elements_text(v_rule -> 'byWeekday')::smallint);
    c.mode := 'fixed';
    c.start_date := (v_rule ->> 'startDate')::date;
    c.end_date := (v_rule ->> 'endDate')::date;
    v_sql := '{}';
    for d in select generate_series((v_case ->> 'from')::date, (v_case ->> 'to')::date, '1 day')::date loop
      if private.chore_occurs_on(c, d) then v_sql := v_sql || d; end if;
    end loop;
    v_ts := array(select jsonb_array_elements_text(v_case -> 'dates')::date);
    if v_sql is distinct from v_ts then
      raise exception 'Recurrence parity mismatch for %: SQL has % dates, TS has %', v_rule,
        cardinality(v_sql), cardinality(v_ts);
    end if;
  end loop;
end $$;
