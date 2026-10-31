# Household Hero

Shared chores that sort themselves out. Set a chore up once ("trash, Mondays and
Thursdays, take turns") and it repeats on its own, gets handed out fairly, and
can be traded when life gets in the way.

This is the **chores module** of a larger life-management platform. The
product vision, formal spec, schema, roadmap and market analysis live in
[`docs/`](./docs/README.md).

> **Stack change.** This branch replaces the original Next.js + MongoDB + Clerk
> app with **Nuxt 4 + Supabase** (Postgres, Auth, Row Level Security,
> Realtime), the same stack as [contabilify](https://github.com/Peleton-011/contabilify).
> The React version is still on `main` until this lands.

## Features

| | |
|---|---|
| **Tasks** | One-off to-dos with due date/time, priority (none → urgent), effort points, notes. "Someday" tasks with no date. |
| **Recurring chores** | Daily / weekly (pick weekdays) / monthly / yearly, every *N* periods, optional end date and time. Month-end and leap-day safe. |
| **Two schedule modes** | *Fixed* (bins every Monday whatever happens) or *after completion* (haircut 5 weeks after the last one). |
| **Automatic assignment** | *Take turns* (ordered rotation), *balance the load* (least effort booked around that date), *always the same person*, or *up for grabs*. |
| **Trading** | Hand a task to a specific person, offer it to anyone in the household, or propose a swap for one of theirs. Accepting is atomic. |
| **Households** | Create, invite by link (7-day, revocable), roles (owner / admin / member), leave, remove, transfer ownership. |
| **Personal space** | Every account gets a private space for its own tasks and chores. |
| **Views** | Today (overdue / today / tomorrow / this week / next week / later / no date, mine vs everyone), Up for grabs, month calendar, household page (tasks, chores, people, activity, settings), trades inbox. |
| **Fairness** | Per-member stats: done in 30 days, effort share, open and overdue. |
| **Activity feed** | Completions, skips, trades, joins and leaves, written by database triggers. |
| **Live updates** | Supabase Realtime pushes task and trade changes to everyone in the household. |

## How it works

```
spaces ──< space_members >── profiles
  │
  ├──< chores ──(materialise ~6 weeks ahead)──> tasks >── task_trades
  └──< activity (append-only, trigger-written)
```

* **Everything hangs from a space.** One Row Level Security rule ("members can
  see rows of their spaces") covers the whole schema.
* **Chores generate tasks.** `private.materialize_chore` writes occurrences
  up to 42 days ahead. It is idempotent, and it runs when a chore is created or
  edited, when an occurrence is closed, and on app load (`sync_my_spaces(today)`).
  The client sends its local "today", so the server's UTC clock never decides
  what day it is. No cron is needed.
* **Editing a chore re-plans the future.** Untouched future occurrences are
  regenerated. Ones you edited or traded by hand are marked `detached` and
  left alone.
* **Privileged multi-row operations are RPCs** (`create_space`,
  `accept_invite`, `propose_trade`, `respond_trade`, `leave_space`, …). Each one
  checks membership itself and runs in a single transaction.
* The recurrence engine exists twice: in SQL (the source of truth) and in
  TypeScript (`shared/utils/recurrence.ts`, for the live preview). A shared
  fixture keeps the two in agreement.

## Getting started

1. Create a Supabase project and apply the migrations in order. Paste them into
   the SQL editor, or run `supabase db push` with the Supabase CLI:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_realtime.sql`
2. In Supabase → Authentication → URL Configuration, set the Site URL and add
   `http://localhost:3000/confirm` (and your production `/confirm`) to the
   redirect URLs.
3. Configure and run:

   ```bash
   cp .env.example .env   # fill SUPABASE_URL and SUPABASE_KEY
   npm install
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run generate` | Static SPA in `.output/public`, deployable to any static host (Vercel, Netlify, Cloudflare Pages) |
| `npm run typecheck` | `vue-tsc` across app, shared and server |
| `npm test` | Unit tests (recurrence, dates, grouping) and the SQL-parity fixture check |
| `npm run test:db` | Starts a throwaway Postgres, applies a Supabase stub and every migration, then runs `supabase/tests/*.sql`: RLS, rotation, trades, re-planning, leaving, month-end clamping, and TS↔SQL recurrence parity. Needs Postgres 15+ binaries. |
| `npm run test:e2e` | Builds the SPA and drives it in Chromium against a mocked Supabase, on desktop and mobile. Fails on any console error. Needs Playwright. |

Regenerate the parity fixture after changing the recurrence rules with
`UPDATE_FIXTURES=1 npm test`.

## Layout

```
app/                 Nuxt 4 app (pages, components, composables, layouts)
shared/types         Row types + supabase-js Database typing
shared/utils         Pure logic: dates, recurrence, grouping (unit-tested)
supabase/migrations  Schema, RLS, triggers, RPCs
supabase/tests       SQL test suite + throwaway-Postgres runner
tests/               Vitest unit tests, Playwright smoke test
docs/                Product spec, system design, roadmap, market analysis
```

## License

MIT
