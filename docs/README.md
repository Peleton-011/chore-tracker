# Docs: from chore tracker to an operations hub for small organisations

## Executive summary

- **Where we are.** The chore tracker has been rebuilt on Nuxt 4 + Supabase
  (this branch): recurring chores, fair automatic assignment, trades,
  households, invites, fairness stats and live updates, with SQL, unit and e2e
  tests. Contabilify (accounts, recurring fees, Excel) and schedules (timetable
  conflicts) are audited and mapped into the plan ([01](./01-current-state.md)).
- **Focus (revised).** The primary market is **semi-professional
  organisations**: the town's non-profit bar, associations, festival
  committees, small cafés and skill-mixed crews. Households become the free
  tier. Working name **Mise** ("everything in its place", the professional
  kitchen's discipline) ([02](./02-product.md)).
- **What makes it flexible.** Rules are data. People carry *tags* (skills,
  pools, certifications). *Requirements* say how many of a shift's or job's
  people must match a *selector* ("≥1 experienced, ≤1 inexperienced, total 2";
  "≥1 electrician, the rest any trade"). *Seasons* switch rule sets. Seats are
  filled by fair **draw**, **sign-up**, or both. **Anything assigned can be
  traded**, but only if the result still satisfies every rule
  ([03 §3.7–3.8](./03-system-design.md)). The engine is implemented and tested
  in `docs/reference/rostering.ts`.
- **Modules.** Core · Chores · Roster · Tickets (repairs + improvement
  backlog) · Money (accounts from contabilify, splits, budgets) · Bank feeds
  (PSD2 aggregator, read-only, auto-matching) · EPOS (offline-first till tied
  to shifts, stock and books, fiscal-compliant) · Members · Calendar.
- **The plan.** Ship chores (P1) → multi-person core with tags, seats and
  universal trades (P2) → Roster for the bar (P3) → bring contabilify in
  (P4) → EPOS, tally then fiscal (P5) → Tickets, Bank feeds, Members,
  Calendar, Plugins ([05](./05-roadmap.md)). Spain's VERI\*FACTU rules
  (2027) set the clock for any till.
- **Verdict.** Very useful for the target and technically viable. The hard
  parts are an offline-safe till and fiscal compliance. Commercially
  moderate: many small niches served by one engine through vertical packs,
  priced per organisation (never per volunteer), monetised mainly through
  the till, and sold through gestorías and federations. Prove it with the
  bar for a full season first ([07](./07-market.md)).

## Contents

| Doc | What's inside |
|---|---|
| [01 · Current state](./01-current-state.md) | Audit of chore-tracker (legacy + rebuild), contabilify and schedules. Defects, strengths, what carries forward |
| [02 · Product](./02-product.md) | Vision, scenarios, modules vs plugins, name and brand, personas, principles |
| [03 · System design](./03-system-design.md) | Architecture, monorepo layout, unified data model, engines (recurrence, dependencies, money, pools, roster, universal trades, EPOS, bank feeds, members), API, security, notifications, plugins, deployment, migration path |
| [04 · Spec](./04-spec.md) | Glossary, invariants, requirements with ids and status, state machines, normative algorithms, NFRs |
| [05 · Roadmap](./05-roadmap.md) | Phases P0–P10 with exit criteria (the town bar as customer zero), the VERI*FACTU clock, cross-cutting tracks, risks |
| [06 · Additions](./06-additions.md) | 50 candidate features scored for usefulness, viability and effort, including organisation-specific ones (pair rules, training progression, event mode, terminals) |
| [07 · Market](./07-market.md) | Semi-pro positioning, competitors (rota, volunteer, POS, accounting, ERP), the small-niche problem and the answer, pricing, sizing model, GTM, overall viability |

## Reference artifacts (validated)

| File | Validation |
|---|---|
| [`reference/schema.sql`](./reference/schema.sql) | Target unified DDL (core/work/money/time/roster/pos, 57 tables, RLS). `bash docs/reference/check.sh` applies it to a throwaway Postgres |
| [`reference/types.ts`](./reference/types.ts) | Domain types for every module + plugin manifest. `tsc --strict` clean |
| [`reference/algorithms.ts`](./reference/algorithms.ts) | splitAmount, netBalances, pairwiseDebts, simplifyDebts, drawDaily, conflicts, compatibleSets. Tested in `tests/algorithms.test.ts` |
| [`reference/rostering.ts`](./reference/rostering.ts) | Selectors, staffing rules, fair fill (draw), roster checks, constrained trades, valid takers. Tested in `tests/rostering.test.ts` (bar low/high season, skill crews, trades) |
