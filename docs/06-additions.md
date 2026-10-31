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
| 12 | Open-banking import | 3 | 2 | L | Skip for now |
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

**12. Open banking.** Aggregator terms, pricing and availability in the EU
have shifted repeatedly (verify current options such as GoCardless Bank
Account Data, Tink, Salt Edge before relying on them). There's regulatory
weight (you'd be an AISP's customer handling bank data) and maintenance cost.
CSV import (13) gets 80% of the value for 5% of the cost.

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
