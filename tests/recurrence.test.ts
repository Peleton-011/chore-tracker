import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { addDays, isoWeekday } from '../shared/utils/dates'
import { advance, assigneeFor, describeRule, occursOn, upcoming, type RecurrenceRule } from '../shared/utils/recurrence'

const rule = (r: Partial<RecurrenceRule>): RecurrenceRule => ({
  freq: 'weekly', every: 1, byWeekday: [], mode: 'fixed', startDate: '2026-11-02', endDate: null, ...r,
})
const dates = (r: RecurrenceRule, from: string, n: number) => upcoming(r, from, n).map(o => o.date)

describe('occursOn / upcoming', () => {
  it('daily every 3', () => {
    expect(dates(rule({ freq: 'daily', every: 3 }), '2026-11-02', 4))
      .toEqual(['2026-11-02', '2026-11-05', '2026-11-08', '2026-11-11'])
  })
  it('weekly defaults to the start weekday', () => {
    expect(dates(rule({ startDate: '2026-11-04' }), '2026-11-01', 3))
      .toEqual(['2026-11-04', '2026-11-11', '2026-11-18'])
  })
  it('weekly on Mon+Thu every 2 weeks, anchored to the start week', () => {
    expect(dates(rule({ every: 2, byWeekday: [1, 4] }), '2026-11-02', 5))
      .toEqual(['2026-11-02', '2026-11-05', '2026-11-16', '2026-11-19', '2026-11-30'])
  })
  it('weekly never yields dates before start, even inside the start week', () => {
    expect(dates(rule({ startDate: '2026-11-05', byWeekday: [1, 4] }), '2026-11-01', 2))
      .toEqual(['2026-11-05', '2026-11-09'])
  })
  it('monthly on the 31st clamps to month end', () => {
    expect(dates(rule({ freq: 'monthly', startDate: '2027-01-31' }), '2027-01-01', 4))
      .toEqual(['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30'])
  })
  it('yearly on Feb 29 clamps in common years', () => {
    expect(dates(rule({ freq: 'yearly', startDate: '2028-02-29' }), '2028-01-01', 3))
      .toEqual(['2028-02-29', '2029-02-28', '2030-02-28'])
  })
  it('respects end date', () => {
    expect(dates(rule({ freq: 'daily', endDate: '2026-11-04' }), '2026-11-01', 10))
      .toEqual(['2026-11-02', '2026-11-03', '2026-11-04'])
  })
  it('occurrence index counts from the start date, not from `from`', () => {
    const r = rule({ freq: 'daily' })
    expect(upcoming(r, '2026-11-12', 1)[0]).toEqual({ date: '2026-11-12', index: 10 })
  })
  it('crosses DST changes without drifting', () => {
    const r = rule({ freq: 'daily', startDate: '2026-03-27' })
    expect(dates(r, '2026-03-27', 4)).toEqual(['2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30'])
    expect(occursOn(rule({ freq: 'weekly', startDate: '2026-10-19' }), '2026-10-26')).toBe(true)
  })
  it('after-completion lists successive periods', () => {
    expect(dates(rule({ mode: 'after_completion', freq: 'monthly', startDate: '2026-01-31' }), '2026-01-01', 3))
      .toEqual(['2026-01-31', '2026-02-28', '2026-03-28'])
  })
})

describe('helpers', () => {
  it('isoWeekday', () => {
    expect(isoWeekday('2026-11-02')).toBe(1)
    expect(isoWeekday('2026-11-08')).toBe(7)
    expect(isoWeekday('1970-01-01')).toBe(4)
  })
  it('advance', () => {
    expect(advance('2026-01-31', 'monthly', 1)).toBe('2026-02-28')
    expect(advance('2026-11-02', 'weekly', 2)).toBe('2026-11-16')
  })
  it('assigneeFor', () => {
    expect(assigneeFor('rotation', ['a', 'b', 'c'], 4)).toBe('b')
    expect(assigneeFor('fixed', ['a', 'b'], 9)).toBe('a')
    expect(assigneeFor('rotation', [], 1)).toBeNull()
    expect(assigneeFor('unassigned', ['a'], 0)).toBeNull()
  })
  it('describeRule', () => {
    expect(describeRule(rule({ byWeekday: [4, 1] }))).toBe('Every week on Mon, Thu')
    expect(describeRule(rule({ byWeekday: [1, 2, 3, 4, 5] }))).toBe('Every weekday')
    expect(describeRule(rule({ freq: 'daily', every: 2 }))).toBe('Every 2 days')
    expect(describeRule(rule({ freq: 'daily', every: 10, mode: 'after_completion' }))).toBe("10 days after it's done")
    expect(describeRule(rule({ freq: 'monthly', startDate: '2026-11-15' }))).toBe('Every month on day 15')
  })
})

// ---------------------------------------------------------------------------
// Parity fixture: the SQL suite (supabase/tests/test_parity.sql) replays these
// rules through private.chore_occurs_on and must produce the same dates.
// ---------------------------------------------------------------------------
const PARITY_RULES: RecurrenceRule[] = [
  rule({ freq: 'daily', every: 1 }),
  rule({ freq: 'daily', every: 4, startDate: '2026-12-30' }),
  rule({ freq: 'weekly', every: 1 }),
  rule({ freq: 'weekly', every: 3, byWeekday: [2, 6, 7], startDate: '2026-11-07' }),
  rule({ freq: 'weekly', every: 2, byWeekday: [1, 5], startDate: '2027-01-01', endDate: '2027-04-01' }),
  rule({ freq: 'monthly', every: 1, startDate: '2026-10-31' }),
  rule({ freq: 'monthly', every: 5, startDate: '2026-11-29' }),
  rule({ freq: 'yearly', every: 1, startDate: '2028-02-29' }),
  rule({ freq: 'yearly', every: 2, startDate: '2026-12-25' }),
]
const WINDOW = { from: '2026-10-01', to: '2031-01-01' }

export function parityFixture() {
  return PARITY_RULES.map((r) => {
    const out: string[] = []
    for (let d = WINDOW.from; d <= WINDOW.to; d = addDays(d, 1)) if (occursOn(r, d)) out.push(d)
    return { rule: r, from: WINDOW.from, to: WINDOW.to, dates: out }
  })
}

describe('SQL parity fixture', () => {
  it('is up to date (run with UPDATE_FIXTURES=1 to regenerate)', () => {
    const path = fileURLToPath(new URL('../supabase/tests/fixtures/recurrence_cases.json', import.meta.url))
    const json = JSON.stringify(parityFixture())
    if (process.env.UPDATE_FIXTURES) writeFileSync(path, json + '\n')
    expect(readFileSync(path, 'utf8').trim()).toBe(json)
  })
})
