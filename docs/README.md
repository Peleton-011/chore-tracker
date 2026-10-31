# Docs: from chore tracker to life-management platform

## Executive summary

- **Where we are.** The chore tracker has been rebuilt on Nuxt 4 + Supabase
  (this branch). It has recurring chores, fair automatic assignment
  (rotation and load balancing), trades and swaps, households with invites
  and roles, a fairness view, an activity feed and live updates. It's covered
  by SQL, unit and end-to-end tests. The legacy React/Mongo app had a dozen
  security and correctness defects ([01](./01-current-state.md)) and trading
  never worked end to end there.
- **Where it's going.** One platform, provisionally **Mise** ("everything in
  its place"). A small core (people, spaces, a unified *item*, recurrence,
  assignment, events, agenda) plus switchable modules: **Chores, Money,
  Tickets, Calendar**. Third-party plugins come later through a narrow,
  sandboxed door ([02](./02-product.md), [03](./03-system-design.md)).
- **What makes it different.** The links between domains. A chore spawns a
  purchase, the purchase becomes a split expense, an issue's steps hand off
  between people, and a time block draws tasks from a pool. All of it is
  built for households, not just individuals.
- **The plan.** Ship chores to real flats (P1) → extract the core (P2) →
  Money with settle-up and debt simplification (P3) → Tickets (P4) →
  Calendar, activities and pools (P5) → notifications/PWA, plugins/API, and
  contabilify parity ([05](./05-roadmap.md)).
- **Verdict.** Highly useful and technically very viable. Commercially
  modest, unless the flatshare wedge spreads organically or a landlord
  maintenance angle validates. Build it for yourself and your flat first
  ([07](./07-market.md)).

## Contents

| Doc | What's inside |
|---|---|
| [01 · Current state](./01-current-state.md) | Audit of chore-tracker (legacy + rebuild), contabilify and schedules. Defects, strengths, what carries forward |
| [02 · Product](./02-product.md) | Vision, scenarios, modules vs plugins, name and brand, personas, principles |
| [03 · System design](./03-system-design.md) | Architecture, monorepo layout, unified data model, engines (recurrence, dependencies, money, pools, agenda), API, security, notifications, plugins, deployment, migration path |
| [04 · Spec](./04-spec.md) | Glossary, invariants, requirements with ids and status, state machines, normative algorithms, NFRs |
| [05 · Roadmap](./05-roadmap.md) | Phases P0–P8 with exit criteria, cross-cutting tracks, risks |
| [06 · Additions](./06-additions.md) | 32 candidate features scored for usefulness, viability and effort |
| [07 · Market](./07-market.md) | Competitors, segments, beachhead, sizing model, business models, GTM, overall viability |

## Reference artifacts (validated)

| File | Validation |
|---|---|
| [`reference/schema.sql`](./reference/schema.sql) | Target unified DDL (core/work/money/time, 34 tables, RLS). `bash docs/reference/check.sh` applies it to a throwaway Postgres |
| [`reference/types.ts`](./reference/types.ts) | Domain types for every module + plugin manifest. `tsc --strict` clean |
| [`reference/algorithms.ts`](./reference/algorithms.ts) | splitAmount, netBalances, pairwiseDebts, simplifyDebts, drawDaily, conflicts, compatibleSets. Tested in `tests/algorithms.test.ts` |
