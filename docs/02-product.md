# 02 · Product: vision, name, brand

## 1. The idea in one sentence

**A home base for everything that keeps a life running: the chores, the
repairs, the money and the time. Modular, shared with the people you live with,
and fair by design.**

Today these live in five apps that don't talk to each other: a chore rota
(Flatastic, Sweepy), a bill splitter (Splitwise, Tricount), a to-do list
(Todoist), a calendar (Google), and a Notion page for "the door is broken".
The connections between them are what's missing:

- *The trash chore* reveals *no bin bags* → a **purchase** for anyone → bought
  for €3.20 → an **expense** split three ways → the chore is unblocked.
- *The toilet seal is loose* → an **issue** with a diagnosis → **materials**
  (silicone, €6) → step 1 "buy silicone" goes to *anyone*; step 2 "apply" goes
  to *the person who knows how*, and only shows up in their day **once step 1
  is done** → the actual cost rolls up into the issue.
- *Upkeep* is a **time block**, Mon–Fri 19:00–19:30 → each day the system
  **draws one** of "tidy desk / sweep room / cut hair" into your agenda,
  favouring the ones you've neglected.
- *Someday: buy a drill* → a **purchase** with "things I want to do with a
  drill" as children → when you finally buy it, the cost lands in the books
  and the children become actionable.

Each of those features exists somewhere already. What's new is the **graph
between them**, and doing it **for a household, not an individual**.

## 2. Answering the open questions

**"A strong baseline for life management, plus plugins?"** Yes, with a
distinction that matters:

1. **A small, opinionated core.** People, spaces, membership, one unified
   *item* (anything to do or track), recurrence, assignment, the event log,
   the agenda. Every module speaks this language.
2. **First-party modules** (Chores, Money, Tickets, Calendar) built as
   separate packages (Nuxt layers + Postgres schemas) and switchable per
   space. A flat might enable Chores + Money; a personal space might enable
   Tickets + Calendar.
3. **Third-party plugins** come *last* and through a narrow door: manifest,
   scoped permissions, webhooks and a REST API, UI in a sandboxed iframe.
   Never arbitrary code in your database. Plugin ecosystems only matter once
   there are users. Design the seams now and open them later.

**"Independent modules or one system?"** One database and one app shell,
with modules as *bounded contexts* that own their tables and talk through the
core's item and event model. That gives you the independence that matters
(develop, enable and test separately) without the kind that hurts (separate
logins, duplicated member lists, cross-app sync). The repos converge on one
monorepo. Contabilify keeps running standalone until Money reaches parity.

## 3. Name

The current names describe one module each ("Household Hero", "Contabilify",
"Schedules"). The platform needs a name that covers *home + money + time +
projects* and still works when it's just you.

**Recommendation: Mise** (as in *mise en place*: "everything in its place").

- It's what the product does: every chore, cost, repair and hour has a place
  and a person.
- The kitchen metaphor gives a whole vocabulary for free. Modules are
  **stations** (Chores, Ledger, Tickets, Calendar). Your daily agenda is your
  **prep list**. Settling up is **closing the till**. Plugins are **extra
  stations**.
- Short and pronounceable in English, Spanish and Portuguese (the three
  languages already in these repos). Two syllables: *meez*.
- Tagline: **"Everything in its place."** For households: **"Run your home
  like a good kitchen."**

| Alternative | Why it's good | Why it's second |
|---|---|---|
| **Quarters** | Living quarters, splitting into shares, "HQ" | Taken by a former co-living brand. Reads as real-estate |
| **Commons** | Shared resources, fairness, community | Generic, hard to own. Weak for solo use |
| **Keel** | Keeps your life steady | Quiet, less evocative. Several apps already use it |
| **Hearth** | Warm, home-centred | Taken by a smart-display product. Home-only |
| **Rota** | Exactly what chores are in UK/ES English | Too narrow once you add money and tickets |

> ⚠️ Before committing: check trademark registries (EUIPO, USPTO), the App
> Store / Play Store and domains. Recipe apps called "Mise" exist. A suffixed
> form (*Mise Home*, *usemise.app*, *mise.house*) is the usual way around that.
> I couldn't verify availability from here.

## 4. Brand

| Element | Direction |
|---|---|
| **Personality** | Calm, fair, a bit witty. A good flatmate, not a drill sergeant. Never guilt-trips. |
| **Voice** | Short, concrete, second person. "Bob asks you to take the trash on Thursday." Not "A trade request has been received." Celebrates without confetti spam. |
| **Colour** | Deep indigo `#5B4BDB` (focus, trust) as primary. Warm tomato `#E0603A` as accent (kitchen, energy). Herb green `#15935A` for done. Paper neutrals `#F6F5FB` / `#1C1A2B`. The chores app already uses the indigo set. |
| **Type** | A friendly serif for headings (Fraunces, already in use) + Inter for UI. The serif keeps it homely rather than corporate. |
| **Logo idea** | A rounded square holding a stylised *mise* bowl seen from above: three small circles (stations) in a ring. Doubles as a "three people sharing" mark. |
| **Iconography** | Rounded 2px-stroke line icons. One illustration style for empty states (hand-drawn kitchen/home objects). |
| **Module names** | Chores · Ledger · Tickets · Calendar, with optional kitchen nicknames in marketing only (Rota, Till, Fix-it, Prep). |

## 5. Who it's for

| Persona | Situation | Jobs to be done | Must-haves |
|---|---|---|---|
| **The flatshare organiser** (22–35) | 3–5 people, rotating chores, shared groceries, arguments about fairness | Fair, automatic rota. Swap when travelling. Split the bin-bag money without awkwardness | Rotation, trades, splits + settle, mobile, free for the flatmates |
| **The couple / young family** | 2 adults ± kids, invisible mental load | Make the work visible and balanced. Plan repairs and purchases | Effort balancing, shared calendar, tickets, budgets |
| **The life-admin power user** (you) | Solo or with partner, projects, courses, self-improvement goals | One place for repairs, purchases, study timetable, upkeep habits | Tickets with workflows, activity pools, calendar blocks, cost tracking |
| **The small association** (contabilify's users) | Volunteers, shared cash and bank | Books, recurring fees, reports | Accounts, roles, exports |

Primary beachhead: **flatshares in Spain and Portugal**, then couples. Reasons
in [07-market.md](./07-market.md).

## 6. Product principles

1. **Fair by default.** Every assignment can explain itself ("your turn in the
   rotation", "you had the least on your plate").
2. **Plan once, then forget.** Recurrence, rotation and auto-draws mean the
   system does the remembering.
3. **Everything links.** A cost has a reason (a chore, an issue). An issue has
   a cost. A time block has tasks.
4. **Shared without surveillance.** Private items stay private. Stats inform,
   they don't shame. No leaderboards unless a space opts in.
5. **Fast capture, slow structure.** Adding something takes one line. Workflows,
   materials and dependencies are there when you need them, invisible when you don't.
6. **Own your data.** Exports for everything. Open source core. Self-hostable on
   Supabase.
