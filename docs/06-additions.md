# 06 · Potential additions: viability and usefulness

Each idea is scored 1–5 on **Usefulness** (how much it improves real lives
for the target personas), **Viability** (technical feasibility × cost ×
risk with this stack), and **Effort** (S < 1 wk, M 1–3 wk, L > 3 wk).
**Verdict:** *Do* (put on the roadmap), *Later* (good but not yet), *Maybe*
(validate first), *Skip*.

## Summary matrix

| # | Addition | Use | Via | Effort | Verdict |
|---|---|:-:|:-:|:-:|---|
| 1 | Reminders and daily digest | 5 | 5 | S | **Do** (P1) |
| 2 | Away / vacation mode | 5 | 5 | S | **Do** (P1) |
| 3 | i18n en/es/pt | 4 | 5 | S | **Do** (P1) |
| 4 | Shopping list and consumables inventory | 5 | 4 | M | **Do** (P4) |
| 5 | Quick capture with natural language / LLM | 4 | 4 | M | **Do** (after P3) |
| 6 | Receipt photo + OCR into expense | 4 | 3 | M | Later |
| 7 | Gamification: points, streaks, rewards | 3 | 5 | S–M | Maybe (opt-in) |
| 8 | Effort credit market (bid to avoid a chore) | 3 | 4 | M | Maybe |
| 9 | Photo proof on completion | 2 | 5 | S | Later (opt-in) |
| 10 | NFC / QR tags on objects ("tap the bin = done") | 3 | 4 | S | Later |
| 11 | Asset registry: warranties, manuals, purchase info | 4 | 5 | M | **Do** (P4) |
| 12 | Open-banking import | 4 | 3 | L | **Do** (P7, now core for organisations) |
| 13 | Bank CSV / Excel import | 4 | 5 | S | **Do** (P8) |
| 14 | Budgets and spend analytics | 4 | 5 | M | **Do** (P8) |
| 15 | Recurring bills and subscriptions tracker | 4 | 5 | S | **Do** (P3/P8) |
| 16 | Google / Apple calendar two-way sync | 4 | 2 | L | Later (iCal one-way first) |
| 17 | AI weekly planner (fills free blocks with items) | 4 | 3 | L | Later |
| 18 | Habit tracking | 3 | 5 | S | Maybe (pools cover most of it) |
| 19 | Home Assistant / IoT triggers | 3 | 4 | M | Later (reference plugin) |
| 20 | Kids mode + allowance tied to chores | 3 | 4 | M | Maybe (family segment) |
| 21 | Landlord / property-manager portal | 4 | 3 | L | Maybe (B2B angle) |
| 22 | Guest role (cleaner, landlord, babysitter) | 3 | 5 | S | **Do** (P2) |
| 23 | Templates marketplace | 3 | 4 | M | Later (P7) |
| 24 | Email-in ("forward to inbox@ creates an item") | 3 | 4 | S | Later |
| 25 | Time tracking on items | 2 | 5 | S | Maybe |
| 26 | Documents vault (contracts, manuals) | 3 | 4 | M | Later (with 11) |
| 27 | End-to-end encryption | 2 | 1 | L | Skip |
| 28 | Self-hosting package | 3 | 4 | M | **Do** (open-source release) |
| 29 | Native apps (Capacitor) | 3 | 4 | M | Later (if PWA push is insufficient) |
| 30 | Meal planning → shopping list | 3 | 4 | M | Maybe (a plugin) |
| 31 | Shared notes / house rules / wiki | 3 | 5 | S | Later (`note` items cover it) |
| 32 | Move-in / move-out flows | 4 | 5 | S | **Do** (templates + money exit settlement) |

## Details

**1. Reminders and daily digest.** The single biggest retention lever for
chore apps. Without nudges, rotas decay within weeks. A digest at a chosen
time plus instant push only for things that need *you* (trade requests,
hand-offs). *Viability:* pg_cron + Edge Function + Resend/Postmark, and web
push via VAPID. iOS PWAs support web push when installed. *Risk:* noise. Ship
the conservative defaults.

**2. Away mode.** Flatmates travel. Without it rotations assign chores to
absent people and trades become chores themselves. A date range per member.
Rotation and balancing skip them (spec §5.3), and their already-generated
occurrences in range get re-planned. Small and high value.

**3. i18n.** Your three repos already span EN/ES/PT. The Iberian flatshare
market is the beachhead (07). Do it before content grows.

**4. Shopping list and consumables.** "No bin bags left" is your founding
example. Consumables (bin bags, toilet paper, dish soap) with a "running low"
tap that creates a purchase for anyone, and a shopping list that aggregates
purchases and unacquired materials. Buying = one tap → expense split. This is
the feature that **ties chores, money and tickets together**, which is the
product's thesis.

**5. Natural-language quick capture.** "bin bags 3.20 for the trash, split
with everyone" → purchase done + expense + link to the chore. Deterministic
parsing for dates and amounts first, then an LLM with tool-calling against the
RPCs as an optional layer. *Viability:* good. Costs fractions of a cent per
capture. Keep it opt-in and EU-hosted for privacy.

**6. Receipt OCR.** Useful for groceries with many lines, which are also the
hardest to split well. Start with photo attachment only (cheap) and add OCR
later (Edge Function + a vision model).

**7. Gamification.** Sweepy and others show that points help *some*
households and annoy others. Opt-in per space: effort points already exist,
so points = Σ effort done. Avoid public leaderboards by default (principle 4).

**8. Credit market.** Members bid effort points to dodge or take chores (the
"chore wheel" economics). Elegant, but complex to explain. Validate with
power users first.

**10. NFC / QR tags.** Stick a tag on the bin or the plant. Tapping opens the
app and marks the current occurrence done. Trivial with deep links
(`/t/:token`) and delightful in demos.

**11. Asset registry.** The ticketing brief's "searchable repair history",
plus warranty expiry reminders and manuals as attachments. Natural extension
of TKT-10.

**12. Open banking.** *Re-scored after the move to organisations:* for a
treasurer, a live bank feed with auto-matching is the difference between
"books that build themselves" and data entry. Still keep CSV import (13) as
the always-available fallback. Aggregator terms and coverage shift often:
evaluate Plaid, Tink, Salt Edge, Enable Banking, TrueLayer and GoCardless
Bank Account Data against the organisation's actual banks before building
(design in 03 §3.10).

**16. Two-way calendar sync.** Google's API requires app verification for
sensitive scopes, and two-way sync is notoriously fiddly (recurrence
exceptions, conflicts). A one-way iCal feed out and iCal subscriptions in
(CAL-9) cover most needs.

**17. AI planner.** Given free time (calendar), priorities (rank), estimates
and pools, propose a week. Very aligned with the vision, but it depends on
P4 and P5 data. Revisit afterwards.

**20. Kids and allowance.** Strong in the family segment (OurHome, S'moresUp).
Allowance = money module + chore completion. Maybe once families are a
target.

**21. Landlord portal.** Tenants report issues (tickets) and the landlord or
property manager triages, with photos, history and costs. This is where
willingness to pay exists (B2B). Worth a discovery conversation with 3–5
small landlords before building.

**27. E2E encryption.** Incompatible with server-side generation, balances
and RLS-based sharing as designed. Not worth it for this data's sensitivity.

**28. Self-hosting.** The stack is Supabase-self-hostable already. Packaging
a docker-compose + docs earns trust and contributors in the open-source
productivity community (the Grocy / Homebox crowd).

**32. Move-in / move-out.** When someone joins, a template creates their
onboarding items (keys, Wi-Fi, house rules). When someone leaves, the app
re-plans rotations (done) and produces an exit settlement (money). This is
real flatshare pain, and cheap given the rest.

---

## Additions for organisations (after the semi-pro refocus)

| # | Addition | Use | Via | Effort | Verdict |
|---|---|:-:|:-:|:-:|---|
| 33 | Pair rules (never together / always with a mentor) | 5 | 4 | M | **Do** (P3+) |
| 34 | Training progression (tag upgrade after N mentored shifts) | 4 | 5 | S | **Do** |
| 35 | Certification expiry reminders (food handler, first aid) | 4 | 5 | S | **Do** (tag `valid_until`) |
| 36 | Availability polls for the next season | 5 | 5 | S | **Do** (P3) |
| 37 | WhatsApp / Telegram notifications and rota sharing | 5 | 3 | M | **Do** (Telegram first, WhatsApp via Business API later) |
| 38 | QR check-in at the venue | 4 | 5 | S | **Do** (P3) |
| 39 | Payroll / hours export (gestoría formats) | 4 | 4 | S | Later (paid-staff segment) |
| 40 | Shift bonuses / incentives for hard-to-fill shifts | 3 | 4 | S | Maybe |
| 41 | Card terminal integration (SumUp, Stripe Terminal, Redsys) | 4 | 3 | M–L | Later (after 5b) |
| 42 | Customer QR ordering / table service | 3 | 3 | L | Maybe (hospitality segment) |
| 43 | Kitchen display (orders to the kitchen screen) | 3 | 4 | M | Maybe |
| 44 | Suppliers and purchase orders | 4 | 5 | M | Later (P6+) |
| 45 | Event mode: temporary registers, stalls, volunteer surges | 5 | 4 | M | **Do** (fiestas; mostly config + multi-register) |
| 46 | Grants and subsidies tracking (non-profits) | 3 | 5 | S | Later (Money + Tickets) |
| 47 | Public page: opening hours from the roster, events, menu | 3 | 5 | S | Later |
| 48 | SEPA direct debit for member fees (via payment provider) | 4 | 3 | M | Maybe (payments regulation sits with the provider) |
| 49 | Natural-language rule builder ("always one experienced, at most one new") | 4 | 4 | M | **Do** (after P3, LLM to selector JSON, shown back as plain text for confirmation) |
| 50 | Incident / safety log | 3 | 5 | S | Later (`note` items with a template) |

**33. Pair rules.** Count requirements can't express "Dani and Eva never on
the same shift" or "a trainee always with their mentor". Extend requirements
with `kind = 'pair'` (forbid/require co-assignment of selector A with
selector B). The fill search prunes them the same way. High value for
volunteer groups (personal conflicts, mentoring).

**34. Training progression.** "Inexperienced becomes experienced after 5
shifts with an experienced partner" is a rule over attendance history.
A nightly job proposes the tag upgrade to a coordinator. It turns the bar's
two pools into a pipeline.

**37. Messaging channels.** Volunteer organisations live on WhatsApp.
Telegram bots are free and simple. WhatsApp needs the Business Platform
(per-conversation costs, template approval). Start with a weekly rota
*image/link* shared to the group and a Telegram bot for reminders and swaps.

**41. Card terminals.** Many small venues use their bank's standalone
terminal. "External terminal" mode (enter the amount there, mark paid here) is
enough to start. Integrations remove double entry and errors, but each
provider is its own project and its own country coverage.

**45. Event mode.** Fiestas are the bar's peak: extra registers (stalls), a
surge roster with its own season, simplified product grid, cash pickups during
the night (cash out with a witness). Mostly configuration of things already
designed, so it's high leverage for festival committees too.

**49. Rule builder.** Selector JSON is precise but unfriendly. A form builder
("At least [1] of [experienced]") covers most rules. An LLM translating a
sentence into selector JSON, echoed back in plain language for confirmation,
covers the rest.
