// Reference implementations of the algorithms the spec (docs/04-spec.md)
// relies on for future modules. Pure, dependency-free, unit-tested in
// tests/algorithms.test.ts. Money is always integer minor units (cents).

// ---------------------------------------------------------------------------
// 1. Splitting an amount (FIN-03)
// ---------------------------------------------------------------------------
export type SplitMethod =
  | { kind: 'equal'; participants: string[] }
  | { kind: 'shares'; weights: Record<string, number> } // 1:2:1 …
  | { kind: 'percent'; percents: Record<string, number> } // must sum to 100
  | { kind: 'exact'; amounts: Record<string, number> } // must sum to total

/**
 * Splits `total` cents among people. Remainders from rounding are handed out
 * one cent at a time, largest fractional part first, ties by id — so the sum
 * is always exactly `total` and the result is deterministic.
 */
export function splitAmount(total: number, method: SplitMethod): Record<string, number> {
  if (!Number.isInteger(total) || total < 0) throw new Error('total must be a non-negative integer (cents)')
  let weights: Record<string, number>
  switch (method.kind) {
    case 'exact': {
      const sum = Object.values(method.amounts).reduce((a, b) => a + b, 0)
      if (sum !== total) throw new Error(`exact amounts sum to ${sum}, expected ${total}`)
      return { ...method.amounts }
    }
    case 'equal':
      if (!method.participants.length) throw new Error('no participants')
      weights = Object.fromEntries(method.participants.map(p => [p, 1]))
      break
    case 'shares':
      weights = method.weights
      break
    case 'percent': {
      const sum = Object.values(method.percents).reduce((a, b) => a + b, 0)
      if (Math.abs(sum - 100) > 1e-9) throw new Error(`percentages sum to ${sum}, expected 100`)
      weights = method.percents
      break
    }
  }
  const ids = Object.keys(weights).filter(id => weights[id]! > 0).sort()
  const wsum = ids.reduce((a, id) => a + weights[id]!, 0)
  if (!ids.length || wsum <= 0) throw new Error('weights must be positive')
  const raw = ids.map(id => ({ id, exact: (total * weights[id]!) / wsum }))
  const out: Record<string, number> = {}
  let assigned = 0
  for (const r of raw) { out[r.id] = Math.floor(r.exact); assigned += out[r.id]! }
  const byFraction = [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1) || a.id.localeCompare(b.id))
  for (let i = 0; i < total - assigned; i++) out[byFraction[i % byFraction.length]!.id]! += 1
  return out
}

// ---------------------------------------------------------------------------
// 2. Balances and debt simplification (FIN-05, FIN-06)
// ---------------------------------------------------------------------------
export interface Expense { paidBy: string; total: number; shares: Record<string, number> }
export interface Transfer { from: string; to: string; amount: number }

/** Net balance per person: positive = is owed money, negative = owes money. */
export function netBalances(expenses: Expense[], settlements: Transfer[] = []): Record<string, number> {
  const net: Record<string, number> = {}
  const add = (id: string, v: number) => { net[id] = (net[id] ?? 0) + v }
  for (const e of expenses) {
    add(e.paidBy, e.total)
    for (const [id, share] of Object.entries(e.shares)) add(id, -share)
  }
  // a settlement "from pays to" reduces from's debt and to's credit
  for (const s of settlements) { add(s.from, s.amount); add(s.to, -s.amount) }
  return net
}

/** Pairwise debts as recorded (who owes whom, per expense), netted per pair. Used when simplification is OFF. */
export function pairwiseDebts(expenses: Expense[], settlements: Transfer[] = []): Transfer[] {
  const owed = new Map<string, number>() // "debtor→creditor" → cents
  const bump = (from: string, to: string, v: number) => {
    if (from === to || v === 0) return
    const [a, b, s] = from < to ? [from, to, 1] : [to, from, -1]
    owed.set(`${a}→${b}`, (owed.get(`${a}→${b}`) ?? 0) + s * v)
  }
  for (const e of expenses) for (const [id, share] of Object.entries(e.shares)) bump(id, e.paidBy, share)
  for (const s of settlements) bump(s.from, s.to, -s.amount)
  const out: Transfer[] = []
  for (const [k, v] of owed) {
    const [a, b] = k.split('→') as [string, string]
    if (v > 0) out.push({ from: a, to: b, amount: v })
    else if (v < 0) out.push({ from: b, to: a, amount: -v })
  }
  return out.sort((x, y) => x.from.localeCompare(y.from) || x.to.localeCompare(y.to))
}

/**
 * "Settle up" plan: greedy max-debtor ↔ max-creditor matching on net
 * balances. Produces at most n−1 transfers and never moves more money than
 * the debts require. (Finding the absolute minimum number of transfers is
 * NP-hard; greedy is what Splitwise-style apps do and is optimal in the
 * common cases.) Example from the brief: me→A 5, A→B 5 ⇒ me→B 5.
 */
export function simplifyDebts(net: Record<string, number>): Transfer[] {
  const total = Object.values(net).reduce((a, b) => a + b, 0)
  if (total !== 0) throw new Error(`balances must sum to zero (got ${total})`)
  const debtors = Object.entries(net).filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v }))
  const creditors = Object.entries(net).filter(([, v]) => v > 0).map(([id, v]) => ({ id, v }))
  const out: Transfer[] = []
  const byAmount = (a: { id: string; v: number }, b: { id: string; v: number }) => b.v - a.v || a.id.localeCompare(b.id)
  while (debtors.length && creditors.length) {
    debtors.sort(byAmount)
    creditors.sort(byAmount)
    const d = debtors[0]!
    const c = creditors[0]!
    const amount = Math.min(d.v, c.v)
    out.push({ from: d.id, to: c.id, amount })
    d.v -= amount
    c.v -= amount
    if (!d.v) debtors.shift()
    if (!c.v) creditors.shift()
  }
  return out
}

// ---------------------------------------------------------------------------
// 3. Daily draw from an activity pool (CAL-07)
// ---------------------------------------------------------------------------
export interface PoolItem {
  id: string
  priority: number // 0–4
  lastDoneDaysAgo: number | null // null = never done
  cooldownDays: number // not eligible again until this many days passed
}

/** Mulberry32: tiny seeded PRNG so a day's draw is stable across reloads. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hash(s: string) {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}

/**
 * Picks `count` distinct items for `date`, weighted by staleness and
 * priority, skipping items still cooling down. Deterministic for a given
 * (seedKey, date) so refreshing never reshuffles the day.
 * weight = (1 + priority) × (1 + min(staleness, 60) / 7), never-done = 60 days.
 */
export function drawDaily(items: PoolItem[], count: number, seedKey: string, date: string): string[] {
  const rand = rng(hash(`${seedKey}|${date}`))
  const pool = items
    .filter(i => i.lastDoneDaysAgo === null || i.lastDoneDaysAgo >= i.cooldownDays)
    .map(i => ({ id: i.id, w: (1 + i.priority) * (1 + Math.min(i.lastDoneDaysAgo ?? 60, 60) / 7) }))
    .sort((a, b) => a.id.localeCompare(b.id))
  const picked: string[] = []
  while (picked.length < count && pool.length) {
    const sum = pool.reduce((a, p) => a + p.w, 0)
    let r = rand() * sum
    let idx = 0
    while (idx < pool.length - 1 && (r -= pool[idx]!.w) > 0) idx++
    picked.push(pool[idx]!.id)
    pool.splice(idx, 1)
  }
  return picked
}

// ---------------------------------------------------------------------------
// 4. Time-block conflicts (CAL-04) — generalises the `schedules` repo
// ---------------------------------------------------------------------------
export interface WeeklyBlock { id: string; weekday: number; start: string; end: string } // HH:MM

const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

/** Pairs of blocks that overlap (touching end→start is not a conflict). */
export function conflicts(blocks: WeeklyBlock[]): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const sorted = [...blocks].sort((a, b) => a.weekday - b.weekday || minutes(a.start) - minutes(b.start))
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length && sorted[j]!.weekday === sorted[i]!.weekday; j++) {
      if (minutes(sorted[j]!.start) < minutes(sorted[i]!.end)) out.push([sorted[i]!.id, sorted[j]!.id])
      else break
    }
  }
  return out
}

/**
 * All conflict-free selections of `k` groups (a group = e.g. a course with
 * several weekly blocks). Backtracking with pruning instead of the original
 * brute-force C(n,k) enumeration.
 */
export function compatibleSets(groups: Record<string, WeeklyBlock[]>, k: number): string[][] {
  const names = Object.keys(groups).sort()
  const clash = (a: string, b: string) => conflicts([...groups[a]!, ...groups[b]!]
    .map(x => ({ ...x, id: groups[a]!.includes(x) ? a : b })))
    .some(([x, y]) => x !== y)
  const out: string[][] = []
  const pick = (start: number, chosen: string[]) => {
    if (chosen.length === k) { out.push([...chosen]); return }
    for (let i = start; i <= names.length - (k - chosen.length); i++) {
      const n = names[i]!
      if (chosen.every(c => !clash(c, n))) pick(i + 1, [...chosen, n])
    }
  }
  pick(0, [])
  return out
}
