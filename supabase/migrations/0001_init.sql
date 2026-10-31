-- ============================================================================
-- Household Hero — initial schema (chores module)
-- ----------------------------------------------------------------------------
-- Model in one paragraph:
--   Every user has a PERSONAL space (created on sign-up) and can belong to any
--   number of HOUSEHOLD spaces. Everything else hangs from a space_id, so a
--   single RLS rule ("you can see rows of spaces you are a member of") covers
--   the whole schema. A CHORE is a recurring definition (what, how often, who);
--   it materialises TASKS (concrete, dated occurrences) a few weeks ahead.
--   One-off to-dos are just tasks without a chore. TRADES swap or hand over
--   the assignee of a task, atomically, through an RPC. ACTIVITY is an
--   append-only feed written by triggers.
--
-- Conventions:
--   * Dates for chores/tasks are local calendar dates (`date`) + optional
--     `time`. The client always passes its own "today" to the generator so the
--     server's UTC clock never decides what "today" is.
--   * Weekdays are ISO numbers: 1 = Monday … 7 = Sunday.
--   * Priority: 0 none · 1 low · 2 medium · 3 high · 4 urgent.
--   * Effort: 1–5 points, used for fair ("balanced") assignment and stats.
--   * Internal helpers live in the `private` schema, which PostgREST does not
--     expose; everything callable from the browser is in `public` and checks
--     membership itself.
--
-- The schema is deliberately a strict subset of the unified "spaces + items"
-- model described in docs/03-system-design.md, so future modules (finance,
-- issues, calendar) extend it instead of replacing it.
-- ============================================================================

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- 1) Enums
-- ---------------------------------------------------------------------------
create type public.space_kind as enum ('personal', 'household');
create type public.member_role as enum ('owner', 'admin', 'member');
create type public.task_status as enum ('open', 'done', 'skipped');
create type public.recurrence_freq as enum ('daily', 'weekly', 'monthly', 'yearly');
create type public.recurrence_mode as enum ('fixed', 'after_completion');
create type public.assignment_strategy as enum ('fixed', 'rotation', 'balanced', 'unassigned');
create type public.trade_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'expired');

-- ---------------------------------------------------------------------------
-- 2) Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 60),
  avatar_url text,
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Public profile of each user. Created by trigger on sign-up.';

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  kind public.space_kind not null default 'household',
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  icon text,
  color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$'),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
comment on table public.spaces is 'Tenant root. kind=personal (one per user, private) or household (shared).';
create unique index spaces_one_personal_per_user on public.spaces (created_by) where kind = 'personal';

create table public.space_members (
  space_id uuid not null references public.spaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id)
);
create index space_members_user_idx on public.space_members (user_id);

create table public.space_invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- 128 bits of randomness, no extension needed
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  expires_at timestamptz not null default now() + interval '7 days',
  max_uses integer check (max_uses is null or max_uses > 0),
  use_count integer not null default 0,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index space_invites_space_idx on public.space_invites (space_id);

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text,
  priority smallint not null default 0 check (priority between 0 and 4),
  effort smallint not null default 1 check (effort between 1 and 5),

  -- recurrence rule (a pragmatic subset of RFC 5545 RRULE)
  freq public.recurrence_freq not null default 'weekly',
  every integer not null default 1 check (every between 1 and 365),
  by_weekday smallint[] not null default '{}'
    check (by_weekday <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  mode public.recurrence_mode not null default 'fixed',
  start_date date not null default current_date,
  end_date date,
  due_time time,

  -- who does it
  strategy public.assignment_strategy not null default 'rotation',
  rotation uuid[] not null default '{}', -- ordered member ids; 'fixed' uses rotation[1]

  active boolean not null default true,

  -- generator bookkeeping (see private.materialize_chore)
  generated_until date,
  generated_count integer not null default 0,

  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chores_dates_check check (end_date is null or end_date >= start_date),
  constraint chores_weekday_only_weekly check (freq = 'weekly' or cardinality(by_weekday) = 0)
);
create index chores_space_idx on public.chores (space_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  chore_id uuid references public.chores (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text,
  priority smallint not null default 0 check (priority between 0 and 4),
  effort smallint not null default 1 check (effort between 1 and 5),
  due_date date,
  due_time time,
  assignee_id uuid references public.profiles (id) on delete set null,
  status public.task_status not null default 'open',
  closed_at timestamptz,
  completed_by uuid references public.profiles (id) on delete set null,
  -- true once an occurrence is edited/traded by hand: the generator never
  -- touches it again (it survives chore edits).
  detached boolean not null default false,
  occurrence integer, -- 0-based index of this occurrence inside its chore
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_closed_check check ((status = 'open') = (closed_at is null))
);
create unique index tasks_chore_date_uidx on public.tasks (chore_id, due_date) where chore_id is not null;
create index tasks_space_due_idx on public.tasks (space_id, due_date);
create index tasks_assignee_open_idx on public.tasks (assignee_id) where status = 'open';

create table public.task_trades (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid references public.profiles (id) on delete cascade, -- null = open offer to anyone
  counter_task_id uuid references public.tasks (id) on delete cascade, -- null = hand-over, not a swap
  message text check (message is null or char_length(message) <= 500),
  status public.trade_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  responded_by uuid references public.profiles (id) on delete set null,
  constraint trades_not_self check (to_user is null or to_user <> from_user),
  constraint trades_swap_needs_target check (counter_task_id is null or to_user is not null),
  constraint trades_distinct_tasks check (counter_task_id is null or counter_task_id <> task_id)
);
create unique index task_trades_one_pending_per_task on public.task_trades (task_id) where status = 'pending';
create index task_trades_space_idx on public.task_trades (space_id, status);

create table public.activity (
  id bigint generated always as identity primary key,
  space_id uuid not null references public.spaces (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  verb text not null,
  task_id uuid references public.tasks (id) on delete set null,
  subject text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_space_idx on public.activity (space_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3) Membership helpers (used by RLS; security definer avoids RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_space_member(p_space_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.space_members
    where space_id = p_space_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_space_admin(p_space_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.space_members
    where space_id = p_space_id and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

create or replace function public.shares_space_with(p_user_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.space_members a
    join public.space_members b on b.space_id = a.space_id
    where a.user_id = auth.uid() and b.user_id = p_user_id
  );
$$;

create or replace function private.is_member_of(p_space_id uuid, p_user_id uuid)
returns boolean language sql stable set search_path = public as $$
  select exists (
    select 1 from public.space_members where space_id = p_space_id and user_id = p_user_id
  );
$$;

-- ---------------------------------------------------------------------------
-- 4) Recurrence engine (mirrored 1:1 by app/utils/recurrence.ts)
-- ---------------------------------------------------------------------------
create or replace function private.days_in_month(p_date date)
returns integer language sql immutable as $$
  select extract(day from (date_trunc('month', p_date) + interval '1 month - 1 day'))::integer;
$$;

-- Does chore `c` have an occurrence on `d`? (fixed mode only)
create or replace function private.chore_occurs_on(c public.chores, d date)
returns boolean language plpgsql immutable as $$
declare
  v_months integer;
begin
  if d < c.start_date or (c.end_date is not null and d > c.end_date) then
    return false;
  end if;

  case c.freq
    when 'daily' then
      return (d - c.start_date) % c.every = 0;

    when 'weekly' then
      if cardinality(c.by_weekday) = 0 then
        if extract(isodow from d) <> extract(isodow from c.start_date) then return false; end if;
      else
        if not (extract(isodow from d)::smallint = any (c.by_weekday)) then return false; end if;
      end if;
      -- whole weeks between the Monday of d and the Monday of start_date
      return (((d - (extract(isodow from d)::integer - 1))
             - (c.start_date - (extract(isodow from c.start_date)::integer - 1))) / 7) % c.every = 0;

    when 'monthly' then
      v_months := (extract(year from d)::integer * 12 + extract(month from d)::integer)
                - (extract(year from c.start_date)::integer * 12 + extract(month from c.start_date)::integer);
      return v_months % c.every = 0
         and extract(day from d)::integer
             = least(extract(day from c.start_date)::integer, private.days_in_month(d));

    when 'yearly' then
      return extract(month from d) = extract(month from c.start_date)
         and (extract(year from d)::integer - extract(year from c.start_date)::integer) % c.every = 0
         and extract(day from d)::integer
             = least(extract(day from c.start_date)::integer, private.days_in_month(d));
  end case;
  return false;
end;
$$;

-- Step a date forward by one period (after_completion mode). Postgres clamps
-- month ends for us: 2025-01-31 + 1 month = 2025-02-28.
create or replace function private.advance_date(p_date date, p_freq public.recurrence_freq, p_every integer)
returns date language sql immutable as $$
  select case p_freq
    when 'daily' then p_date + p_every
    when 'weekly' then p_date + 7 * p_every
    when 'monthly' then (p_date + make_interval(months => p_every))::date
    when 'yearly' then (p_date + make_interval(years => p_every))::date
  end;
$$;

-- Who gets occurrence number `n` (0-based) of chore `c`, due on `d`?
create or replace function private.pick_assignee(c public.chores, n integer, d date)
returns uuid language plpgsql stable set search_path = public as $$
declare
  v_len integer := cardinality(c.rotation);
  v_pick uuid;
begin
  case c.strategy
    when 'unassigned' then
      return null;
    when 'fixed' then
      return case when v_len > 0 then c.rotation[1] end;
    when 'rotation' then
      return case when v_len > 0 then c.rotation[1 + (n % v_len)] end;
    when 'balanced' then
      -- Least effort-loaded member in a ±14 day window around the due date.
      -- Pool = rotation if given, otherwise every member of the space.
      -- Ties go to rotation order (or join order when the pool is everyone).
      select p.user_id into v_pick
      from (
        select r.user_id, r.ord
        from unnest(c.rotation) with ordinality as r(user_id, ord)
        where v_len > 0
        union all
        select sm.user_id, row_number() over (order by sm.joined_at, sm.user_id)
        from public.space_members sm
        where v_len = 0 and sm.space_id = c.space_id
      ) p
      left join lateral (
        select coalesce(sum(t.effort), 0) as load
        from public.tasks t
        where t.space_id = c.space_id
          and t.assignee_id = p.user_id
          and t.status <> 'skipped'
          and t.due_date between d - 14 and d + 14
      ) l on true
      order by l.load, p.ord
      limit 1;
      return v_pick;
  end case;
  return null;
end;
$$;

-- Materialise the occurrences of one chore. Idempotent. Returns #tasks created.
--   fixed            → every occurrence from p_today up to p_today + horizon
--   after_completion → exactly one open occurrence, due one period after the
--                      previous one was closed
create or replace function private.materialize_chore(p_chore_id uuid, p_today date, p_horizon_days integer default 42)
returns integer language plpgsql security definer set search_path = public as $$
declare
  c public.chores;
  d date;
  v_horizon date;
  n integer;
  v_created integer := 0;
  v_rows integer;
  v_last public.tasks;
begin
  select * into c from public.chores where id = p_chore_id for update;
  if not found or not c.active then
    return 0;
  end if;

  -- tells the tasks trigger that this write is the generator, not a human
  perform set_config('app.generator', 'on', true);

  if c.mode = 'fixed' then
    v_horizon := least(p_today + p_horizon_days, c.end_date); -- least() ignores NULL
    d := coalesce(c.generated_until + 1, c.start_date);
    n := c.generated_count;

    if d <= v_horizon then
      while d <= v_horizon loop
        if private.chore_occurs_on(c, d) then
          if d >= p_today then
            insert into public.tasks (space_id, chore_id, title, description, priority, effort,
                                      due_date, due_time, assignee_id, occurrence, created_by)
            values (c.space_id, c.id, c.title, c.description, c.priority, c.effort,
                    d, c.due_time, private.pick_assignee(c, n, d), n, c.created_by)
            on conflict (chore_id, due_date) where chore_id is not null do nothing;
            get diagnostics v_rows = row_count;
            v_created := v_created + v_rows;
          end if;
          n := n + 1;
        end if;
        d := d + 1;
      end loop;

      update public.chores
         set generated_until = v_horizon, generated_count = n
       where id = c.id;
    end if;

  else -- after_completion
    if exists (select 1 from public.tasks where chore_id = c.id and status = 'open') then
      return 0;
    end if;

    select * into v_last from public.tasks
     where chore_id = c.id
     order by coalesce(closed_at::date, due_date) desc nulls last, created_at desc
     limit 1;

    if not found then
      d := greatest(c.start_date, p_today);
    else
      d := private.advance_date(coalesce(v_last.closed_at::date, v_last.due_date, p_today), c.freq, c.every);
    end if;

    while exists (select 1 from public.tasks where chore_id = c.id and due_date = d) loop
      d := d + 1;
    end loop;

    if c.end_date is not null and d > c.end_date then
      return 0;
    end if;

    -- re-read: pick_assignee for 'balanced' looks at current load
    select * into c from public.chores where id = p_chore_id;
    insert into public.tasks (space_id, chore_id, title, description, priority, effort,
                              due_date, due_time, assignee_id, occurrence, created_by)
    values (c.space_id, c.id, c.title, c.description, c.priority, c.effort,
            d, c.due_time, private.pick_assignee(c, c.generated_count, d), c.generated_count, c.created_by);
    v_created := 1;

    update public.chores set generated_count = generated_count + 1, generated_until = d where id = c.id;
  end if;

  perform set_config('app.generator', 'off', true);
  return v_created;
end;
$$;

-- Drop the not-yet-done, untouched future occurrences of a chore so the
-- generator can rebuild them with the new rule. Hand-edited/traded
-- occurrences (detached) and ones with a pending trade survive.
create or replace function private.reset_chore_occurrences(p_chore_id uuid, p_today date)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.tasks t
   where t.chore_id = p_chore_id
     and t.status = 'open'
     and not t.detached
     and (t.due_date is null or t.due_date >= p_today)
     and not exists (select 1 from public.task_trades tr
                      where tr.status = 'pending' and (tr.task_id = t.id or tr.counter_task_id = t.id));
  perform set_config('app.generator', 'on', true);
  update public.chores set generated_until = null, generated_count = 0 where id = p_chore_id;
  perform set_config('app.generator', 'off', true);
end;
$$;

-- Did any field that shapes the generated occurrences change?
create or replace function private.chore_rule_changed(a public.chores, b public.chores)
returns boolean language sql immutable as $$
  select (a.freq, a.every, a.by_weekday, a.mode, a.start_date, a.end_date, a.due_time,
          a.strategy, a.rotation, a.active, a.title, a.description, a.priority, a.effort)
         is distinct from
         (b.freq, b.every, b.by_weekday, b.mode, b.start_date, b.end_date, b.due_time,
          b.strategy, b.rotation, b.active, b.title, b.description, b.priority, b.effort);
$$;

-- ---------------------------------------------------------------------------
-- 5) Triggers
-- ---------------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- New auth user → profile + personal space
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_space_id uuid;
  v_name text := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(v_name, 60), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;

  insert into public.spaces (kind, name, created_by)
  values ('personal', 'Personal', new.id)
  on conflict do nothing
  returning id into v_space_id;

  if v_space_id is not null then
    insert into public.space_members (space_id, user_id, role) values (v_space_id, new.id, 'owner');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Chores: validate rotation, regenerate occurrences on rule changes
create or replace function private.chores_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_bad uuid;
begin
  new.updated_at := now();
  new.title := btrim(new.title);
  -- dedupe rotation preserving order
  new.rotation := coalesce((select array_agg(u order by o)
                              from (select distinct on (u) u, o
                                      from unnest(new.rotation) with ordinality as r(u, o)
                                     order by u, o) s), '{}');
  select r into v_bad from unnest(new.rotation) as r
   where not private.is_member_of(new.space_id, r) limit 1;
  if v_bad is not null then
    raise exception 'User % is not a member of this space', v_bad using errcode = '23514';
  end if;
  if new.freq = 'weekly' then
    new.by_weekday := coalesce((select array_agg(distinct w order by w) from unnest(new.by_weekday) w), '{}');
  end if;

  if tg_op = 'INSERT' then
    new.generated_until := null;
    new.generated_count := 0;
  elsif coalesce(current_setting('app.generator', true), 'off') <> 'on' then
    -- generator bookkeeping is server-owned: clients cannot touch it
    new.generated_until := old.generated_until;
    new.generated_count := old.generated_count;
    if new.space_id <> old.space_id then
      raise exception 'A chore cannot be moved to another space' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.chores_after_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity (space_id, actor_id, verb, subject)
    values (new.space_id, auth.uid(), 'chore.created', new.title);
    perform private.materialize_chore(new.id, current_date);
  elsif private.chore_rule_changed(new, old) then
    perform private.reset_chore_occurrences(new.id, current_date);
    perform private.materialize_chore(new.id, current_date);
  end if;
  return null;
end;
$$;

create or replace function private.chores_before_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- future open occurrences go away with the chore; history stays (chore_id → null)
  delete from public.tasks where chore_id = old.id and status = 'open' and not detached;
  return old;
end;
$$;

create trigger chores_before_write before insert or update on public.chores
  for each row execute function private.chores_before_write();
create trigger chores_after_write after insert or update on public.chores
  for each row execute function private.chores_after_write();
create trigger chores_before_delete before delete on public.chores
  for each row execute function private.chores_before_delete();

-- Tasks: closing bookkeeping, detach on manual edits, assignee validation
create or replace function private.tasks_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.title := btrim(new.title);

  if new.assignee_id is not null
     and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id)
     and not private.is_member_of(new.space_id, new.assignee_id) then
    raise exception 'Assignee is not a member of this space' using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' then
    if new.space_id <> old.space_id and new.chore_id is not null then
      raise exception 'Chore occurrences cannot be moved to another space' using errcode = '23514';
    end if;
    if new.status <> old.status then
      if new.status = 'open' then
        new.closed_at := null;
        new.completed_by := null;
      else
        new.closed_at := coalesce(new.closed_at, now());
        new.completed_by := case when new.status = 'done' then coalesce(new.completed_by, auth.uid()) end;
      end if;
    end if;
    if new.chore_id is not null
       and coalesce(current_setting('app.generator', true), 'off') <> 'on'
       and (new.title, new.description, new.due_date, new.due_time, new.assignee_id, new.priority, new.effort)
           is distinct from
           (old.title, old.description, old.due_date, old.due_time, old.assignee_id, old.priority, old.effort) then
      new.detached := true;
    end if;
  else
    if new.status <> 'open' then
      new.closed_at := coalesce(new.closed_at, now());
      if new.status = 'done' then new.completed_by := coalesce(new.completed_by, auth.uid()); end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.tasks_after_write()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_verb text;
begin
  if tg_op = 'INSERT' then
    if new.chore_id is null then
      insert into public.activity (space_id, actor_id, verb, task_id, subject)
      values (new.space_id, auth.uid(), 'task.created', new.id, new.title);
    end if;
    return null;
  end if;

  if new.status <> old.status then
    v_verb := case new.status when 'done' then 'task.completed'
                              when 'skipped' then 'task.skipped'
                              else 'task.reopened' end;
    insert into public.activity (space_id, actor_id, verb, task_id, subject)
    values (new.space_id, auth.uid(), v_verb, new.id, new.title);

    if new.status <> 'open' then
      -- a closed task can no longer be traded
      update public.task_trades set status = 'expired', responded_at = now()
       where status = 'pending' and (task_id = new.id or counter_task_id = new.id);
    end if;

    if new.chore_id is not null then
      perform private.materialize_chore(new.chore_id, current_date);
    end if;
  end if;
  return null;
end;
$$;

create trigger tasks_before_write before insert or update on public.tasks
  for each row execute function private.tasks_before_write();
create trigger tasks_after_write after insert or update on public.tasks
  for each row execute function private.tasks_after_write();

-- Members: when someone leaves, clean up after them
create or replace function private.members_after_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_chore record;
  v_profile_exists boolean;
begin
  if tg_op = 'INSERT' then
    if exists (select 1 from public.spaces where id = new.space_id and kind = 'household') then
      insert into public.activity (space_id, actor_id, verb, data)
      values (new.space_id, new.user_id, 'member.joined', jsonb_build_object('user_id', new.user_id));
    end if;
    return null;
  end if;

  -- DELETE
  if not exists (select 1 from public.spaces where id = old.space_id) then
    return null; -- the space itself is being deleted
  end if;
  if not exists (select 1 from public.space_members where space_id = old.space_id) then
    delete from public.spaces where id = old.space_id; -- nobody left
    return null;
  end if;

  -- 1) chores that had them in the rotation: the rotation update re-plans
  --    their future occurrences (see chores triggers)
  update public.chores set rotation = array_remove(rotation, old.user_id)
   where space_id = old.space_id and old.user_id = any (rotation);
  -- 2) other chores still holding untouched occurrences for them (balanced
  --    pools without explicit rotation): re-plan those too
  for v_chore in
    select distinct t.chore_id from public.tasks t
     where t.space_id = old.space_id and t.assignee_id = old.user_id
       and t.status = 'open' and not t.detached and t.chore_id is not null
  loop
    perform private.reset_chore_occurrences(v_chore.chore_id, current_date);
    perform private.materialize_chore(v_chore.chore_id, current_date);
  end loop;
  -- 3) anything else (one-offs, hand-edited occurrences) becomes up for grabs
  update public.tasks set assignee_id = null
   where space_id = old.space_id and assignee_id = old.user_id and status = 'open';
  update public.task_trades set status = 'cancelled', responded_at = now()
   where space_id = old.space_id and status = 'pending'
     and (from_user = old.user_id or to_user = old.user_id);
  v_profile_exists := exists (select 1 from public.profiles where id = old.user_id);
  insert into public.activity (space_id, actor_id, verb, data)
  values (old.space_id, case when v_profile_exists then old.user_id end, 'member.left',
          jsonb_build_object('user_id', old.user_id));
  return null;
end;
$$;

create trigger members_after_change after insert or delete on public.space_members
  for each row execute function private.members_after_change();

-- ---------------------------------------------------------------------------
-- 6) RPCs (the browser-facing API for anything multi-row or privileged)
-- ---------------------------------------------------------------------------
create or replace function public.create_space(
  p_name text, p_description text default null, p_icon text default null, p_color text default null
) returns public.spaces language plpgsql security definer set search_path = public as $$
declare
  v_space public.spaces;
begin
  if auth.uid() is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  insert into public.spaces (kind, name, description, icon, color, created_by)
  values ('household', btrim(p_name), nullif(btrim(p_description), ''), p_icon, p_color, auth.uid())
  returning * into v_space;
  insert into public.space_members (space_id, user_id, role) values (v_space.id, auth.uid(), 'owner');
  return v_space;
end;
$$;

create or replace function public.invite_preview(p_token text)
returns table (space_id uuid, name text, description text, icon text, color text,
               member_count bigint, already_member boolean, valid boolean, reason text)
language plpgsql security definer stable set search_path = public as $$
declare
  i public.space_invites;
begin
  select * into i from public.space_invites where token = p_token;
  if not found then
    return query select null::uuid, null::text, null::text, null::text, null::text, 0::bigint, false, false, 'not_found'::text;
    return;
  end if;
  return query
    select s.id, s.name, s.description, s.icon, s.color,
           (select count(*) from public.space_members m where m.space_id = s.id),
           public.is_space_member(s.id),
           (i.revoked_at is null and i.expires_at > now() and (i.max_uses is null or i.use_count < i.max_uses)),
           case when i.revoked_at is not null then 'revoked'
                when i.expires_at <= now() then 'expired'
                when i.max_uses is not null and i.use_count >= i.max_uses then 'used_up'
           end
      from public.spaces s where s.id = i.space_id;
end;
$$;

create or replace function public.accept_invite(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  i public.space_invites;
begin
  if auth.uid() is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  select * into i from public.space_invites where token = p_token for update;
  if not found then raise exception 'Invite not found' using errcode = 'P0002'; end if;
  if public.is_space_member(i.space_id) then return i.space_id; end if;
  if i.revoked_at is not null or i.expires_at <= now()
     or (i.max_uses is not null and i.use_count >= i.max_uses) then
    raise exception 'This invite is no longer valid' using errcode = '22023';
  end if;
  insert into public.space_members (space_id, user_id, role) values (i.space_id, auth.uid(), 'member');
  update public.space_invites set use_count = use_count + 1 where id = i.id;
  return i.space_id;
end;
$$;

create or replace function public.leave_space(p_space_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_role public.member_role;
  v_kind public.space_kind;
  v_successor uuid;
begin
  select role into v_role from public.space_members where space_id = p_space_id and user_id = auth.uid();
  if not found then raise exception 'Not a member' using errcode = '42501'; end if;
  select kind into v_kind from public.spaces where id = p_space_id;
  if v_kind = 'personal' then raise exception 'You cannot leave your personal space' using errcode = '42501'; end if;

  if v_role = 'owner' then
    select user_id into v_successor from public.space_members
     where space_id = p_space_id and user_id <> auth.uid()
     order by (role = 'admin') desc, joined_at
     limit 1;
    if v_successor is null then
      delete from public.spaces where id = p_space_id; -- last one out turns off the lights
      return;
    end if;
    update public.space_members set role = 'owner' where space_id = p_space_id and user_id = v_successor;
  end if;
  delete from public.space_members where space_id = p_space_id and user_id = auth.uid();
end;
$$;

create or replace function public.remove_member(p_space_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_target public.member_role;
begin
  if not public.is_space_admin(p_space_id) then raise exception 'Only admins can remove members' using errcode = '42501'; end if;
  select role into v_target from public.space_members where space_id = p_space_id and user_id = p_user_id;
  if not found then return; end if;
  if v_target = 'owner' then raise exception 'The owner cannot be removed' using errcode = '42501'; end if;
  delete from public.space_members where space_id = p_space_id and user_id = p_user_id;
end;
$$;

create or replace function public.set_member_role(p_space_id uuid, p_user_id uuid, p_role public.member_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.space_members where space_id = p_space_id and user_id = auth.uid() and role = 'owner') then
    raise exception 'Only the owner can change roles' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then raise exception 'Transfer ownership to someone else instead' using errcode = '42501'; end if;
  if p_role = 'owner' then
    update public.space_members set role = 'admin' where space_id = p_space_id and user_id = auth.uid();
  end if;
  update public.space_members set role = p_role where space_id = p_space_id and user_id = p_user_id;
end;
$$;

-- Roll every chore of every space I belong to forward to p_today + horizon,
-- and expire trades whose tasks are already past due. Called on app load.
create or replace function public.sync_my_spaces(p_today date default current_date)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_chore record;
  v_total integer := 0;
begin
  if auth.uid() is null then return 0; end if;
  for v_chore in
    select c.id from public.chores c
    join public.space_members m on m.space_id = c.space_id and m.user_id = auth.uid()
    where c.active
      and (c.mode = 'after_completion' or c.generated_until is null or c.generated_until < p_today + 42)
  loop
    v_total := v_total + private.materialize_chore(v_chore.id, p_today);
  end loop;

  update public.task_trades tr set status = 'expired', responded_at = now()
    from public.tasks t
   where tr.status = 'pending' and t.id in (tr.task_id, tr.counter_task_id)
     and t.due_date < p_today
     and public.is_space_member(tr.space_id);
  return v_total;
end;
$$;

create or replace function public.propose_trade(
  p_task_id uuid, p_to_user uuid default null, p_counter_task_id uuid default null, p_message text default null
) returns public.task_trades language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  ct public.tasks;
  v_kind public.space_kind;
  v_trade public.task_trades;
begin
  select * into t from public.tasks where id = p_task_id;
  if not found or not public.is_space_member(t.space_id) then raise exception 'Task not found' using errcode = 'P0002'; end if;
  select kind into v_kind from public.spaces where id = t.space_id;
  if v_kind <> 'household' then raise exception 'Only household tasks can be traded' using errcode = '22023'; end if;
  if t.status <> 'open' then raise exception 'Only open tasks can be traded' using errcode = '22023'; end if;
  if t.assignee_id is distinct from auth.uid() then raise exception 'You can only trade tasks assigned to you' using errcode = '42501'; end if;
  if p_to_user is not null and not private.is_member_of(t.space_id, p_to_user) then
    raise exception 'That person is not in this household' using errcode = '22023';
  end if;
  if p_counter_task_id is not null then
    if p_to_user is null then raise exception 'A swap needs a specific person' using errcode = '22023'; end if;
    select * into ct from public.tasks where id = p_counter_task_id;
    if not found or ct.space_id <> t.space_id or ct.status <> 'open' or ct.assignee_id is distinct from p_to_user then
      raise exception 'The task you asked for in return is not available' using errcode = '22023';
    end if;
  end if;
  if exists (select 1 from public.task_trades where task_id = p_task_id and status = 'pending') then
    raise exception 'There is already a pending trade for this task' using errcode = '23505';
  end if;

  insert into public.task_trades (space_id, task_id, from_user, to_user, counter_task_id, message)
  values (t.space_id, t.id, auth.uid(), p_to_user, p_counter_task_id, nullif(btrim(p_message), ''))
  returning * into v_trade;

  insert into public.activity (space_id, actor_id, verb, task_id, subject, data)
  values (t.space_id, auth.uid(), 'trade.proposed', t.id, t.title,
          jsonb_build_object('trade_id', v_trade.id, 'to_user', p_to_user, 'counter_task_id', p_counter_task_id));
  return v_trade;
end;
$$;

create or replace function public.respond_trade(p_trade_id uuid, p_accept boolean)
returns public.task_trades language plpgsql security definer set search_path = public as $$
declare
  tr public.task_trades;
  t public.tasks;
  ct public.tasks;
begin
  select * into tr from public.task_trades where id = p_trade_id for update;
  if not found or not public.is_space_member(tr.space_id) then raise exception 'Trade not found' using errcode = 'P0002'; end if;
  if tr.status <> 'pending' then raise exception 'This trade is already %', tr.status using errcode = '22023'; end if;
  if tr.from_user = auth.uid() then raise exception 'You cannot answer your own trade' using errcode = '42501'; end if;
  if tr.to_user is not null and tr.to_user <> auth.uid() then raise exception 'This trade is not addressed to you' using errcode = '42501'; end if;

  if not p_accept then
    if tr.to_user is null then raise exception 'Open offers cannot be declined, just ignore them' using errcode = '22023'; end if;
    update public.task_trades set status = 'declined', responded_at = now(), responded_by = auth.uid()
     where id = tr.id returning * into tr;
    insert into public.activity (space_id, actor_id, verb, task_id, data)
    values (tr.space_id, auth.uid(), 'trade.declined', tr.task_id, jsonb_build_object('trade_id', tr.id));
    return tr;
  end if;

  select * into t from public.tasks where id = tr.task_id for update;
  if tr.counter_task_id is not null then
    select * into ct from public.tasks where id = tr.counter_task_id for update;
  end if;

  if t.status <> 'open' or t.assignee_id is distinct from tr.from_user
     or (tr.counter_task_id is not null and (ct.status <> 'open' or ct.assignee_id is distinct from auth.uid())) then
    update public.task_trades set status = 'expired', responded_at = now() where id = tr.id;
    raise exception 'The tasks changed since this trade was proposed' using errcode = '40001';
  end if;

  update public.tasks set assignee_id = auth.uid(), detached = true where id = t.id;
  if tr.counter_task_id is not null then
    update public.tasks set assignee_id = tr.from_user, detached = true where id = ct.id;
  end if;

  update public.task_trades
     set status = 'accepted', responded_at = now(), responded_by = auth.uid(), to_user = coalesce(to_user, auth.uid())
   where id = tr.id returning * into tr;

  -- anything else that was trying to move these tasks is now moot
  update public.task_trades set status = 'cancelled', responded_at = now()
   where status = 'pending' and id <> tr.id
     and (task_id in (tr.task_id, tr.counter_task_id) or counter_task_id in (tr.task_id, tr.counter_task_id));

  insert into public.activity (space_id, actor_id, verb, task_id, subject, data)
  values (tr.space_id, auth.uid(), 'trade.accepted', t.id, t.title,
          jsonb_build_object('trade_id', tr.id, 'from_user', tr.from_user, 'counter_task_id', tr.counter_task_id,
                             'counter_subject', ct.title));
  return tr;
end;
$$;

create or replace function public.cancel_trade(p_trade_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.task_trades set status = 'cancelled', responded_at = now()
   where id = p_trade_id and from_user = auth.uid() and status = 'pending';
  if not found then raise exception 'Trade not found or not cancellable' using errcode = 'P0002'; end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7) Views
-- ---------------------------------------------------------------------------
create view public.member_stats with (security_invoker = true) as
select
  m.space_id,
  m.user_id,
  m.role,
  count(t.id) filter (where t.status = 'done' and t.completed_by = m.user_id
                        and t.closed_at > now() - interval '30 days') as done_30d,
  coalesce(sum(t.effort) filter (where t.status = 'done' and t.completed_by = m.user_id
                                   and t.closed_at > now() - interval '30 days'), 0) as effort_30d,
  count(t.id) filter (where t.status = 'open' and t.assignee_id = m.user_id) as open_assigned,
  count(t.id) filter (where t.status = 'open' and t.assignee_id = m.user_id and t.due_date < current_date) as overdue
from public.space_members m
left join public.tasks t
  on t.space_id = m.space_id and (t.assignee_id = m.user_id or t.completed_by = m.user_id)
group by m.space_id, m.user_id, m.role;

comment on view public.member_stats is 'Per-member workload and 30-day contribution, for fairness widgets.';

-- ---------------------------------------------------------------------------
-- 8) Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.space_invites enable row level security;
alter table public.chores enable row level security;
alter table public.tasks enable row level security;
alter table public.task_trades enable row level security;
alter table public.activity enable row level security;

create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.shares_space_with(id));
create policy profiles_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy spaces_select on public.spaces for select using (public.is_space_member(id));
create policy spaces_update on public.spaces for update
  using (public.is_space_admin(id)) with check (public.is_space_admin(id));
create policy spaces_delete on public.spaces for delete
  using (kind = 'household' and exists (select 1 from public.space_members sm
                                         where sm.space_id = spaces.id and sm.user_id = auth.uid() and sm.role = 'owner'));
-- inserts go through create_space()

create policy members_select on public.space_members for select using (public.is_space_member(space_id));
-- writes go through accept_invite / leave_space / remove_member / set_member_role

create policy invites_select on public.space_invites for select using (public.is_space_member(space_id));
create policy invites_insert on public.space_invites for insert
  with check (public.is_space_member(space_id)
              and exists (select 1 from public.spaces s where s.id = space_id and s.kind = 'household'));
create policy invites_update on public.space_invites for update
  using (created_by = auth.uid() or public.is_space_admin(space_id));
create policy invites_delete on public.space_invites for delete
  using (created_by = auth.uid() or public.is_space_admin(space_id));

create policy chores_select on public.chores for select using (public.is_space_member(space_id));
create policy chores_insert on public.chores for insert with check (public.is_space_member(space_id));
create policy chores_update on public.chores for update
  using (public.is_space_member(space_id)) with check (public.is_space_member(space_id));
create policy chores_delete on public.chores for delete using (public.is_space_member(space_id));

create policy tasks_select on public.tasks for select using (public.is_space_member(space_id));
create policy tasks_insert on public.tasks for insert with check (public.is_space_member(space_id));
create policy tasks_update on public.tasks for update
  using (public.is_space_member(space_id)) with check (public.is_space_member(space_id));
create policy tasks_delete on public.tasks for delete using (public.is_space_member(space_id));

create policy trades_select on public.task_trades for select using (public.is_space_member(space_id));
-- writes go through propose_trade / respond_trade / cancel_trade

create policy activity_select on public.activity for select using (public.is_space_member(space_id));

-- ---------------------------------------------------------------------------
-- 9) Grants
-- ---------------------------------------------------------------------------
revoke all on schema private from public;
revoke all on all functions in schema private from public;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, update, delete on public.spaces to authenticated;
grant select on public.space_members to authenticated;
grant select, insert, update, delete on public.space_invites to authenticated;
grant select, insert, update, delete on public.chores to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select on public.task_trades to authenticated;
grant select on public.activity to authenticated;
grant select on public.member_stats to authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.is_space_member(uuid), public.is_space_admin(uuid), public.shares_space_with(uuid),
  public.create_space(text, text, text, text), public.invite_preview(text), public.accept_invite(text),
  public.leave_space(uuid), public.remove_member(uuid, uuid), public.set_member_role(uuid, uuid, public.member_role),
  public.sync_my_spaces(date), public.propose_trade(uuid, uuid, uuid, text),
  public.respond_trade(uuid, boolean), public.cancel_trade(uuid)
to authenticated;
