# 00 · Scope: the grounded plan

**Read this first.** Docs 02–07 explore the full vision. This page decides
what actually gets built. Where they disagree, this page wins.

## 1. Was it getting bloated? Yes.

The previous plan had 9 modules, 57 tables, 10 phases and a plugin system,
which is roughly 70 weeks of part-time work before the bar would use half of it.
Three things inflated it:

1. **Counting the same thing several times.** Chores, shifts, tickets,
   purchases and "calendar items" were planned as separate modules, but
   they're all *work assigned to people, with dates, rules and trades*.
2. **Platform before product.** Module manifests, per-space toggles, a plugin
   API and template marketplaces only pay off with many users and outside
   developers. We have zero of both.
3. **Building what can be bought or imported.** A legally compliant till and
   live bank aggregation are each a product in their own right, with
   regulatory weight.

## 2. Is the module idea good?

**As a way to organise the code: yes.** Clear boundaries (one folder and one
set of tables per domain, talking through a small shared core) keep a growing
codebase sane and testable.

**As a product feature: not now.** No plugin system, no module marketplace, no
per-space module manifests. If a space doesn't need money, it hides that tab
with a simple setting. Revisit only if strangers start asking to extend it.

## 3. How to split it: two domains on a small core

```
┌──────────────────────────────────────────────────────────────┐
│ CORE: people & places                                         │
│   accounts · spaces (personal / household / organisation)     │
│   members · roles · tags (skills, pools) · invites · activity │
├──────────────────────────────┬───────────────────────────────┤
│ WORK: what needs doing, by   │ BOOKS: where money goes        │
│ whom, when                   │   accounts · transactions      │
│   items (task / chore /      │   expenses (+ optional splits) │
│     shift / issue)           │   settle up · reports          │
│   recurrence · seats         │   ← linked to items ("cost of")│
│   rules (requirements)       │                                │
│   assignment (rotation,      │                                │
│     balance, draw, sign-up)  │                                │
│   trades (rule-checked)      │                                │
│   sub-items & blockers       │                                │
├──────────────────────────────┴───────────────────────────────┤
│ IMPORTS (adapters, not modules): bank CSV → later aggregator, │
│ POS daily totals, contabilify migration, iCal export          │
└──────────────────────────────────────────────────────────────┘
VIEWS over the same data: Today · Rota (week grid) · Calendar · Board · Books
```

Why this split:
- **Work is one domain.** A chore is a recurring item. A shift is a timed
  item with several seats and a staffing rule. An issue is an item with
  sub-items, blockers and a cost. One engine gives you rotation, rules and
  trades for all of them *for free*, which is exactly the "everything
  tradeable" requirement.
- **Books is the other.** Contabilify already is it. Household splits are a
  small extension (expense + shares + settle up).
- **Calendar and rota are views**, not modules: they render dated items.
- **Bank feeds and the till are integrations into Books**, not domains.

## 4. What the core is

| Core contains | Not core (lives in a domain) |
|---|---|
| Profiles, spaces, membership, roles | Items, recurrence, assignment (Work) |
| Tags on members (skills, pools, certs) | Accounts, expenses (Books) |
| Invites | Import adapters |
| Activity log + notifications | Views |
| App shell, auth, i18n, design tokens | |

Rule of thumb: **core = anything both Work and Books need.** Today that's
"who is in this space, and what can they do".

## 5. Data model: ~16 tables, not 57

| Area | Tables |
|---|---|
| Core (6) | `profiles`, `spaces`, `space_members`, `member_tags`, `invites`, `activity` |
| Work (6) | `series` (recurrence + assignment), `items`, `item_assignees` (seats), `requirements` (staffing/eligibility rules), `item_links` (blocks / sub-item), `trades` |
| Books (4) | `accounts`, `transactions`, `expenses` (+ `expense_shares` when splitting), `settlements` |

The current chores schema is already most of Core + Work. Getting there means
adding `member_tags`, `item_assignees`, `requirements` and `item_links`, plus
a `starts_at/ends_at` time window on items. The rostering engine
(`docs/reference/rostering.ts`, tested) is the assignment/trade logic for
seats.

## 6. Parked (good ideas, not on the plan)

| Idea | Why parked | What to do instead |
|---|---|---|
| **Own EPOS** | Compliance (VERI\*FACTU 2027), offline sync, hardware: a product in itself, with legal liability | The bar keeps (or buys) a compliant till. **Import its daily totals** into Books (CSV/API). Revisit only if many customers ask |
| **Live bank aggregation** | Aggregator contracts, consent renewal, cost | **Bank CSV import + matching** first. The adapter interface keeps the door open |
| Members & fees register | Useful, but the bar runs fine with a spreadsheet + contabilify | Later, as a Books feature |
| Plugin system, manifests, marketplace | No users or outside developers yet | Plain code modules |
| Activity pools, term planner, wishlists, assets | Personal-life features, not the bar's problems | Personal spaces can already use items. Revisit after v1 |
| Custom workflow editor | Over-engineering | Items get a fixed status set (to do / doing / waiting / done) + free-text "next action" |
| 50-item additions list | Distraction | Pick from it only when a real user asks |

## 7. Who it's for (v1)

**Small groups that share work and money: a flat, or a small
organisation like the town bar.** Both need exactly Core + Work + Books.
Personal life-management is a happy side effect of personal spaces, not a
target.

## 8. The plan (≈ 5–6 months part-time)

| # | Milestone | Weeks | Done when |
|---|---|:-:|---|
| 1 | **Ship chores** as built: deploy, Spanish, email digest | 3 | Your flat uses it for 2 weeks |
| 2 | **Rota for the bar:** tags, seats, requirements, seasons, draw + sign-up, rule-checked trades (generic for all items), week-grid view, iCal | 8 | One real month of the bar's rota runs in it, with no WhatsApp swaps |
| 3 | **Books:** bring contabilify in (accounts, transactions, recurring, Excel), "add cost" on any item, reimbursements | 6 | The treasurer closes a month in it. Totals match contabilify |
| 4 | **Issues:** sub-items, blockers with hand-off notification, cost roll-up, status + next action, board view | 4 | The broken tap and one improvement project live here with costs |
| 5 | **Imports:** bank CSV + matching, till daily totals | 3 | A month's bank lines matched in under 15 minutes |

After step 5, stop and look at usage before adding anything else.
Candidates then: household splits + settle up, live bank feed, member fees,
the bar's own till.

## 9. What changes in the repo

- `docs/05-roadmap.md` is replaced by §8 above.
- Docs 03, 04, 06 and 07 stay as **vision / reference**. Their EPOS, bank
  aggregation, members, pools and plugin sections are parked per §6.
- The reference schema (57 tables) is the long-range picture. The v1 schema is §5.
