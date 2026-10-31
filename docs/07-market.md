# 07 · Market analysis and overall viability

> Method note: competitor facts come from public app listings and reviews
> (sources at the end). Many 2026 roundups are vendor-written, so prices and
> ratings are indicative only. I've avoided quoting market-size figures I
> couldn't verify. The sizing below is a bottom-up reasoning model with stated
> assumptions, not a cited statistic.

## 1. The landscape

The product sits where five crowded categories overlap. Nobody owns the
overlap.

| Category | Representative products | What they do well | What they miss (for us) |
|---|---|---|---|
| **Chore apps** | Flatastic, Sweepy, Tody, OurHome, Cozi | Rotas, reminders, gamified cleaning (Sweepy), family lists (OurHome, Cozi). Flatastic adds shared expenses and a shopping list for flatshares | Shallow task model. No issues/repairs, no dependencies or hand-offs, weak calendar, money is an add-on |
| **Bill splitting** | Splitwise, Tricount, Settle Up | Splits, balances, debt simplification, multi-currency | Expenses float free of *why* they happened. Splitwise's free tier is capped (roughly 3–5 expenses/day, plus ads), and Pro is around $40–50/yr in the US, which has pushed users to look for alternatives |
| **Personal tasks / all-in-one** | Todoist, TickTick, Notion, Anytype, Capacities | Fast capture, projects, flexible databases (Notion) | Single-player first. Fairness and rotation don't exist. Notion can model anything but you have to build it, and nothing is automatic |
| **Issue trackers** | Trello, Linear, Jira, GitHub Issues | Workflows, boards, hierarchy, history | Built for teams and software. Overkill and cold for a broken door. No costs or household context |
| **Home maintenance** | HomeZada, Centriq, Homebox / Grocy (self-hosted) | Asset inventories, manuals, maintenance schedules | Owner-centric, single-user, little sharing. Grocy is powerful but complex |
| **Time planning** | Google Calendar, Motion, Reclaim, Sunsama | Scheduling, auto time-blocking | No household dimension. No pools of "upkeep" tasks |

**Closest competitor: Flatastic.** Roommate-focused, chores + expenses +
shopping list + pinboard, free with a premium tier. It validates that the
*chores + money* combination resonates with flatshares. Where we differ:
fair assignment that explains itself (rotation and effort balancing), trades
and swaps, issues with materials and cost roll-up, purchases that become
expenses, time pools, and an open, self-hostable core.

## 2. Segments and beachhead

| Segment | Pain | Willingness to pay | Reachability | Fit |
|---|---|---|---|---|
| Flatshares (students, young professionals) | High: fairness fights, money awkwardness | Low per person, OK per household | High: one organiser invites 3–5. Viral loop | ★★★★★ |
| Couples | Medium-high: invisible mental load, shared finances | Medium | Medium | ★★★★ |
| Families with kids | High | Medium-high | Crowded (Cozi, OurHome) | ★★★ |
| Life-admin power users | Medium (but they love tools) | Medium. They pay for Notion and Todoist | Communities: r/selfhosted, r/productivity, HN | ★★★★ (evangelists) |
| Small landlords / co-living operators | High for maintenance | **High (B2B)** | Low-medium. Needs sales | ★★★ (later) |
| Associations (contabilify) | Medium | Low | Word of mouth | ★★ (keep as a niche) |

**Beachhead: flatshares in Spain and Portugal, built in EN/ES/PT.**
- Large shared-housing culture (students, Erasmus, young professionals priced
  out of solo rentals), so a constant churn of new flats means a constant
  onboarding moment.
- Local payment habits (Bizum, MB WAY) fit a "settle up" flow that just
  *records* the payment, no money movement or licence needed.
- English-first competitors under-serve ES/PT. Every household invite is
  free distribution.
- You live in that context (contabilify is Spanish, schedules is Portuguese),
  so dogfooding is real.

## 3. Sizing (bottom-up, illustrative)

Assumptions to replace with real numbers as you learn:
- A city-level start: 1 metro area × ~20k shared flats reachable via
  university and expat channels.
- 2% try it in year 1 → 400 households → ~1,400 users.
- 35% still active at month 3 (typical for utility apps with a strong
  weekly habit and reminders) → ~140 active households.
- Freemium conversion of active households at €3/month per household: 5–8%
  → **€25–40/month**.

**Conclusion:** consumer revenue from one beachhead won't fund development.
It's a **product to build for yourself and your circle first**, open-source
for reputation and contributors, and only a business if (a) organic spread
across flats compounds, or (b) the landlord/co-living B2B angle shows real
demand (€2–5 per unit per month across portfolios is a different scale).

## 4. Business model options

| Model | How | Pros | Cons |
|---|---|---|---|
| **Open-core + hosted** (recommended) | MIT core, self-hostable. Hosted version free for 1 household. "Plus" (€3/mo per household): unlimited history, receipt OCR, AI capture, advanced boards, multiple households | Trust, contributors, low CAC with the self-host crowd. Aligns with "own your data" | Low conversion. Hosting costs on free users (small on Supabase) |
| Per-seat SaaS | €2/user/month | Familiar | Kills the household viral loop: flatmates refuse to pay |
| B2B portal | Landlords / co-living pay per unit for maintenance + tenant chores | Real WTP | Sales-heavy. Different product surface |
| Donations / sponsorship | GitHub Sponsors | Zero friction | Unreliable |

Never monetise by holding money: settle-up records payments, it doesn't move
them. That avoids payment-licence regulation entirely.

## 5. Go-to-market (if you choose to grow it)

1. **Dogfood** (P1): your own flat plus 2–3 friends' flats. Weekly feedback.
2. **Open-source launch** (after P3): a README with GIFs, self-host docs,
   "Show HN" / r/selfhosted / r/flatsharing. The angle: *"the chore rota that
   explains why it's your turn, plus Splitwise without the daily cap."*
3. **Campus and Erasmus channels** (P3–P4): university housing offices,
   Erasmus Student Network sections, flat-hunting Facebook/WhatsApp groups.
   A "new flat starter" template is the hook.
4. **Content:** "How to split rent fairly", "Chore rota templates", in ES/PT/EN
   for SEO.
5. **Landlord discovery** (P4+): interview 5 small landlords and 2 co-living
   operators about maintenance tickets before building anything B2B.

## 6. Overall viability and usefulness

### Usefulness: **high**
- The **graph between domains** is the product: a chore causes a purchase,
  which causes an expense; an issue has steps that hand off between people;
  a time block pulls from a pool. No incumbent does this for households.
- Real, recurring pains: fairness and mental load (chores), money
  awkwardness (splits), forgotten repairs (tickets), habits that never get
  scheduled (pools).
- Even at n = 1 (just you) it's useful: tickets, purchases, pools and
  calendar justify themselves without any network effect.

### Technical viability: **high**
- The stack is proven in your own repos. The hardest parts (recurrence,
  atomic trades, RLS multi-tenancy) are already built and tested in P0.
- The remaining modules are well-understood problems with reference
  algorithms in this repo (split, simplify, draw, conflicts).
- Running costs stay near zero until real scale (static hosting + Supabase
  free or $25 tier).

### Commercial viability: **low-to-moderate, path-dependent**
- Consumer productivity is crowded and low-WTP. Households amplify reach
  (invites) but also amplify the "nobody wants to pay" problem.
- The defensible position is *integration + fairness + openness*, not any
  single feature. That's hard to communicate in one line, so lead with one
  sharp wedge (**"fair chores + split costs for flatshares"**) and let the
  rest be the reason people stay.
- The B2B maintenance angle is the most credible revenue path, but it's a
  different business. Validate it before committing.

### Main risks
1. **Scope:** an "everything app" never ships. Mitigated by phase gates where
   each module is useful alone (05).
2. **Habit decay:** chore apps lose users when nudges stop. Mitigated by
   digests and push, and by low-friction completion (NFC, one tap).
3. **Network cold start:** one reluctant flatmate breaks a rota. Mitigated by
   guest access, email-only participation and PWA-by-link (no store install).
4. **Trust in money features:** a single wrong balance kills them.
   Mitigated by integer cents, property tests and immutable history.

### Recommendation
Build it, **for yourself and your flat first**. Treat P1–P3 (ship chores →
core → money) as the real test. If after P3 your flat and two others still use
it daily without being asked, open-source it and push the ES/PT flatshare
wedge. Re-evaluate commercial ambitions only with real retention data in hand.

## Sources
- Splitwise pricing and free-tier limits (2026): [App Store listing](https://apps.apple.com/us/app/splitwise/id458023433), [getfinny.app: Splitwise pricing 2026](https://getfinny.app/blog/splitwise-pricing-2026), [Splitwise free vs Pro 2026](https://split-circle-landing.pages.dev/en/blog/splitwise-free-vs-pro), [Gerald: Splitwise Pro](https://joingerald.com/learn/money-basics/splitwise-pro)
- Chore-app landscape (Flatastic, Sweepy, Tody, OurHome): [visionvix: best roommate apps 2026](https://visionvix.com/best-roommate-apps/), [top10.com household chore apps](https://www.top10.com/household-chore-apps), [heynori: best family chore apps 2026](https://heynori.com/article/family-operations-system/best-family-chore-apps), [AlternativeTo: Sweepy](https://alternativeto.net/software/sweepy), [Flatastic App Store data](https://apps.appfollow.io/ios/flatastic-chore-checklist/840810742?country=it)
- All-in-one life management positioning: [toolfinder: best organization apps 2026](https://toolfinder.co/lists/best-organization-apps), [Pocket Informant: productivity apps 2026](https://www.pocketinformant.com/best-productivity-apps-for-2026-and-why-pocket-informant-leads-the-list/)
