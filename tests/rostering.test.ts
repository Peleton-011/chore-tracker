import { describe, expect, it } from 'vitest'
import {
  checkRoster, checkShift, fillRoster, fillShift, matches, validTakers, validateTrade,
  type Person, type ShiftSpec,
} from '../docs/reference/rostering'

const P = (id: string, ...tags: string[]): Person => ({ id, tags })
const people = [
  P('ana', 'experienced'), P('ben', 'experienced'), P('cris', 'experienced'),
  P('dani', 'inexperienced'), P('eva', 'inexperienced'), P('fran', 'inexperienced'),
]
const byId = new Map(people.map(p => [p.id, p]))

// Low season: every day, exactly 2 people, ≥1 experienced, ≤1 inexperienced
const lowSeasonDay = (date: string): ShiftSpec => ({
  id: date, start: `${date}T18:00`, end: `${date}T24:00`.replace('T24:00', 'T23:59'),
  eligible: { anyOf: [{ tag: 'experienced' }, { tag: 'inexperienced' }] },
  headcount: { min: 2, max: 2 },
  rules: [
    { id: 'exp', label: 'At least one experienced', selector: { tag: 'experienced' }, min: 1 },
    { id: 'inexp', label: 'At most one inexperienced', selector: { tag: 'inexperienced' }, max: 1 },
  ],
})

describe('selectors', () => {
  it('compose', () => {
    const elecOrPlumber = { anyOf: [{ tag: 'electrician' }, { tag: 'plumber' }] }
    expect(matches(elecOrPlumber, P('x', 'plumber'))).toBe(true)
    expect(matches({ allOf: [elecOrPlumber, { not: { tag: 'trainee' } }] }, P('y', 'electrician', 'trainee'))).toBe(false)
    expect(matches({ people: ['z'] }, P('z'))).toBe(true)
  })
})

describe('low season (town bar)', () => {
  it('every filled day has 2 people, ≥1 experienced, ≤1 inexperienced', () => {
    const week = ['2027-01-04', '2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08', '2027-01-09', '2027-01-10'].map(lowSeasonDay)
    const { assignment, unfilled } = fillRoster(week, people, { maxShiftsPerWeek: 3 }, { seed: 'jan' })
    expect(unfilled).toEqual([])
    expect(checkRoster(week, assignment, byId, { maxShiftsPerWeek: 3 })).toEqual([])
    // fairness: 14 seats over 6 people → nobody far from the mean
    const counts = people.map(p => week.filter(s => assignment[s.id]!.includes(p.id)).length)
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2)
  })
  it('is reproducible for the same seed', () => {
    const s = lowSeasonDay('2027-01-04')
    expect(fillShift(s, people, { seed: 'x' })).toEqual(fillShift(s, people, { seed: 'x' }))
  })
  it('reports understaffing instead of breaking rules', () => {
    expect(fillShift(lowSeasonDay('2027-01-04'), [P('dani', 'inexperienced'), P('eva', 'inexperienced')])).toBeNull()
  })
})

describe('high season: several shifts with their own composition', () => {
  it('fills a 3-shift Saturday with different rules per shift', () => {
    const shifts: ShiftSpec[] = [
      { id: 'sat-am', start: '2027-08-07T10:00', end: '2027-08-07T15:00', eligible: { any: true }, headcount: { min: 2, max: 2 },
        rules: [{ id: 'e', label: '≥1 experienced', selector: { tag: 'experienced' }, min: 1 }] },
      { id: 'sat-pm', start: '2027-08-07T15:00', end: '2027-08-07T20:00', eligible: { any: true }, headcount: { min: 3, max: 3 },
        rules: [{ id: 'e', label: '≥2 experienced', selector: { tag: 'experienced' }, min: 2 }, { id: 'i', label: '≥1 inexperienced', selector: { tag: 'inexperienced' }, min: 1 }] },
      { id: 'sat-night', start: '2027-08-07T20:00', end: '2027-08-08T03:00', eligible: { any: true }, headcount: { min: 3, max: 4 },
        rules: [{ id: 'e', label: '≥1 experienced', selector: { tag: 'experienced' }, min: 1 }, { id: 'i', label: '≤2 inexperienced', selector: { tag: 'inexperienced' }, max: 2 }] },
    ]
    const policy = { minRestHours: 0 }
    const { assignment, unfilled } = fillRoster(shifts, people, policy, { seed: 'aug' })
    expect(unfilled).toEqual([])
    expect(checkRoster(shifts, assignment, byId, policy)).toEqual([])
    expect(assignment['sat-night']).toHaveLength(4) // prefers the max headcount when possible
  })
})

describe('skills-based crews (not just two pools)', () => {
  it('≥1 electrician, the rest any trade', () => {
    const crew = [P('e1', 'electrician'), P('m1', 'mechanic'), P('m2', 'mechanic'), P('p1', 'plumber'), P('h1', 'hvac'), P('x', 'office')]
    const job: ShiftSpec = {
      id: 'job', start: '2027-03-01T08:00', end: '2027-03-01T16:00',
      eligible: { anyOf: ['electrician', 'mechanic', 'plumber', 'hvac'].map(tag => ({ tag })) },
      headcount: { min: 3, max: 3 },
      rules: [{ id: 'el', label: 'At least one electrician', selector: { tag: 'electrician' }, min: 1 }],
    }
    const team = fillShift(job, crew, { seed: 's' })!
    expect(team).toContain('e1')
    expect(team).not.toContain('x')
    expect(checkShift(job, team, new Map(crew.map(p => [p.id, p])))).toEqual([])
  })
})

describe('trading respects the rules', () => {
  const day = lowSeasonDay('2027-01-04')
  const other = lowSeasonDay('2027-01-05')
  const shifts = [day, other]
  const a = { [day.id]: ['ana', 'dani'], [other.id]: ['ben', 'eva'] }
  it('inexperienced → inexperienced hand-over is fine', () => {
    expect(validateTrade(shifts, a, byId, {}, { shiftId: day.id, from: 'dani', to: 'fran' }).ok).toBe(true)
  })
  it('the only experienced person cannot hand over to an inexperienced one', () => {
    const r = validateTrade(shifts, a, byId, {}, { shiftId: day.id, from: 'ana', to: 'fran' })
    expect(r.ok).toBe(false)
    expect(r.violations.map(v => v.code)).toContain('rule')
  })
  it('swaps are checked on both shifts', () => {
    // ana (exp) ↔ eva (inexp): day would get 2 inexperienced → invalid
    expect(validateTrade(shifts, a, byId, {}, { shiftId: day.id, from: 'ana', to: 'eva', counterShiftId: other.id }).ok).toBe(false)
    // ana ↔ ben: both experienced → fine
    expect(validateTrade(shifts, a, byId, {}, { shiftId: day.id, from: 'ana', to: 'ben', counterShiftId: other.id }).ok).toBe(true)
  })
  it('lists who can validly take a seat', () => {
    // only experienced people can replace ana; ben works a different day, so he's free
    expect(validTakers(shifts, a, byId, {}, day.id, 'ana').sort()).toEqual(['ben', 'cris'])
  })
  it('availability and overlap block trades', () => {
    const policy = { unavailable: { cris: [['2027-01-04T00:00', '2027-01-05T00:00']] as Array<[string, string]> } }
    expect(validateTrade(shifts, a, byId, policy, { shiftId: day.id, from: 'ana', to: 'cris' }).ok).toBe(false)
    expect(validTakers(shifts, a, byId, policy, day.id, 'ana')).toEqual(['ben'])
  })
})
