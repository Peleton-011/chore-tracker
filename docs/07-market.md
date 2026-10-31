# 07 · Market analysis and overall viability

> Method note: competitor facts come from public listings and reviews
> (sources at the end), and many roundups are vendor-written, so treat prices
> and ratings as indicative. I don't quote market-size statistics I couldn't
> verify. Sizing is a reasoning model with stated assumptions to replace with
> real data (e.g. counts from the national and regional registers of associations).

## 1. Positioning

**Target:** small, people-powered organisations, the *semi-professional*
band between "group chat + spreadsheet" and "real ERP":

- volunteer-run venues: association bars, peñas, casals, ateneos, txokos,
  social and sports clubs with a canteen;
- festival and event committees (comisiones de fiestas);
- small hospitality: cafés and bars with 2–10 staff;
- small crews: maintenance, events, trades (skill-mixed teams);
- makerspaces, co-ops, community gardens, coworking;
- **plus** households as the free tier and funnel.

**Their shared problem:** *people × time × money × things* under simple but
specific rules, run by non-specialists, with a budget that is small but real.

## 2. Competition

| Need | Typical tools | Strength | Gap for this segment |
|---|---|---|---|
| Staff rota | Sling, When I Work, Deputy, Homebase, Planday, Skello, Shiftbase, Factorial (ES) | Mature scheduling, time clocks, payroll | Built for employees and managers. Composition rules (≥1 experienced) are rare or rigid. Volunteer swaps under rules almost never. Per-user pricing hurts volunteer groups |
| Volunteer scheduling | SignUpGenius, VolunteerHub, Better Impact, Rosterfy, Galaxy Digital | Sign-ups, hours logs | Sign-up only, no fair draw. Weak rules. No till, no books |
| POS | Square, SumUp POS, Loyverse (free tier), Lightspeed, Revo / Ágora / Glop (ES hospitality) | Fast, hardware ecosystems, compliance (ES vendors) | Know nothing about who's on shift, member prices for associations, or the association's books |
| Accounting | Holded, Quipu, Contasimple (ES), contabilify (yours) | Invoicing, tax | No link to till sessions, rota or maintenance |
| All-in-one ERP | **Odoo**, Holded | Everything, integrated | Too complex and expensive in setup time for volunteers. Odoo is the real "integrated" competitor, and our pitch is *Odoo for people who'd never install Odoo* |
| Maintenance | Trello, Notion, UpKeep/MaintainX (pro) | Boards, work orders | Pro CMMS is overkill. Boards don't link to costs and budgets |
| Households | Flatastic, Sweepy, Splitwise | Polished consumer apps | Covered in the free tier. Not where revenue comes from |

**Where we win:** rules-based fair rostering with constrained trades,
plus a till that knows the shift, plus books that build themselves, plus an
improvement backlog with costs, all in one place and in ES/PT/EN. No
incumbent combines these for this size of organisation.

## 3. The "small, cash-poor niche" problem, and the answer

You're right: *volunteer-run bars* alone is a small market with little money.
Four levers change the picture:

1. **One engine, many niches.** The product is horizontal (tags, rules,
   items, trades, money, till) and ships as **vertical packs**: templates +
   default modules + copy. *Community bar* · *Festival committee* · *Small
   café* · *Maintenance crew* · *Sports club* · *Flatshare*. Each niche is
   small. Together they're a real market, and every pack is mostly
   configuration, not new code.
2. **Charge where money already flows: the till.** Hospitality and venues
   already pay for POS (monthly subscriptions, hardware, or card fees). A
   compliant EPOS that also does rota, books and maintenance replaces several
   bills. Rota-only and volunteer-only customers pay little. Venues pay.
3. **A regulatory buying window.** VERI\*FACTU forces Spanish businesses
   (and likely many associations with sales) to adopt compliant invoicing
   software in 2027. Many small venues currently on a cash box or old
   till must switch, and that's when they evaluate. To use it you must
   *be* compliant on time (see roadmap P5b) or partner with a certified provider.
4. **Price per organisation, never per volunteer.** Per-user pricing is what
   makes Deputy-class tools unaffordable for a 40-volunteer bar. Flat
   per-place pricing is the differentiator and the hook.

### Illustrative pricing
| Plan | For | Price idea |
|---|---|---|
| Free | Households, 1 small team, chores + split money | €0 |
| Community | Associations / non-profits: roster, tickets, accounts, members, bank feed | €9–15 / month per organisation (non-profit rate) |
| Venue | + EPOS (1 register), stock, fiscal compliance, attendance | €29–39 / month |
| Extra register / event stall | Fiestas, second bar | +€9 / month, or €15 per event weekend |

### Illustrative sizing (replace assumptions with data)
- *Assumption:* one Spanish region has a few thousand associations and small
  venues that run a bar, canteen or stall, plus several thousand small cafés.
- Year 2 target: 0.5–1% of a single region's reachable organisations through
  word of mouth (federations of peñas and associations, fiestas committees,
  gestorías) → ~50–100 paying places.
- Blended ~€20/month → **€12k–24k ARR**. That pays for infrastructure many times
  over and is a meaningful side income, but it isn't a venture-scale business.
  Each additional region or vertical pack adds roughly linearly.
- The upside case is **gestorías and federations as channels**: one
  gestoría managing 50 small clients, or one regional federation of peñas,
  changes acquisition cost by an order of magnitude.

## 4. Go-to-market

1. **Customer zero: the town bar** (P3–P5). Run a full season. Document
   before/after: hours spent on the rota, WhatsApp swap messages, cash
   discrepancies, time to close the month.
2. **Neighbouring organisations** (same town and region): fiestas
   committee, sports club, other associations. Templates from customer
   zero. Personal demos.
3. **Channels:** gestorías (they need clean books from small clients and
   VERI\*FACTU readiness), federations of associations and peñas, local
   hospitality associations, town councils' associations departments.
4. **Open-source core + hosted service.** Credibility with tech-savvy
   volunteers and a self-host option for the stubborn. Revenue from hosting,
   EPOS/compliance and support.
5. **Content in ES/PT:** "Cómo organizar los turnos de voluntarios del bar de
   la asociación", "VERI\*FACTU para asociaciones", rota templates.
6. **Households stay free** as brand awareness and a funnel. Volunteers use
   it at home, and organisers discover it.

## 5. Overall viability and usefulness

### Usefulness: **very high for the target**
Rule-respecting rotas with safe swaps, a till tied to shifts and books, and a
backlog with costs are daily, painful problems that today's tools solve
separately and badly for this size of organisation. You have direct access to
a real user (the bar), which is the most valuable asset in this whole plan.

### Technical viability: **high, with two hard parts**
- Rostering under flexible rules is solved at this scale: the reference engine
  handles the bar's low and high seasons, skill-mixed crews and constrained
  trades, and is tested.
- **Hard part 1: an offline-safe till.** It's well understood (append-only
  orders, device ids, gapless numbering by block reservation), but it needs
  care and testing.
- **Hard part 2: fiscal compliance.** It's real engineering plus legal
  responsibility as a software producer. Mitigate by partnering or
  delegating at first.
- Bank feeds depend on third-party aggregators. Use an adapter pattern with a CSV fallback.

### Commercial viability: **moderate, if focused**
- Better than the consumer version: organisations pay, especially venues
  for POS, and the regulatory window helps.
- Still a "many small niches" business. The path is a regional, channel-led
  rollout (gestorías, federations), not viral growth.
- Main risks: scope (nine modules, one part-time developer), compliance
  liability, and EPOS competition from free or cheap tills (Loyverse, SumUp).
  The answer to the last one is to never compete on the till alone, only on
  *till + rota + books*.

### Recommendation
1. Finish P1–P3 and run the bar's rota on it for a season. If volunteers and
   coordinators prefer it to WhatsApp + spreadsheet, the core thesis holds.
2. Bring contabilify in (P4), then build the EPOS tally (P5a) and use it
   internally at the bar.
3. Decide on fiscal compliance (self-build vs certified partner) with a
   gestoría **before** offering the EPOS to anyone else.
4. Only then pick 2–3 neighbouring organisations and test willingness to pay
   at the Community and Venue price points.

## Sources
- VERI\*FACTU postponement to 2027 (Real Decreto-ley 15/2025): [Legal Today](https://www.legaltoday.com/actualidad-juridica/noticias-de-derecho/nueva-prorroga-verifactu-no-sera-obligatorio-hasta-2027-para-sociedades-y-otros-contribuyentes-2025-12-04/), [Infoautónomos](https://www.infoautonomos.com/blog/verifactu-cuando-es-obligatorio-a-quien-afecta/), [Maldita.es](https://maldita.es/malditobulo/20251203/hacienda-retrasa-a-2027-la-entrada-en-vigor-de-verifactu-el-sistema-de-verificacion-de-facturas-para-pymes-y-autonomos), [Billin](https://www.billin.net/blog/hacienda-retrasa-verifactu-a-2027/), [Holded](https://www.holded.com/es/blog/hacienda-retrasa-entrada-vigor-verifactu), [elDiario.es / EFE](https://www.eldiario.es/economia/hacienda-aplaza-2027-entrada-vigor-sistema-verificacion-facturas-verifactu_1_12814827.amp.html)
- Spanish bank PSD2 APIs and aggregators: [Open Banking Tracker: Santander España](https://openbankingtracker.com/provider/banco-santander-es), [Open Banking Tracker: Openbank APIs](https://www.openbankingtracker.com/provider/openbank/apis), [Open Banking Tracker: imagin APIs](https://openbankingtracker.com/provider/imagin/apis)
- Splitwise pricing and limits (household free tier context): [App Store](https://apps.apple.com/us/app/splitwise/id458023433), [getfinny.app](https://getfinny.app/blog/splitwise-pricing-2026)
- Household chore apps: [visionvix: best roommate apps 2026](https://visionvix.com/best-roommate-apps/), [top10.com chore apps](https://www.top10.com/household-chore-apps), [AlternativeTo: Sweepy](https://alternativeto.net/software/sweepy)
- All-in-one positioning: [toolfinder 2026](https://toolfinder.co/lists/best-organization-apps)
