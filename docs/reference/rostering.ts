// Reference rostering engine (docs/03 §3.7, spec ROS-*). Pure TS, tested in
// tests/rostering.test.ts. Nothing here knows about bars, volunteers or
// "experienced": staffing rules are data. A rule is "between min and max of
// the people on this shift must match this selector", and a selector is a
// boolean expression over tags (skills, pools, certifications, groups) or
// explicit people.

// ---------------------------------------------------------------- model
export type Selector =
  | { any: true } // everyone
  | { tag: string } // has tag (skill / pool / certification)
  | { people: string[] } // explicit list
  | { anyOf: Selector[] }
  | { allOf: Selector[] }
  | { not: Selector }

export interface CountRule {
  id: string
  label: string // "At least one experienced"
  selector: Selector
  min?: number
  max?: number
}

export interface ShiftSpec {
  id: string
  start: string // ISO datetime, local wall time is fine for comparison
  end: string
  eligible: Selector // who may work it at all (e.g. any trade)
  headcount: { min: number; max: number }
  rules: CountRule[]
  hours?: number // defaults to end − start
}

export interface Person { id: string; tags: string[] }

export interface Policy {
  /** Max shifts per person per ISO week (undefined = unlimited). */
  maxShiftsPerWeek?: number
  /** Minimum hours between the end of one shift and the start of the next. */
  minRestHours?: number
  /** Hard unavailability, e.g. holidays: person → [start, end) intervals. */
  unavailable?: Record<string, Array<[string, string]>>
}

export type Assignment = Record<string, string[]> // shiftId → personIds

export interface Violation {
  shiftId?: string
  personId?: string
  code: 'not_eligible' | 'duplicate' | 'headcount' | 'rule' | 'overlap' | 'unavailable' | 'max_per_week' | 'rest'
  message: string
}

// ------------------------------------------------------------- selectors
export function matches(sel: Selector, p: Person): boolean {
  if ('any' in sel) return true
  if ('tag' in sel) return p.tags.includes(sel.tag)
  if ('people' in sel) return sel.people.includes(p.id)
  if ('anyOf' in sel) return sel.anyOf.some(s => matches(s, p))
  if ('allOf' in sel) return sel.allOf.every(s => matches(s, p))
  return !matches(sel.not, p)
}

// ---------------------------------------------------- per-shift checking
export function checkShift(spec: ShiftSpec, ids: string[], people: Map<string, Person>): Violation[] {
  const out: Violation[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) out.push({ shiftId: spec.id, personId: id, code: 'duplicate', message: `${id} listed twice` })
    seen.add(id)
    const p = people.get(id)
    if (!p || !matches(spec.eligible, p)) out.push({ shiftId: spec.id, personId: id, code: 'not_eligible', message: `${id} can't work this shift` })
  }
  if (ids.length < spec.headcount.min || ids.length > spec.headcount.max) {
    out.push({ shiftId: spec.id, code: 'headcount', message: `needs ${spec.headcount.min}–${spec.headcount.max} people, has ${ids.length}` })
  }
  for (const r of spec.rules) {
    const n = ids.filter(id => { const p = people.get(id); return !!p && matches(r.selector, p) }).length
    if ((r.min !== undefined && n < r.min) || (r.max !== undefined && n > r.max)) {
      out.push({ shiftId: spec.id, code: 'rule', message: `${r.label}: has ${n}` })
    }
  }
  return out
}

// ---------------------------------------------------- cross-shift checking
const ms = (iso: string) => new Date(iso).getTime()
const overlaps = (a: ShiftSpec, b: ShiftSpec) => ms(a.start) < ms(b.end) && ms(b.start) < ms(a.end)
function isoWeek(iso: string): string {
  const d = new Date(iso)
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const y = t.getUTCFullYear()
  const week = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 86_400_000 + 1) / 7)
  return `${y}-W${week}`
}

/** Can `personId` take `spec` given everything else they're already on? */
export function personViolations(personId: string, spec: ShiftSpec, others: ShiftSpec[], policy: Policy): Violation[] {
  const out: Violation[] = []
  for (const [s, e] of policy.unavailable?.[personId] ?? []) {
    if (ms(spec.start) < ms(e) && ms(s) < ms(spec.end)) {
      out.push({ shiftId: spec.id, personId, code: 'unavailable', message: `${personId} is unavailable` })
    }
  }
  for (const o of others) {
    if (o.id === spec.id) continue
    if (overlaps(o, spec)) out.push({ shiftId: spec.id, personId, code: 'overlap', message: `${personId} already on ${o.id}` })
    else if (policy.minRestHours !== undefined) {
      const gap = Math.min(Math.abs(ms(spec.start) - ms(o.end)), Math.abs(ms(o.start) - ms(spec.end))) / 3_600_000
      if (gap < policy.minRestHours) out.push({ shiftId: spec.id, personId, code: 'rest', message: `${personId} needs ${policy.minRestHours} h rest` })
    }
  }
  if (policy.maxShiftsPerWeek !== undefined) {
    const wk = isoWeek(spec.start)
    const n = others.filter(o => o.id !== spec.id && isoWeek(o.start) === wk).length + 1
    if (n > policy.maxShiftsPerWeek) out.push({ shiftId: spec.id, personId, code: 'max_per_week', message: `${personId} over ${policy.maxShiftsPerWeek} shifts that week` })
  }
  return out
}

export function checkRoster(shifts: ShiftSpec[], a: Assignment, people: Map<string, Person>, policy: Policy): Violation[] {
  const out: Violation[] = []
  const byPerson = new Map<string, ShiftSpec[]>()
  for (const s of shifts) for (const id of a[s.id] ?? []) byPerson.set(id, [...(byPerson.get(id) ?? []), s])
  for (const s of shifts) out.push(...checkShift(s, a[s.id] ?? [], people))
  for (const [id, list] of byPerson) {
    for (const s of list) out.push(...personViolations(id, s, list.filter(o => o.id !== s.id && ms(o.start) < ms(s.start)), policy))
    // ^ each pair checked once (earlier shifts only); weekly cap counted on the last shift of the week
  }
  return out
}

// --------------------------------------------------------------- filling
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0 }

/**
 * Picks people for one shift. Candidates are tried in order of (load asc,
 * seeded random), i.e. "fair draw", and a backtracking search finds the first
 * team that satisfies every rule, preferring the largest headcount allowed.
 * `fixed` people (already assigned or volunteered) are always kept.
 * Returns null when no valid team exists (understaffed shift).
 */
export function fillShift(
  spec: ShiftSpec,
  candidates: Person[],
  opts: { load?: (id: string) => number; seed?: string; fixed?: string[]; prefer?: 'max' | 'min' } = {},
): string[] | null {
  const rand = rng(hash(opts.seed ?? spec.id))
  const fixed = opts.fixed ?? []
  const pool = candidates
    .filter(p => matches(spec.eligible, p) && !fixed.includes(p.id))
    .map(p => ({ p, load: opts.load?.(p.id) ?? 0, r: rand() }))
    .sort((a, b) => a.load - b.load || a.r - b.r)
    .map(x => x.p)
  const people = new Map([...candidates].map(p => [p.id, p]))
  const fixedPeople = fixed.map(id => people.get(id)).filter((p): p is Person => !!p)

  const sizes: number[] = []
  for (let n = spec.headcount.max; n >= spec.headcount.min; n--) sizes.push(n)
  if (opts.prefer === 'min') sizes.reverse()

  const count = (team: Person[], r: CountRule) => team.filter(p => matches(r.selector, p)).length
  for (const size of sizes) {
    if (size < fixedPeople.length) continue
    const team = [...fixedPeople]
    const search = (from: number): boolean => {
      // prune: no rule may exceed its max; remaining slots must cover every min
      const slots = size - team.length
      for (const r of spec.rules) {
        const n = count(team, r)
        if (r.max !== undefined && n > r.max) return false
        if (r.min !== undefined && r.min - n > Math.min(slots, pool.slice(from).filter(p => matches(r.selector, p)).length)) return false
      }
      if (slots === 0) return checkShift(spec, team.map(p => p.id), people).length === 0
      for (let i = from; i <= pool.length - slots; i++) {
        team.push(pool[i]!)
        if (search(i + 1)) return true
        team.pop()
      }
      return false
    }
    if (search(0)) return team.map(p => p.id)
  }
  return null
}

/** Fills a whole period, in chronological order, balancing hours across people. */
export function fillRoster(
  shifts: ShiftSpec[],
  people: Person[],
  policy: Policy,
  opts: { seed?: string; history?: Record<string, number>; fixed?: Assignment } = {},
): { assignment: Assignment; unfilled: string[] } {
  const hoursOf = (s: ShiftSpec) => s.hours ?? (ms(s.end) - ms(s.start)) / 3_600_000
  const load: Record<string, number> = { ...(opts.history ?? {}) }
  const mine = new Map<string, ShiftSpec[]>()
  const assignment: Assignment = {}
  const unfilled: string[] = []
  for (const s of [...shifts].sort((a, b) => ms(a.start) - ms(b.start))) {
    const free = people.filter(p => personViolations(p.id, s, mine.get(p.id) ?? [], policy).length === 0)
    const team = fillShift(s, free, { load: id => load[id] ?? 0, seed: `${opts.seed ?? ''}|${s.id}`, fixed: opts.fixed?.[s.id] })
    if (!team) { unfilled.push(s.id); assignment[s.id] = opts.fixed?.[s.id] ?? []; continue }
    assignment[s.id] = team
    for (const id of team) {
      load[id] = (load[id] ?? 0) + hoursOf(s)
      mine.set(id, [...(mine.get(id) ?? []), s])
    }
  }
  return { assignment, unfilled }
}

// --------------------------------------------------------------- trading
export interface TradeProposal {
  shiftId: string
  from: string
  to: string
  /** Swap: `to` gives `from` their seat on this shift in return. */
  counterShiftId?: string
}

/**
 * Generic trade rule (spec TRD-10): a trade is valid iff the roster after
 * applying it violates no hard constraint that it didn't already violate.
 * Pre-existing problems (e.g. an already understaffed shift) don't block
 * trades that don't make things worse.
 */
export function validateTrade(
  shifts: ShiftSpec[], a: Assignment, people: Map<string, Person>, policy: Policy, t: TradeProposal,
): { ok: boolean; violations: Violation[] } {
  if (!(a[t.shiftId] ?? []).includes(t.from)) return { ok: false, violations: [{ code: 'rule', message: `${t.from} isn't on ${t.shiftId}` }] }
  if (t.counterShiftId && !(a[t.counterShiftId] ?? []).includes(t.to)) {
    return { ok: false, violations: [{ code: 'rule', message: `${t.to} isn't on ${t.counterShiftId}` }] }
  }
  const next: Assignment = { ...a }
  next[t.shiftId] = next[t.shiftId]!.map(id => (id === t.from ? t.to : id))
  if (t.counterShiftId) next[t.counterShiftId] = next[t.counterShiftId]!.map(id => (id === t.to ? t.from : id))
  const key = (v: Violation) => `${v.code}|${v.shiftId}|${v.personId}|${v.message}`
  const before = new Set(checkRoster(shifts, a, people, policy).map(key))
  const introduced = checkRoster(shifts, next, people, policy).filter(v => !before.has(key(v)))
  return { ok: introduced.length === 0, violations: introduced }
}

/** Who could take `from`'s seat on `shiftId` (hand-over) without breaking anything? */
export function validTakers(
  shifts: ShiftSpec[], a: Assignment, people: Map<string, Person>, policy: Policy, shiftId: string, from: string,
): string[] {
  return [...people.keys()].filter(id => id !== from && !(a[shiftId] ?? []).includes(id)
    && validateTrade(shifts, a, people, policy, { shiftId, from, to: id }).ok)
}
