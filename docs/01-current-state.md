# 01 · Where the project is today

An audit of the three repositories as of 31 Oct 2026, plus what this branch
changed. Sections: [chore-tracker (legacy)](#1-chore-tracker--legacy-nextjs--mongodb--clerk) ·
[chore-tracker (rebuild)](#2-chore-tracker--rebuild-this-branch) ·
[contabilify](#3-contabilify) · [schedules](#4-schedules) ·
[cross-repo synthesis](#5-synthesis-what-carries-forward).

---

## 1. chore-tracker — legacy (Next.js + MongoDB + Clerk)

**Shape:** 323 commits, last activity March 2025 (PR #25, "experimental"). Next 14
App Router, Mongoose 8, Clerk 6, Pico CSS + SCSS, React Context for state.
About 3.5k lines of TS/TSX in 22 API routes, 17 components, 7 models. No tests.

### 1.1 Data model

| Model | Purpose | Observations |
|---|---|---|
| `User` | Mirror of the Clerk user (webhook-synced) | Duplicated `households[]` array kept in sync by hand with `Household.members[]`. Two sources of truth. |
| `Household` | Group | `tasks[]` array of refs plus `Task.household` back-ref, again a dual source of truth. No roles. |
| `Task` | A dated to-do | Has one `user` (owner) but no *assignee*: household tasks are always "the creator's". `isPlaceholder` was a generated-occurrence flag. `reminders[]` stored but never delivered. |
| `RecurringTaskDefinition` | Recurrence rule | `intervalUnit` included `minutes`/`hours`. A 15-minute chore materialised 90 days ahead is about 8,600 documents. No weekdays and no rotation. |
| `TaskRotation` | Rotation order | Defined, never used. |
| `TaskTrade` | Trade request | `pending/accepted/declined`. No swap and no open offers. |
| `Invite` | Join token | 3 random bytes, so 16.7M possibilities. That can be brute-forced. |

### 1.2 What worked
- Households: create, edit, delete; invite link and join flow; member list.
- Task CRUD with the Overdue / Today / Week / Month / Someday grouping.
- A calendar view (react-calendar), responsive sidebar and mobile nav, a dark Clerk theme.
- Reasonable component split after the March 2025 refactor (`CreateTask`, `AutonomousModal`).

### 1.3 Defects found in the audit
These are the reasons I chose to rebuild rather than port the code.

**Security / data exposure**
1. `GET /api/households/[id]/tasks` and `/members` have no auth or membership check. Anyone signed in could read any household by id.
2. `DELETE /api/tasks/[id]` doesn't check ownership. Anyone could delete anyone's task.
3. `GET /api/trades` returns every trade in the database. The `fromUser/[id]` and `toUser/[id]` routes read `params.fromUser`/`params.toUser` while the folder is `[id]`. The filter comes out `undefined`, Mongoose drops it, and those routes also return every trade.
4. `POST /api/households/[id]/invites` doesn't check membership. Combined with the 3-byte tokens, that's an enumeration risk.
5. `/api/tasks/placeholders/:id` is listed as a public route. Unauthenticated callers can make the server generate tasks.

**Correctness**
6. Errors are returned as `NextResponse.json({ error, status: 500 })`. The status sits in the body, so every error is an HTTP 200 and the client shows "success" toasts.
7. Recurring creation calls `axios.post('http://localhost:3000/…')` from the server, which breaks in any deployment. `generatePlaceholders.ts` has an inverted guard (`if (!id)`) and only ever calls with `undefined`.
8. Mongo transactions are opened, but `Task.create` and `findByIdAndUpdate` run outside the session. Failures leave partial writes.
9. Placeholder generation runs on every app load from `startDate`, deduped by exact timestamp. Any time drift duplicates occurrences.
10. `DELETE /api/tasks/old` runs on every load and erases completed tasks older than a month, and with them any history or fairness data.
11. `TaskItem`'s complete toggle sends the *unchanged* task (`updateTask(task)` instead of `newTask`), so tasks can't be completed from the list.
12. `CreateTask` throws away everything `DateTimeSelector` returns except the date. Time and recurrence are lost, so recurring chores can't be created from the UI.
13. Trades: the provider posts to `/api/trades` (which has no POST) and PUTs `/api/trades/:id` (which doesn't exist). The real routes are `/request` and `/respond`. `TaskTradeSelector`'s `onSelect` stores state nobody reads. **Trading never worked end to end.**
14. Deleting a household only unlinks it from the deleter. Other members keep dangling references, and its tasks are orphaned.
15. Clerk webhook: `user.updated` stores the email *object* in `email`, and `user.delete()` isn't a Mongoose document method.
16. `ContextProvider` waits a hard-coded 1 s `setTimeout` before rendering anything, and its effect has no dependency array.
17. `Sidebar` uses `{cond && <About/>} && <NewTask/>`, which hides the About link.
18. The README advertises reminders, notifications and Tailwind. None of them exist.

**Verdict:** the UX ideas (date buckets, trading, invite links) were sound. The
backend needed a rewrite either way. Moving to Supabase removes about 80% of
that code: auth, user sync, membership checks and transactions become Postgres
features.

---

## 2. chore-tracker — rebuild (this branch)

Nuxt 4 SPA + Supabase. It follows contabilify's conventions (composables over
`useState`, hand-written DB types, SQL-side generation without cron), with
English identifiers throughout.

| Area | Status |
|---|---|
| Auth | Supabase email + password, magic link, confirm callback, redirect-back cookie |
| Spaces | Personal (auto-created) + households; owner/admin/member; invites (128-bit, expiring, revocable, max uses); leave (ownership passes on, last one out deletes); remove; role changes |
| Tasks | CRUD, date + optional time, no-date "someday", priority 0–4, effort 1–5, claim (up for grabs), skip, undo, completed-by tracking |
| Chores | daily/weekly(weekdays)/monthly/yearly × every N; fixed or after-completion; start/end; time; rotation/balanced/fixed/unassigned; pause; live preview |
| Generator | 42-day horizon, idempotent, re-plans on edit, `detached` occurrences survive, rotation re-planned when members leave |
| Trades | Directed hand-over, open offer to anyone, swap; accept/decline/withdraw; auto-expire when a task closes or passes; atomic RPC |
| Views | Today (buckets, mine/everyone, up for grabs, recently done), calendar, household (tasks/chores/people/activity/settings), trades inbox |
| Fairness | 30-day done count, effort share bar, open/overdue counts |
| Live | Realtime refresh of tasks and trades |
| Tests | 30+ SQL assertions (RLS, rotation, trades, re-planning, leave, clamping), TS↔SQL recurrence parity over 4 years × 9 rules, 24 unit tests, Playwright smoke on desktop + mobile |

**Deliberately not done yet** (see the roadmap): push/email reminders, i18n,
PWA install/offline, migrating data from Mongo (the legacy app appears to have
no production users; if it does, a one-off script mapping Clerk emails to
Supabase users is about half a day of work).

**Known limitations**
- The generator's "today" in triggers is the server's UTC date. The client
  passes its local date on load, so it only matters within a few hours of
  midnight.
- "Balanced" assignment is greedy at generation time. It doesn't rebalance
  occurrences that were already generated when someone's load changes later.
- Any member can reassign any household task directly (trust model of a flat).
  Trades are the polite path, not an enforced one.

---

## 3. contabilify

**Shape:** 77 commits, active until Sept 2026. Nuxt 3 + `@nuxtjs/supabase` +
Tailwind 4 / shadcn-nuxt (partially) + ECharts + ExcelJS. Spanish UI and
identifiers. Built for a cultural association's cash and bank books ("El Chiring").

**Strengths worth keeping**
- **Multi-tenancy done right:** `ledgers` + `ledger_members` with roles, and
  *composite foreign keys* `(id, ledger_id)` so a child can never point into
  another tenant even if RLS has a bug. The unified schema keeps this pattern.
- **SQL-side recurring engine** (`materializar_movimientos_recurrentes`):
  fixed and percentage components, rate-period conversion via compound
  interest, balance basis (start/average/end), rounding modes, lazy
  materialisation, and a staleness view for when backdated entries invalidate
  a computed fee. It's the most sophisticated code across the three repos and
  is directly reusable for bank fees, interest and subscriptions in the money
  module.
- **Quick-entry UX** tuned for mobile: active account remembered, entities
  sorted by frequency, transfers as linked pairs via `metadata.transferencia_id`.
- Excel export/sync with the legacy spreadsheet, an admin invite flow through
  the Supabase Admin API, and a keep-alive cron so the free tier isn't paused.

**Gaps relative to the vision**
- It models *accounts and movements* (bookkeeping), not *people owing people*
  (Splitwise). No splits, shares, settlements or debt graph.
- Single currency, `numeric(12,2)` amounts (fine, though the platform should
  use integer cents everywhere for exact splitting).
- Spanish schema names (`cuentas`, `movimientos`). Merging means either a
  translation migration or keeping it as a bounded context behind views.
- Roles are member (read-only) and admin (write). A household needs "everyone
  writes their own expenses".

**Recommendation:** don't merge contabilify's tables into the household money
model. Keep its *engines* (recurrence, import/export, quick entry) and port them
into `money.accounts` / `money.transactions` as the "Accounts" sub-module. The
association keeps running on contabilify until the platform's Accounts module
reaches parity. Then migrate via views.

---

## 4. schedules

**Shape:** 35 commits, vanilla JS (1,158 lines) + CSS, no build, `localStorage`
only. Portuguese weekday keys (`seg, ter, qua, qui, sex`).

**What it does:** you enter courses with weekly slots (`{ day: { start, end, info } }`).
It renders a weekly grid, flags overlapping slots, and enumerates every
conflict-free combination of *k* courses, so you can pick a term timetable.

**What carries forward:**
- The concept becomes `time.activities` + `time.activity_blocks`, with
  `candidate = true` for "courses I'm considering".
- Conflict detection and the combination finder are reimplemented in
  `docs/reference/algorithms.ts` (`conflicts`, `compatibleSets`), with
  backtracking instead of brute-force C(n, k), and unit-tested against the
  repo's own sample data.
- The grid renderer becomes the week view of the calendar module.

**What doesn't:** keying courses by display name, hard-coded weekdays, no term
dates, no persistence beyond one browser.

---

## 5. Synthesis: what carries forward

| From | Asset | Lands in |
|---|---|---|
| chore-tracker (rebuild) | spaces/members/invites, RLS pattern, recurrence engine + parity tests, assignment strategies, trades, activity feed, app shell | **core** + **chores** |
| contabilify | composite-FK tenancy, recurring money engine, quick entry, Excel import/export, keep-alive | **money** (Accounts sub-module) |
| schedules | weekly blocks, conflict detection, combination finder | **calendar** (activities, term planner) |
| ticketing brief | repair workflow, diagnosis → materials → cost, next action, asset history | **tickets** |

The three codebases agree on stack (Nuxt + Supabase) and differ on language
(EN/ES/PT) and naming. The highest-leverage next step is to **extract a
shared core** (auth, spaces, members, invites, shell, design tokens) into a
Nuxt layer before building the second module. See
[03-system-design.md](./03-system-design.md) and [05-roadmap.md](./05-roadmap.md).
