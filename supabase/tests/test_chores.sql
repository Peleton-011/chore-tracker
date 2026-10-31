-- SQL test suite for 0001_init.sql. Runs as part of supabase/tests/run.sh.
-- Each block either passes silently or raises. Users:
--   A = Alice, B = Bob, C = Carol (household members), D = Dave (outsider)
\set A '''00000000-0000-0000-0000-00000000000a'''
\set B '''00000000-0000-0000-0000-00000000000b'''
\set C '''00000000-0000-0000-0000-00000000000c'''
\set D '''00000000-0000-0000-0000-00000000000d'''

insert into auth.users (id, email, raw_user_meta_data) values
  (:A, 'alice@example.com', '{"display_name":"Alice"}'),
  (:B, 'bob@example.com', '{}'),
  (:C, 'carol@example.com', '{"full_name":"Carol C"}'),
  (:D, 'dave@example.com', '{}');

-- small assertion helper, callable by everyone
create function public.t_assert(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;
grant execute on function public.t_assert(boolean, text) to authenticated;
-- lets tests drive the generator with an arbitrary "today"/horizon
create function public.private_test_materialize(p_id uuid, p_today date, p_horizon int) returns int
language sql security definer as $$ select private.materialize_chore(p_id, p_today, p_horizon) $$;
grant execute on function public.private_test_materialize(uuid, date, int) to authenticated;

-- "next Monday" (strictly after today) anchors every date in this file
select set_config('t.mon', (current_date + (8 - extract(isodow from current_date)::int))::text, false);

-- ---------------------------------------------------------------- sign-up
do $$ begin
  perform t_assert((select count(*) from profiles) = 4, 'profiles created by trigger');
  perform t_assert((select display_name from profiles where id = '00000000-0000-0000-0000-00000000000a') = 'Alice', 'display name from metadata');
  perform t_assert((select display_name from profiles where id = '00000000-0000-0000-0000-00000000000b') = 'bob', 'display name falls back to email');
  perform t_assert((select display_name from profiles where id = '00000000-0000-0000-0000-00000000000c') = 'Carol C', 'full_name fallback');
  perform t_assert((select count(*) from spaces where kind = 'personal') = 4, 'one personal space each');
  perform t_assert((select count(*) from space_members where role = 'owner') = 4, 'owner of personal space');
end $$;

-- ------------------------------------------------- household + invitations
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_space spaces; v_token text;
begin
  v_space := create_space('The Flat', 'Third floor', null, '#7c3aed');
  perform set_config('t.flat', v_space.id::text, false);
  insert into space_invites (space_id) values (v_space.id) returning token into v_token;
  perform set_config('t.token', v_token, false);
  perform t_assert(length(v_token) = 32, 'token has 128 bits');
  perform t_assert((select count(*) from spaces) = 2, 'alice sees personal + flat');
end $$;
reset role;

select set_config('request.jwt.claim.sub', :B, false);
set role authenticated;
do $$
declare p record;
begin
  select * into p from invite_preview(current_setting('t.token'));
  perform t_assert(p.valid and p.name = 'The Flat' and p.member_count = 1 and not p.already_member, 'invite preview');
  perform t_assert((select count(*) from spaces where id = current_setting('t.flat')::uuid) = 0, 'bob cannot see flat before joining');
  perform t_assert(accept_invite(current_setting('t.token')) = current_setting('t.flat')::uuid, 'bob joins');
  perform t_assert((select count(*) from spaces where id = current_setting('t.flat')::uuid) = 1, 'bob sees flat after joining');
  perform t_assert((select count(*) from profiles) = 2, 'bob sees alice + himself only');
end $$;
reset role;

select set_config('request.jwt.claim.sub', :C, false);
set role authenticated;
select accept_invite(current_setting('t.token'));
reset role;

-- ----------------------------------------------- rotation chore, Mon + Thu
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_id uuid; v_mon date := current_setting('t.mon')::date; r record; i int := 0;
  v_expected uuid[] := array['00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b',
                             '00000000-0000-0000-0000-00000000000c']::uuid[];
begin
  insert into chores (space_id, title, freq, every, by_weekday, start_date, strategy, rotation, effort)
  values (current_setting('t.flat')::uuid, 'Take out the trash', 'weekly', 1, '{4,1,4}', v_mon, 'rotation',
          v_expected, 2)
  returning id into v_id;
  perform set_config('t.trash', v_id::text, false);

  perform t_assert((select by_weekday from chores where id = v_id) = '{1,4}'::smallint[], 'weekdays normalised');
  perform t_assert((select count(*) from tasks where chore_id = v_id) between 10 and 12, 'about six weeks of Mon+Thu occurrences');
  for r in select * from tasks where chore_id = v_id order by due_date loop
    perform t_assert(extract(isodow from r.due_date) in (1, 4), 'only on Mon/Thu');
    perform t_assert(r.assignee_id = v_expected[1 + (i % 3)], format('rotation order at occurrence %s', i));
    perform t_assert(r.occurrence = i, 'occurrence index');
    i := i + 1;
  end loop;
  perform t_assert((select min(due_date) from tasks where chore_id = v_id) = v_mon, 'first occurrence on start date');

  -- client cannot fiddle with generator bookkeeping
  update chores set generated_count = 999 where id = v_id;
  perform t_assert((select generated_count from chores where id = v_id) <> 999, 'bookkeeping is server-owned');

  -- sync is idempotent
  perform sync_my_spaces(current_date);
  perform t_assert((select count(*) from tasks where chore_id = v_id) = i, 'sync does not duplicate');
end $$;
reset role;

-- --------------------------------------------------------- outsider + RLS
select set_config('request.jwt.claim.sub', :D, false);
set role authenticated;
do $$ begin
  perform t_assert((select count(*) from tasks) = 0, 'outsider sees no tasks');
  perform t_assert((select count(*) from chores) = 0, 'outsider sees no chores');
  perform t_assert((select count(*) from activity) = 0, 'outsider sees no activity');
  begin
    insert into tasks (space_id, title) values (current_setting('t.flat')::uuid, 'sneaky');
    raise exception 'outsider insert should fail';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into spaces (name) values ('direct insert');
    raise exception 'direct space insert should fail';
  exception when insufficient_privilege then null;
  end;
  update tasks set title = 'hacked';
  perform t_assert(not exists (select 1 from tasks where title = 'hacked'), 'update is a no-op for outsiders');
end $$;
reset role;
do $$ begin
  perform t_assert(not exists (select 1 from tasks where title = 'hacked'), 'nothing hacked');
end $$;

-- ------------------------------------------------------ validation checks
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$ begin
  begin
    insert into tasks (space_id, title, assignee_id)
    values (current_setting('t.flat')::uuid, 'x', '00000000-0000-0000-0000-00000000000d');
    raise exception 'assigning an outsider should fail';
  exception when check_violation then null;
  end;
  begin
    insert into chores (space_id, title, rotation)
    values (current_setting('t.flat')::uuid, 'x', array['00000000-0000-0000-0000-00000000000d']::uuid[]);
    raise exception 'outsider in rotation should fail';
  exception when check_violation then null;
  end;
end $$;
reset role;

-- --------------------------------------------------------------- trading
-- Bob offers his first Thursday to Carol in exchange for her first Monday.
select set_config('request.jwt.claim.sub', :B, false);
set role authenticated;
do $$
declare v_bob_task tasks; v_carol_task tasks; v_trade task_trades;
begin
  select * into v_bob_task from tasks where chore_id = current_setting('t.trash')::uuid
    and assignee_id = auth.uid() order by due_date limit 1;
  select * into v_carol_task from tasks where chore_id = current_setting('t.trash')::uuid
    and assignee_id = '00000000-0000-0000-0000-00000000000c' order by due_date limit 1;
  perform set_config('t.bob_task', v_bob_task.id::text, false);
  perform set_config('t.carol_task', v_carol_task.id::text, false);

  begin
    perform propose_trade(v_carol_task.id, '00000000-0000-0000-0000-00000000000a');
    raise exception 'trading someone else''s task should fail';
  exception when insufficient_privilege then null;
  end;

  v_trade := propose_trade(v_bob_task.id, '00000000-0000-0000-0000-00000000000c', v_carol_task.id, 'swap?');
  perform set_config('t.trade', v_trade.id::text, false);
  perform t_assert(v_trade.status = 'pending', 'trade pending');

  begin
    perform propose_trade(v_bob_task.id, '00000000-0000-0000-0000-00000000000a');
    raise exception 'second pending trade should fail';
  exception when unique_violation then null;
  end;

  begin
    perform respond_trade(v_trade.id, true);
    raise exception 'accepting own trade should fail';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$ begin
  begin
    perform respond_trade(current_setting('t.trade')::uuid, true);
    raise exception 'third party accepting should fail';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select set_config('request.jwt.claim.sub', :C, false);
set role authenticated;
do $$
declare v_trade task_trades;
begin
  v_trade := respond_trade(current_setting('t.trade')::uuid, true);
  perform t_assert(v_trade.status = 'accepted', 'trade accepted');
  perform t_assert((select assignee_id from tasks where id = current_setting('t.bob_task')::uuid)
                   = '00000000-0000-0000-0000-00000000000c', 'carol now has bob''s task');
  perform t_assert((select assignee_id from tasks where id = current_setting('t.carol_task')::uuid)
                   = '00000000-0000-0000-0000-00000000000b', 'bob now has carol''s task');
  perform t_assert((select bool_and(detached) from tasks
                    where id in (current_setting('t.bob_task')::uuid, current_setting('t.carol_task')::uuid)),
                   'traded occurrences are detached');
  perform t_assert(exists (select 1 from activity where verb = 'trade.accepted'), 'activity logged');
end $$;
reset role;

-- open offer (to anyone): Alice gives away one task, Bob grabs it
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_task tasks; v_trade task_trades;
begin
  select * into v_task from tasks where chore_id = current_setting('t.trash')::uuid
    and assignee_id = auth.uid() and not detached order by due_date desc limit 1;
  perform set_config('t.alice_task', v_task.id::text, false);
  v_trade := propose_trade(v_task.id, null, null, 'anyone?');
  perform set_config('t.open_trade', v_trade.id::text, false);
end $$;
reset role;
select set_config('request.jwt.claim.sub', :B, false);
set role authenticated;
do $$ begin
  begin
    perform respond_trade(current_setting('t.open_trade')::uuid, false);
    raise exception 'declining an open offer should fail';
  exception when invalid_parameter_value then null;
  end;
  perform respond_trade(current_setting('t.open_trade')::uuid, true);
  perform t_assert((select assignee_id from tasks where id = current_setting('t.alice_task')::uuid)
                   = auth.uid(), 'bob took the open offer');
  perform t_assert((select to_user from task_trades where id = current_setting('t.open_trade')::uuid)
                   = auth.uid(), 'open offer records who took it');
end $$;
reset role;

-- --------------------------------------------- editing a chore re-plans it
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_before int; v_after int;
begin
  select count(*) into v_before from tasks where chore_id = current_setting('t.trash')::uuid;
  update chores set title = 'Trash + recycling' where id = current_setting('t.trash')::uuid;
  select count(*) into v_after from tasks where chore_id = current_setting('t.trash')::uuid;
  perform t_assert(v_before = v_after, format('same number of occurrences after rename (%s vs %s)', v_before, v_after));
  perform t_assert((select count(*) from tasks where chore_id = current_setting('t.trash')::uuid
                    and not detached and title <> 'Trash + recycling') = 0, 'untouched occurrences renamed');
  perform t_assert((select count(*) from tasks where chore_id = current_setting('t.trash')::uuid
                    and detached and title = 'Take out the trash') = 3, 'detached occurrences kept as they were');

  -- switch to Mondays only: Thursday occurrences that were not traded disappear
  update chores set by_weekday = '{1}' where id = current_setting('t.trash')::uuid;
  perform t_assert((select count(*) from tasks where chore_id = current_setting('t.trash')::uuid
                    and extract(isodow from due_date) = 4 and not detached) = 0, 'thursdays removed');

  -- pausing removes the future, resuming brings it back
  update chores set active = false where id = current_setting('t.trash')::uuid;
  perform t_assert((select count(*) from tasks where chore_id = current_setting('t.trash')::uuid and not detached) = 0,
                   'paused chore has no untouched occurrences');
  update chores set active = true where id = current_setting('t.trash')::uuid;
  perform t_assert((select count(*) from tasks where chore_id = current_setting('t.trash')::uuid and not detached) >= 5,
                   'resumed chore re-planned');
end $$;
reset role;

-- --------------------------------------------- after-completion recurrence
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_id uuid; v_task tasks;
begin
  insert into chores (space_id, title, freq, every, mode, start_date, strategy, rotation)
  values (current_setting('t.flat')::uuid, 'Descale kettle', 'daily', 10, 'after_completion', current_date,
          'rotation', array['00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000c']::uuid[])
  returning id into v_id;
  perform t_assert((select count(*) from tasks where chore_id = v_id) = 1, 'exactly one open occurrence');
  select * into v_task from tasks where chore_id = v_id;
  perform t_assert(v_task.due_date = current_date and v_task.assignee_id = auth.uid(), 'first one is today, alice');

  update tasks set status = 'done' where id = v_task.id;
  perform t_assert((select completed_by from tasks where id = v_task.id) = auth.uid(), 'completed_by set');
  perform t_assert((select count(*) from tasks where chore_id = v_id and status = 'open') = 1, 'next one spawned');
  perform t_assert((select due_date from tasks where chore_id = v_id and status = 'open')
                   = (now()::date + 10), 'due 10 days after completion');
  perform t_assert((select assignee_id from tasks where chore_id = v_id and status = 'open')
                   = '00000000-0000-0000-0000-00000000000c', 'rotation advanced to carol');

  -- reopening and re-closing does not stack up occurrences
  update tasks set status = 'open' where id = v_task.id;
  update tasks set status = 'done' where id = v_task.id;
  perform t_assert((select count(*) from tasks where chore_id = v_id and status = 'open') = 1, 'still one open');
end $$;
reset role;

-- --------------------------------------------- monthly on the 31st clamps
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_id uuid; v_space uuid;
begin
  select id into v_space from spaces where kind = 'personal';
  insert into chores (space_id, title, freq, every, start_date, strategy, rotation)
  values (v_space, 'Pay rent', 'monthly', 1, '2027-01-31', 'fixed', array[auth.uid()])
  returning id into v_id;
  -- force-generate far ahead to see the clamping
  perform private_test_materialize(v_id, '2027-01-01', 120);
  perform t_assert((select array_agg(due_date order by due_date) from tasks where chore_id = v_id)
                   = array['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30']::date[],
                   'month-end clamping');
end $$;
reset role;

-- ------------------------------------------------- balanced assignment
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_id uuid; v_counts int[];
begin
  insert into chores (space_id, title, freq, every, start_date, strategy, effort)
  values (current_setting('t.flat')::uuid, 'Wipe kitchen', 'daily', 1, current_setting('t.mon')::date, 'balanced', 1)
  returning id into v_id;
  select array_agg(n order by n) into v_counts from (
    select count(*) n from tasks where chore_id = v_id group by assignee_id) s;
  perform t_assert(cardinality(v_counts) = 3, 'balanced uses all three members');
  perform t_assert(v_counts[3] - v_counts[1] <= 6, format('balanced spread is fair-ish: %s', v_counts));
  perform t_assert(not exists (select 1 from tasks where chore_id = v_id and assignee_id is null), 'everyone gets some');
end $$;
reset role;

-- --------------------------------------------- personal space restrictions
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$
declare v_space uuid; v_task uuid;
begin
  select id into v_space from spaces where kind = 'personal';
  insert into tasks (space_id, title, assignee_id) values (v_space, 'Buy drill', auth.uid()) returning id into v_task;
  begin
    perform propose_trade(v_task, null);
    raise exception 'personal trade should fail';
  exception when invalid_parameter_value then null;
  end;
  begin
    insert into space_invites (space_id) values (v_space);
    raise exception 'personal invite should fail';
  exception when insufficient_privilege then null;
  end;
  begin
    perform leave_space(v_space);
    raise exception 'leaving personal should fail';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ------------------------------------------------------- stats view
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
do $$ begin
  perform t_assert((select count(*) from member_stats where space_id = current_setting('t.flat')::uuid) = 3, 'stats per member');
  perform t_assert((select done_30d from member_stats where space_id = current_setting('t.flat')::uuid
                    and user_id = auth.uid()) >= 1, 'alice completed something');
end $$;
reset role;

-- ------------------------------------------- leaving re-plans rotations
select set_config('request.jwt.claim.sub', :B, false);
set role authenticated;
select leave_space(current_setting('t.flat')::uuid);
reset role;
do $$ begin
  perform t_assert(not exists (select 1 from space_members where space_id = current_setting('t.flat')::uuid
                                and user_id = '00000000-0000-0000-0000-00000000000b'), 'bob left');
  perform t_assert(not exists (select 1 from chores where '00000000-0000-0000-0000-00000000000b' = any (rotation)),
                   'bob removed from rotations');
  perform t_assert(not exists (select 1 from tasks where space_id = current_setting('t.flat')::uuid and status = 'open'
                                and assignee_id = '00000000-0000-0000-0000-00000000000b'), 'bob has no open tasks there');
  perform t_assert(exists (select 1 from tasks where id = current_setting('t.carol_task')::uuid and assignee_id is null),
                   'his detached occurrence is now up for grabs');
  perform t_assert((select count(distinct assignee_id) from tasks
                    where chore_id = current_setting('t.trash')::uuid and not detached and status = 'open') = 2,
                   'rotation now alternates alice/carol');
  perform t_assert(exists (select 1 from activity where verb = 'member.left'), 'leave logged');
end $$;

-- owner leaves → ownership passes on; last member leaves → space deleted
select set_config('request.jwt.claim.sub', :A, false);
set role authenticated;
select leave_space(current_setting('t.flat')::uuid);
reset role;
do $$ begin
  perform t_assert((select role from space_members where space_id = current_setting('t.flat')::uuid
                    and user_id = '00000000-0000-0000-0000-00000000000c') = 'owner', 'carol inherited ownership');
end $$;
select set_config('request.jwt.claim.sub', :C, false);
set role authenticated;
select leave_space(current_setting('t.flat')::uuid);
reset role;
do $$ begin
  perform t_assert(not exists (select 1 from spaces where id = current_setting('t.flat')::uuid), 'empty space deleted');
end $$;

-- deleting a user cleans up after them
delete from auth.users where id = :D;
do $$ begin
  perform t_assert(not exists (select 1 from spaces where created_by is null and kind = 'personal'), 'personal space removed');
end $$;
