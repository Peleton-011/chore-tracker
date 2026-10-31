-- ============================================================================
-- TARGET unified schema (reference, not a migration).
-- ----------------------------------------------------------------------------
-- What the platform's database looks like once the chores, finance, tickets
-- and calendar modules all exist (docs/03-system-design.md). Applies cleanly
-- to a fresh Postgres + Supabase stub (validated by docs/reference/check.sh).
-- The chores migration in supabase/migrations is a strict subset of the
-- `core` + `work` parts below; later migrations evolve it into this shape.
--
-- Postgres schemas = module boundaries:
--   core     identity, spaces, membership, invites, module toggles, audit
--   work     items (tasks/chores/issues/purchases), workflows, recurrence
--   money    expenses, shares, settlements, accounts, transactions
--   time     calendars, events, activities (time blocks) and draw pools
--   roster   shift templates, staffing rules, availability, attendance
--   pos      EPOS: catalogue, stock, registers, till sessions, orders, fiscal log
-- RLS everywhere: a row is visible iff you are a member of its space
-- (plus per-item visibility for private items).
-- ============================================================================

create schema core;
create schema work;
create schema money;
create schema time;
create schema roster;
create schema pos;

-- ===================================================================== CORE
create type core.space_kind as enum ('personal', 'household', 'project', 'organization', 'team');
create type core.member_role as enum ('owner', 'admin', 'member', 'guest');

create table core.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'en',             -- en | es | pt …
  timezone text not null default 'Europe/Madrid', -- IANA
  week_starts_on smallint not null default 1 check (week_starts_on between 1 and 7),
  default_currency char(3) not null default 'EUR',
  created_at timestamptz not null default now()
);

create table core.spaces (
  id uuid primary key default gen_random_uuid(),
  kind core.space_kind not null,
  parent_id uuid references core.spaces (id) on delete cascade, -- projects inside a household, etc.
  name text not null,
  description text,
  icon text,
  color text,
  currency char(3) not null default 'EUR',
  settings jsonb not null default '{}'::jsonb,  -- e.g. {"money":{"simplify_debts":true}}
  created_by uuid references core.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table core.space_members (
  space_id uuid not null references core.spaces (id) on delete cascade,
  user_id uuid not null references core.profiles (id) on delete cascade,
  role core.member_role not null default 'member',
  nickname text,
  away_from date, away_until date,              -- vacation mode: skip in assignment
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

-- Non-user participants (a flatmate who won't sign up, the landlord, a shop)
create table core.contacts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  email text,
  linked_user_id uuid references core.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);


-- Tags on people: skills, pools, certifications ("experienced", "electrician",
-- "food-handler-cert"). Used by staffing rules and item requirements.
create table core.member_tags (
  space_id uuid not null references core.spaces (id) on delete cascade,
  user_id uuid not null references core.profiles (id) on delete cascade,
  tag text not null,
  valid_until date,                                 -- certifications expire
  primary key (space_id, user_id, tag)
);

-- Organisation members who aren't app users: association members (socios),
-- with fees. Distinct from space_members (people who use the app).
create table core.org_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  number integer,
  name text not null,
  email text, phone text,
  user_id uuid references core.profiles (id) on delete set null,
  joined_on date, left_on date,
  fee_plan text,
  iban_last4 text,                                  -- full IBAN only via the payment provider
  unique (space_id, number)
);

create table core.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  role core.member_role not null default 'member',
  created_by uuid references core.profiles (id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  max_uses integer,
  use_count integer not null default 0,
  revoked_at timestamptz
);

-- Module registry and per-space enablement (the plugin seam)
create table core.modules (
  id text primary key,                            -- 'chores', 'money', 'tickets', 'calendar', 'x.acme.garden'
  version text not null,
  first_party boolean not null default true,
  manifest jsonb not null                          -- routes, item kinds, permissions, settings schema
);
create table core.space_modules (
  space_id uuid not null references core.spaces (id) on delete cascade,
  module_id text not null references core.modules (id) on delete cascade,
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  primary key (space_id, module_id)
);

create table core.tags (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  color text,
  unique (space_id, name)
);

-- Append-only event log: activity feeds, notifications, webhooks, undo
create table core.events (
  id bigint generated always as identity primary key,
  space_id uuid not null references core.spaces (id) on delete cascade,
  actor_id uuid references core.profiles (id) on delete set null,
  module_id text not null,
  verb text not null,                              -- 'item.completed', 'expense.created' …
  subject_type text, subject_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index events_space_idx on core.events (space_id, created_at desc);

create table core.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references core.profiles (id) on delete cascade,
  event_id bigint references core.events (id) on delete cascade,
  channel text not null default 'in_app',           -- in_app | push | email | digest
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table core.attachments (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  owner_type text not null, owner_id uuid not null, -- item | expense | event …
  storage_path text not null,                       -- Supabase Storage key
  mime text, bytes integer,
  created_by uuid references core.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ===================================================================== WORK
-- One table for every "thing to do or track": quick task, chore occurrence,
-- issue/ticket, purchase/wishlist entry, sub-step. Kinds differ by workflow
-- and by which optional columns they use, not by table.
create type work.item_kind as enum ('task', 'chore', 'issue', 'purchase', 'note', 'shift');
create type work.state_category as enum ('backlog', 'todo', 'active', 'waiting', 'done', 'cancelled');
create type work.link_type as enum ('blocks', 'relates', 'duplicates');
create type work.recurrence_freq as enum ('daily', 'weekly', 'monthly', 'yearly');
create type work.recurrence_mode as enum ('fixed', 'after_completion', 'pool');
create type work.assignment_strategy as enum ('fixed', 'rotation', 'balanced', 'unassigned');

create table work.workflows (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references core.spaces (id) on delete cascade, -- null = built-in template
  name text not null,                                          -- 'Simple', 'Repair', 'Purchase'
  item_kind work.item_kind not null
);
create table work.workflow_states (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references work.workflows (id) on delete cascade,
  name text not null,                                          -- 'Reported', 'Diagnosing', 'Parts needed' …
  category work.state_category not null,
  position smallint not null,
  unique (workflow_id, position)
);
create table work.workflow_transitions (                        -- empty = any transition allowed
  workflow_id uuid not null references work.workflows (id) on delete cascade,
  from_state uuid not null references work.workflow_states (id) on delete cascade,
  to_state uuid not null references work.workflow_states (id) on delete cascade,
  primary key (from_state, to_state)
);

create table work.boards (                                      -- saved views: list / kanban / table
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  layout text not null default 'kanban',
  query jsonb not null default '{}'::jsonb,                     -- filters, grouping, sort
  created_by uuid references core.profiles (id) on delete set null
);

-- Recurrence rule shared by chores, recurring issues (maintenance) and pools
create table work.series (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  template jsonb not null,                       -- title, description, priority, effort, tags, workflow …
  freq work.recurrence_freq,                     -- null for pool-only series
  every integer not null default 1,
  by_weekday smallint[] not null default '{}',
  mode work.recurrence_mode not null default 'fixed',
  start_date date not null,
  end_date date,
  due_time time,
  cooldown_days integer not null default 0,      -- pool mode: min days between draws
  strategy work.assignment_strategy not null default 'rotation',
  rotation uuid[] not null default '{}',
  active boolean not null default true,
  generated_until date,
  generated_count integer not null default 0,
  created_by uuid references core.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table work.items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  number integer not null,                        -- per-space human id: HOME-42
  kind work.item_kind not null default 'task',
  parent_id uuid references work.items (id) on delete cascade, -- sub-steps / children
  series_id uuid references work.series (id) on delete set null,
  workflow_id uuid references work.workflows (id),
  state_id uuid references work.workflow_states (id),
  state_category work.state_category not null default 'todo', -- denormalised for fast queries
  title text not null,
  body text,                                       -- markdown: symptoms, diagnosis, notes
  next_action text,                                -- "test the power supply"
  priority smallint not null default 0 check (priority between 0 and 4),
  rank text not null default 'm',                  -- fractional index for drag-to-reorder
  effort smallint check (effort between 1 and 5),
  estimate_minutes integer,
  due_date date, due_time time,
  start_date date,                                 -- don't show before
  assignee_id uuid references core.profiles (id) on delete set null,
  asset_id uuid,                                   -- the door, the console (work.assets)
  location text,
  estimated_cost bigint,                           -- cents, sum of materials if null
  currency char(3),
  private boolean not null default false,          -- only creator + assignee see it
  detached boolean not null default false,
  occurrence integer,
  closed_at timestamptz,
  completed_by uuid references core.profiles (id) on delete set null,
  created_by uuid references core.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (space_id, number)
);
create index items_space_state_idx on work.items (space_id, state_category, due_date);
create index items_parent_idx on work.items (parent_id);
create unique index items_series_date_uidx on work.items (series_id, due_date) where series_id is not null;


-- Several people per item (shifts, crew jobs). items.assignee_id remains the
-- single-owner shortcut; for multi-seat items this table is authoritative.
create table work.item_assignees (
  item_id uuid not null references work.items (id) on delete cascade,
  user_id uuid not null references core.profiles (id) on delete cascade,
  seat text,                                        -- optional label: "bar", "kitchen", "lead"
  source text not null default 'manual',            -- manual | drawn | volunteered | traded
  primary key (item_id, user_id)
);

-- Staffing / eligibility rules that apply to an item, a series or a shift
-- template: "between min and max of the assignees must match selector".
-- selector is JSON: {"tag":"experienced"} | {"anyOf":[…]} | {"allOf":[…]} |
-- {"not":…} | {"people":[uuid…]} | {"any":true}  (docs/reference/rostering.ts)
create table work.requirements (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  owner_type text not null,                         -- item | series | shift_template
  owner_id uuid not null,
  kind text not null default 'count',               -- count | eligible | headcount
  label text not null,
  selector jsonb not null default '{"any":true}',
  min_count integer,
  max_count integer,
  check (min_count is null or max_count is null or min_count <= max_count)
);
create index requirements_owner_idx on work.requirements (owner_type, owner_id);

create table work.item_links (
  from_item uuid not null references work.items (id) on delete cascade,
  to_item uuid not null references work.items (id) on delete cascade,
  type work.link_type not null,
  primary key (from_item, to_item, type),
  check (from_item <> to_item)
);

create table work.item_tags (
  item_id uuid not null references work.items (id) on delete cascade,
  tag_id uuid not null references core.tags (id) on delete cascade,
  primary key (item_id, tag_id)
);

create table work.comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references work.items (id) on delete cascade,
  author_id uuid references core.profiles (id) on delete set null,
  body text not null,
  kind text not null default 'comment',            -- comment | diagnosis | repair_note
  created_at timestamptz not null default now()
);

-- Bill of materials for repairs and plans (silicone tube, hinge …)
create table work.materials (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references work.items (id) on delete cascade,
  name text not null,
  quantity numeric(10, 2) not null default 1,
  unit text,
  url text,
  estimated_unit_cost bigint,                      -- cents
  purchase_item_id uuid references work.items (id) on delete set null, -- the "buy it" step
  expense_id uuid,                                 -- the money spent (money.expenses)
  acquired boolean not null default false
);

create table work.assets (                         -- things you own: door, console, drill
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  category text,
  location text,
  purchased_on date,
  warranty_until date,
  notes text
);
alter table work.items add foreign key (asset_id) references work.assets (id) on delete set null;

-- Universal trades: any assignable item (chore, task, issue, shift seat).
-- Validity is decided by the owning module's validate_assignment() hook.
create table work.trades (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  item_id uuid not null references work.items (id) on delete cascade,
  from_user uuid not null references core.profiles (id) on delete cascade,
  to_user uuid references core.profiles (id) on delete cascade,
  counter_item_id uuid references work.items (id) on delete cascade,
  message text,
  requires_approval boolean not null default false, -- e.g. org policy: a manager signs off
  approved_by uuid references core.profiles (id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

-- ==================================================================== MONEY
create type money.split_method as enum ('equal', 'shares', 'percent', 'exact');

create table money.expenses (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  description text not null,
  amount bigint not null check (amount > 0),       -- cents, in `currency`
  currency char(3) not null,
  fx_rate numeric(18, 8) not null default 1,       -- to the space currency at `spent_on`
  paid_by uuid references core.profiles (id) on delete set null,
  paid_by_contact uuid references core.contacts (id) on delete set null,
  split_method money.split_method not null default 'equal',
  spent_on date not null default current_date,
  category text,
  item_id uuid references work.items (id) on delete set null, -- "bin bags" bought for the trash chore
  reimbursable boolean not null default false,      -- volunteer paid out of pocket for the org
  material_id uuid references work.materials (id) on delete set null,
  receipt_id uuid references core.attachments (id) on delete set null,
  created_by uuid references core.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((paid_by is null) <> (paid_by_contact is null))
);
alter table work.materials add foreign key (expense_id) references money.expenses (id) on delete set null;

create table money.expense_shares (
  expense_id uuid not null references money.expenses (id) on delete cascade,
  user_id uuid references core.profiles (id) on delete cascade,
  contact_id uuid references core.contacts (id) on delete cascade,
  weight numeric(10, 4),                           -- shares / percent input, kept for editing
  amount bigint not null,                          -- resolved cents (sum = expense.amount)
  check ((user_id is null) <> (contact_id is null))
);
create unique index expense_shares_uidx on money.expense_shares (expense_id, coalesce(user_id, contact_id));

create table money.settlements (                   -- "A paid B back 20 €"
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  from_user uuid not null references core.profiles (id),
  to_user uuid not null references core.profiles (id),
  amount bigint not null check (amount > 0),
  currency char(3) not null,
  settled_on date not null default current_date,
  method text,                                     -- cash | bizum | bank | mbway …
  confirmed_by_receiver boolean not null default false,
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);

-- Contabilify's world, generalised: real accounts and their transactions
create table money.accounts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  type text not null default 'bank',               -- cash | bank | card | savings
  currency char(3) not null,
  opening_balance bigint not null default 0,
  archived boolean not null default false,
  unique (id, space_id)
);
create table money.transactions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null,
  account_id uuid not null,
  occurred_on date not null,
  amount bigint not null,                          -- signed cents: + in, − out
  description text not null,
  counterparty text,
  category text,
  expense_id uuid references money.expenses (id) on delete set null,
  transfer_group uuid,                             -- pairs of an internal transfer
  metadata jsonb not null default '{}'::jsonb,
  source text not null default 'manual',            -- manual | bank | pos | recurring | import
  external_id text,                                 -- bank transaction id (dedupe)
  matched_by uuid references core.profiles (id) on delete set null, -- reconciliation
  foreign key (account_id, space_id) references money.accounts (id, space_id) on delete cascade,
  unique (account_id, external_id)
);

-- Bank feeds (PSD2 account information via an aggregator: Plaid, Tink,
-- Salt Edge, Enable Banking, TrueLayer…). Tokens live in Supabase Vault,
-- never in this table.
create table money.bank_connections (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  provider text not null,                           -- 'plaid' | 'tink' | 'enablebanking' | …
  institution text not null,
  external_ref text not null,                       -- provider's connection/requisition id
  vault_secret_id uuid,                             -- reference into vault.secrets
  status text not null default 'active',            -- active | expiring | expired | error
  consent_expires_at timestamptz,                   -- PSD2 consents need renewal (typically ≤180 days)
  last_synced_at timestamptz,
  created_by uuid references core.profiles (id) on delete set null
);
create table money.bank_account_links (
  connection_id uuid not null references money.bank_connections (id) on delete cascade,
  external_account_id text not null,
  account_id uuid not null references money.accounts (id) on delete cascade,
  primary key (connection_id, external_account_id)
);

create table money.budgets (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  category text not null,
  period text not null default 'month',
  amount bigint not null
);

-- Balance per member and space, in the space currency (cents)
create view money.balances with (security_invoker = true) as
with flows as (
  select e.space_id, e.paid_by as user_id, round(e.amount * e.fx_rate)::bigint as delta
    from money.expenses e where e.paid_by is not null
  union all
  select e.space_id, s.user_id, -round(s.amount * e.fx_rate)::bigint
    from money.expense_shares s join money.expenses e on e.id = s.expense_id where s.user_id is not null
  union all
  select space_id, from_user, amount from money.settlements
  union all
  select space_id, to_user, -amount from money.settlements
)
select space_id, user_id, sum(delta)::bigint as balance from flows group by space_id, user_id;

-- ===================================================================== TIME
create table time.calendars (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  color text,
  ics_url text,                                    -- subscribed external feed (read-only)
  ics_export_token text unique                     -- secret feed URL for Google/Apple Calendar
);

-- Time-filling commitments: a course, gym, "Education", "Upkeep"
create table time.activities (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  calendar_id uuid references time.calendars (id) on delete set null,
  name text not null,
  kind text not null default 'block',              -- block (course, shift) | focus (education) | pool-only
  color text,
  location text,
  term_start date, term_end date,                  -- semester bounds
  -- pool behaviour: draw N items/day from items tagged or parented to this activity
  pool_tag_id uuid references core.tags (id) on delete set null,
  pool_parent_item uuid references work.items (id) on delete set null,
  draws_per_day smallint not null default 0,
  draw_days smallint[] not null default '{1,2,3,4,5,6,7}',
  candidate boolean not null default false         -- schedules-repo mode: "considering this course"
);
create table time.activity_blocks (                -- weekly slots: Mon 13:30–15:00 room G402
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references time.activities (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  starts time not null,
  ends time not null check (ends > starts),
  info text
);

create table time.events (                         -- one-off or recurring calendar entries
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  calendar_id uuid references time.calendars (id) on delete set null,
  activity_id uuid references time.activities (id) on delete cascade,
  item_id uuid references work.items (id) on delete set null, -- "time-boxed: repair the door"
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  all_day boolean not null default false,
  rrule text,                                      -- RFC 5545 for imported/advanced cases
  attendees uuid[] not null default '{}'
);

create table time.daily_draws (                    -- persisted so a day's picks are stable
  user_id uuid not null references core.profiles (id) on delete cascade,
  activity_id uuid not null references time.activities (id) on delete cascade,
  day date not null,
  item_id uuid not null references work.items (id) on delete cascade,
  status text not null default 'drawn',            -- drawn | done | rerolled | skipped
  primary key (user_id, activity_id, day, item_id)
);


-- =================================================================== ROSTER
-- Seasons pick which shift templates apply on which dates.
create table roster.seasons (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,                               -- "Low season", "Fiestas", "Summer"
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  priority smallint not null default 0              -- overlapping seasons: highest wins
);

create table roster.shift_templates (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  season_id uuid references roster.seasons (id) on delete cascade, -- null = all year
  name text not null,                               -- "Evening bar"
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',
  starts time not null,
  ends time not null,                               -- may be < starts (crosses midnight)
  headcount_min smallint not null default 1,
  headcount_max smallint not null default 1,
  eligible jsonb not null default '{"any":true}',   -- selector
  fill_mode text not null default 'draw',           -- draw | signup | signup_then_draw
  signup_closes_hours integer not null default 72,  -- for signup_then_draw
  location text,
  check (headcount_min <= headcount_max)
);
-- composition rules live in work.requirements (owner_type = 'shift_template')

create table roster.policies (                      -- one per space
  space_id uuid primary key references core.spaces (id) on delete cascade,
  horizon_days integer not null default 28,
  publish_days_ahead integer not null default 14,   -- drafts become visible/notified
  max_shifts_per_week smallint,
  min_rest_hours smallint,
  fairness_window_days integer not null default 90,
  trades_need_approval boolean not null default false
);

create table roster.availability (                  -- "can't work these dates" / preferences
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  user_id uuid not null references core.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  kind text not null default 'unavailable',         -- unavailable | prefer | prefer_not
  recurring_weekdays smallint[]                     -- e.g. never on Tuesdays
);

-- A concrete shift is a work.items row (kind = 'shift') with starts_at/ends_at
-- in time.events and seats in work.item_assignees; this table adds roster state.
create table roster.shifts (
  item_id uuid primary key references work.items (id) on delete cascade,
  space_id uuid not null references core.spaces (id) on delete cascade,
  template_id uuid references roster.shift_templates (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status text not null default 'draft',             -- draft | published | understaffed | done | cancelled
  generated_seed text                               -- reproducible draws
);

create table roster.attendance (                    -- check-in/out → hours, payroll / volunteer records
  item_id uuid not null references work.items (id) on delete cascade,
  user_id uuid not null references core.profiles (id) on delete cascade,
  space_id uuid not null references core.spaces (id) on delete cascade,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  no_show boolean not null default false,
  note text,
  primary key (item_id, user_id)
);

-- ====================================================================== POS
create table pos.tax_rates (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,                               -- "IVA 10%"
  rate numeric(6, 4) not null                       -- 0.1000
);
create table pos.categories (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null, color text, position smallint not null default 0
);
create table pos.products (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  category_id uuid references pos.categories (id) on delete set null,
  name text not null,
  price bigint not null,                            -- cents, tax included
  member_price bigint,                              -- socio price
  tax_rate_id uuid references pos.tax_rates (id),
  active boolean not null default true,
  position smallint not null default 0
);
create table pos.stock_items (                      -- what you actually buy: keg, bottles, lemons
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,
  unit text not null,                               -- l, unit, kg
  on_hand numeric(12, 3) not null default 0,
  reorder_at numeric(12, 3),                        -- below → purchase item for anyone
  unit_cost bigint
);
create table pos.recipes (                          -- 1 caña = 0.2 l of keg
  product_id uuid not null references pos.products (id) on delete cascade,
  stock_item_id uuid not null references pos.stock_items (id) on delete cascade,
  quantity numeric(12, 3) not null,
  primary key (product_id, stock_item_id)
);
create table pos.registers (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  name text not null,                               -- "Main bar", "Fiestas stall"
  cash_account_id uuid references money.accounts (id), -- daily close posts here
  card_account_id uuid references money.accounts (id)
);
create table pos.till_sessions (                    -- open → sell → count → close
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references core.spaces (id) on delete cascade,
  register_id uuid not null references pos.registers (id),
  shift_item_id uuid references work.items (id) on delete set null, -- who was on duty
  opened_by uuid references core.profiles (id),
  opened_at timestamptz not null default now(),
  opening_float bigint not null default 0,
  closed_by uuid references core.profiles (id),
  closed_at timestamptz,
  counted_cash bigint,
  expected_cash bigint,                             -- float + cash sales − payouts
  difference bigint generated always as (counted_cash - expected_cash) stored
);
create table pos.orders (
  id uuid primary key,                              -- client-generated (offline-first)
  space_id uuid not null references core.spaces (id) on delete cascade,
  session_id uuid not null references pos.till_sessions (id),
  number integer not null,                          -- per register/series, gapless
  status text not null default 'paid',              -- open (tab) | paid | refunded | voided
  member_id uuid references core.org_members (id),
  total bigint not null,
  created_by uuid references core.profiles (id),
  created_at timestamptz not null,                  -- device time, for offline sales
  synced_at timestamptz not null default now()
);
create table pos.order_lines (
  order_id uuid not null references pos.orders (id) on delete cascade,
  line smallint not null,
  product_id uuid references pos.products (id),
  name text not null,                               -- snapshot
  quantity numeric(10, 3) not null,
  unit_price bigint not null,
  tax_rate numeric(6, 4) not null,
  discount bigint not null default 0,
  primary key (order_id, line)
);
create table pos.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references pos.orders (id) on delete cascade,
  method text not null,                             -- cash | card | bizum | member_tab | voucher
  amount bigint not null,
  external_ref text                                 -- card terminal reference
);
-- Fiscal record log (Spain: VERI*FACTU-style hash chain; other countries
-- plug their own). Append-only; each record hashes the previous one.
create table pos.fiscal_records (
  id bigint generated always as identity primary key,
  space_id uuid not null references core.spaces (id) on delete cascade,
  order_id uuid not null references pos.orders (id),
  record_type text not null,                        -- issue | cancel | correct
  payload jsonb not null,                           -- normalised invoice data
  previous_hash text,
  hash text not null unique,
  submitted_at timestamptz,                         -- to the tax authority, when required
  submission_status text
);

-- =============================================================== SECURITY
create function core.is_member(p_space uuid) returns boolean
language sql security definer stable set search_path = core as $$
  select exists (select 1 from core.space_members where space_id = p_space and user_id = auth.uid());
$$;

-- Every table with a space_id gets the same member-only policy. Child tables
-- without one (item_links, comments, materials, expense_shares,
-- activity_blocks, workflow_states, daily_draws, notifications …) get a policy
-- that joins to their parent, e.g. `using (exists (select 1 from work.items i
-- where i.id = item_id))` — which re-applies the parent's RLS. Omitted here
-- for brevity; the chores migration shows the full pattern.
do $$
declare t record;
begin
  for t in
    select c.table_schema, c.table_name from information_schema.columns c
    join information_schema.tables tb using (table_schema, table_name)
    where c.column_name = 'space_id' and tb.table_type = 'BASE TABLE'
      and c.table_schema in ('core', 'work', 'money', 'time', 'roster', 'pos')
  loop
    execute format('alter table %I.%I enable row level security', t.table_schema, t.table_name);
    execute format('create policy member_all on %I.%I for all using (core.is_member(space_id)) with check (core.is_member(space_id))',
                   t.table_schema, t.table_name);
  end loop;
end $$;

-- private items: only creator / assignee (layered on top of member_all)
create policy private_items on work.items as restrictive for select
  using (not private or created_by = auth.uid() or assignee_id = auth.uid());
