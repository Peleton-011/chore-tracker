# 02 · Product: vision, positioning, name, brand

## 1. The idea in one sentence

**The operations hub for small places run by people: who works when, what
needs doing, what's broken, what was sold and where the money went. It's
modular, rule-based and fair, and simple enough for volunteers.**

Primary target: **semi-professional organisations**, such as the town's
non-profit bar, a cultural association, a sports club with a canteen, a
festival committee, a small café, a makerspace or a five-person maintenance
crew. Households and individuals get the same product as the free tier,
which also acts as the funnel.

These organisations run on an improvised stack today: a WhatsApp group for
shifts, a spreadsheet rota, a cash box and a notebook, a POS that doesn't talk
to the books, a separate accounting tool (contabilify exists because of
this), and nothing at all for "the fridge door seal is going". Each tool
solves one thing. The value is in the connections:

- **Shift → till → books.** The evening shift (Ana, experienced + Dani) opens
  the till. Sales go through the EPOS. Closing the till posts the day's cash
  and card totals to the *Caja* and *Banco* accounts, and the cash difference
  is attributed to that shift.
- **Sale → stock → purchase.** Each caña deducts 0.2 l from the keg. Below the
  reorder point, a *purchase* item "Order beer kegs" appears for whoever does
  supplier runs. When it's done, it becomes an expense and a bank transaction
  matches it automatically.
- **Rules everywhere, including trades.** Low season: two people a day, at least
  one experienced and at most one inexperienced. Dani can swap with Fran
  (both inexperienced). Ana can't hand her shift to Fran if that would leave
  the day with no experienced person, and the app explains why and shows
  who *can* take it.
- **Issues → improvement.** "Tap leaks" goes through diagnosis, the part to
  order and its cost, and the repair, which goes to the one volunteer who knows
  plumbing. "Upgrade to a second register for fiestas" sits in the
  improvement backlog with an estimated cost, linked to this year's budget.
- **Bank feed → reconciliation.** Real transactions arrive from the bank, get
  matched to expenses and till closes, and the treasurer only reviews what
  didn't match.

The household scenarios from the original brief still work unchanged (chores, bin
bags, the toilet seal, upkeep pools). They're the same engine with
lighter rules.

## 2. Core concepts (what makes it flexible)

The town bar's "experienced / inexperienced" split is **an example of data,
not a feature**. The product is built on four generic ideas:

| Concept | What it is | Bar example | Crew example | Household example |
|---|---|---|---|---|
| **Tags on people** | Skills, pools, certifications (optionally expiring) | `experienced`, `inexperienced`, `food-handler` | `electrician`, `plumber`, `hvac`, `lead` | none needed |
| **Requirements** | "Between *min* and *max* of the people on this must match *selector*." Selectors combine tags with any-of / all-of / not / specific people | ≥1 `experienced`, ≤1 `inexperienced`, total 2 | ≥1 `electrician`; everyone ∈ any-of(trades); total 3 | none (anyone) |
| **Fill modes** | How seats get filled: fair **draw**, open **sign-up**, or **sign-up then draw the gaps** | draw in low season, sign-up for fiestas | lead assigns, then draw | rotation / balance |
| **Universal trades** | Anything assigned can be handed over or swapped *if the result still satisfies every rule* | shift seats | job seats | chores, tickets |

Seasons (date ranges) switch which shift templates and rules apply, so
"low season" and "high season" with several differently composed shifts are
both just configuration.

## 3. Modules

| Module | For | Status |
|---|---|---|
| **Core** | People, spaces (personal / household / team / organisation), roles, tags, invites, events, agenda | in place (chores rebuild) |
| **Chores & tasks** | Recurring responsibilities, rotation, balancing | ✅ built |
| **Roster** | Shift templates, seasons, staffing rules, draw/sign-up, availability, trades, attendance | designed + reference engine tested |
| **Tickets** | Issues, repairs, improvement backlog, workflows, boards, materials, costs | designed |
| **Money** | Expenses and splits (households), accounts and transactions (organisations), budgets, reimbursements | designed (contabilify is the base) |
| **Bank feeds** | PSD2 account data via an aggregator, auto-matching | designed |
| **EPOS** | Catalogue, member prices, tabs, till sessions, stock and recipes, daily close into the books, fiscal compliance | designed |
| **Members** | Association members, fees, member pricing at the till | designed |
| **Calendar** | Events, activities, term planner, pools | designed |

Plugins follow the staged approach in [03 §8](./03-system-design.md#8-plugin-architecture):
first-party modules, then templates, then sandboxed integrations.

## 4. Name

**Mise** (as in *mise en place*, "everything in its place") fits even better
now: *mise en place* is the professional kitchen's discipline of having every
station staffed, stocked and ready before service. That's exactly what a bar
or crew needs.

- Modules are **stations** (Roster, Till, Tickets, Ledger, Chores, Calendar).
  A day's plan is the **prep list**. Closing the till is **closing service**.
- Short and pronounceable in English, Spanish and Portuguese.
- Taglines: **"Everything in its place."** For organisations: **"Run your place
  like a good kitchen."**

| Alternative | Why it's good | Why it's second |
|---|---|---|
| **Quarters** | Living quarters, shares, HQ | Real-estate connotation. A co-living brand used it |
| **Commons** | Community, shared resources, fits non-profits | Generic, hard to own |
| **Rota** | Exactly the shift and chore word in UK/ES usage | Too narrow once you add EPOS and books |
| **Keel** | Steadiness | Quiet. Name is crowded |

> ⚠️ Check trademarks (EUIPO/OEPM/USPTO), app stores and domains before
> committing. Recipe apps named "Mise" exist. *Mise Ops*, *mise.app* or
> *usemise* are fallbacks. I couldn't verify availability from here.

## 5. Brand

| Element | Direction |
|---|---|
| **Personality** | Calm, fair, competent. A good shift manager, not HR software. |
| **Voice** | Short and concrete. "Ana can't hand this shift to Fran: the evening would have no experienced volunteer. Ben or Cris can take it." Explain the rule, offer the way out. |
| **Colour** | Deep indigo `#5B4BDB` primary, tomato `#E0603A` accent, herb green `#15935A` for done/balanced, paper neutrals. Already used by the chores app. |
| **Type** | Fraunces (headings) + Inter (UI), already in use. Tabular figures for money and the till. |
| **Logo idea** | A rounded square containing three small circles in a ring (stations / people) seen from above, like prep bowls. |
| **Till UI** | Different register: big touch targets, high contrast, one-hand use, works in a dark bar. |

## 6. Who it's for

| Persona | Situation | Jobs to be done | Must-haves |
|---|---|---|---|
| **The volunteer coordinator** (non-profit bar, association) | 15–40 volunteers, seasonal opening, rules about who can be on together, volunteers who swap on WhatsApp | Publish a fair rota that respects the rules. Let people swap without breaking it. Know who's on tonight | Tags + rules, draw/sign-up, constrained trades, availability, reminders |
| **The treasurer** | Cash box, bank account, receipts in a shoebox, yearly report for the assembly | Books that build themselves from the till and the bank. Reimbursements for volunteers who paid out of pocket | Till close → accounts, bank feed + matching, reimbursable expenses, exports |
| **The small-venue owner** (café, bar, 2–8 staff) | Mixed staff skills, legal time-tracking, a POS, a supplier list, things breaking | One app instead of four. Compliant till. Staff hours | EPOS + compliance, roster + attendance, stock, tickets |
| **The crew lead** (maintenance, events, trades) | Jobs needing specific skills | Staff each job with the right mix. Track materials and costs per job | Skill rules, job items with materials and costs, trades |
| **The flatshare organiser / household** (free tier) | Chores, shared costs | Fair rota, splits | Existing chores + money split |

## 7. Product principles

1. **Rules are data, never code.** Any staffing rule a coordinator can say in
   a sentence should be expressible without a developer.
2. **Fair and explainable.** Every assignment and every rejected trade says
   why ("lowest hours in the last 90 days", "would leave the shift without an
   experienced volunteer").
3. **Trade anything, break nothing.** Anything assigned to a person can be
   traded where the space has more than one person and the rules still hold.
4. **Everything links.** Shift ↔ till session ↔ cash difference. Sale ↔ stock ↔
   purchase ↔ expense ↔ bank transaction. Issue ↔ materials ↔ cost.
5. **Volunteer-proof.** Works from a link on any phone, in Spanish,
   Portuguese or English. One-tap actions. Offline at the till.
6. **Own your data.** Exports for everything, an open-source core, self-hostable.
