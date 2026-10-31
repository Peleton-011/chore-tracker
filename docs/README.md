# Docs

## Start here

**[00 · Scope](./00-scope.md)** is the grounded plan, and it wins over everything else:
- a **small core** (people, spaces, roles, tags, invites, activity);
- **two domains**: *Work* (chores, shifts, issues as one item engine with rules
  and rule-checked trades) and *Books* (contabilify + costs on items);
- **imports**, not modules, for bank and till data;
- about 16 tables and five milestones (~5–6 months part-time), with the town bar's
  rota as the first real test.

Own EPOS, live bank aggregation, members, pools and plugins are **parked**.

Docs 01–07 are background and long-range vision.

## Contents

| Doc | What's inside |
|---|---|
| [00 · Scope](./00-scope.md) | **The grounded plan:** what's core, how domains split, what's parked, five milestones |
| [01 · Current state](./01-current-state.md) | Audit of chore-tracker (legacy + rebuild), contabilify and schedules. Defects, strengths, what carries forward |
| [02 · Product](./02-product.md) | Vision, scenarios, modules vs plugins, name and brand, personas, principles |
| [03 · System design](./03-system-design.md) | Architecture, monorepo layout, unified data model, engines (recurrence, dependencies, money, pools, roster, universal trades, EPOS, bank feeds, members), API, security, notifications, plugins, deployment, migration path |
| [04 · Spec](./04-spec.md) | Glossary, invariants, requirements with ids and status, state machines, normative algorithms, NFRs |
| [05 · Roadmap](./05-roadmap.md) | Superseded by 00 §8 (old version in git history) |
| [06 · Additions](./06-additions.md) | 50 candidate features scored for usefulness, viability and effort, including organisation-specific ones (pair rules, training progression, event mode, terminals) |
| [07 · Market](./07-market.md) | Semi-pro positioning, competitors (rota, volunteer, POS, accounting, ERP), the small-niche problem and the answer, pricing, sizing model, GTM, overall viability |

## Reference artifacts (validated)

| File | Validation |
|---|---|
| [`reference/schema.sql`](./reference/schema.sql) | Target unified DDL (core/work/money/time/roster/pos, 57 tables, RLS). `bash docs/reference/check.sh` applies it to a throwaway Postgres |
| [`reference/types.ts`](./reference/types.ts) | Domain types for every module + plugin manifest. `tsc --strict` clean |
| [`reference/algorithms.ts`](./reference/algorithms.ts) | splitAmount, netBalances, pairwiseDebts, simplifyDebts, drawDaily, conflicts, compatibleSets. Tested in `tests/algorithms.test.ts` |
| [`reference/rostering.ts`](./reference/rostering.ts) | Selectors, staffing rules, fair fill (draw), roster checks, constrained trades, valid takers. Tested in `tests/rostering.test.ts` (bar low/high season, skill crews, trades) |
