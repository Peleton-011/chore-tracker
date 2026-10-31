// TypeScript twin of the recurrence engine in supabase/migrations/0001_init.sql
// (private.chore_occurs_on / private.advance_date / private.pick_assignee).
// The database is the source of truth; this copy powers the live preview in
// the chore form. tests/recurrence.test.ts pins both to the same cases.

import type { AssignmentStrategy, ISODate, RecurrenceFreq, RecurrenceMode, UUID, Weekday } from '../types/schema'
import {
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  isoWeekday,
  startOfWeek,
  weekdayShort,
  ymd,
} from './dates'

export interface RecurrenceRule {
  freq: RecurrenceFreq
  every: number
  byWeekday: Weekday[]
  mode: RecurrenceMode
  startDate: ISODate
  endDate: ISODate | null
}

export function occursOn(rule: RecurrenceRule, date: ISODate): boolean {
  if (date < rule.startDate || (rule.endDate && date > rule.endDate)) return false
  const every = Math.max(1, rule.every)

  switch (rule.freq) {
    case 'daily':
      return diffDays(date, rule.startDate) % every === 0

    case 'weekly': {
      const wd = isoWeekday(date)
      const days = rule.byWeekday.length ? rule.byWeekday : [isoWeekday(rule.startDate)]
      if (!days.includes(wd)) return false
      const weeks = diffDays(startOfWeek(date), startOfWeek(rule.startDate)) / 7
      return weeks % every === 0
    }

    case 'monthly': {
      const d = ymd(date)
      const s = ymd(rule.startDate)
      const months = d.year * 12 + d.month - (s.year * 12 + s.month)
      return months % every === 0 && d.day === Math.min(s.day, daysInMonth(d.year, d.month))
    }

    case 'yearly': {
      const d = ymd(date)
      const s = ymd(rule.startDate)
      return d.month === s.month
        && (d.year - s.year) % every === 0
        && d.day === Math.min(s.day, daysInMonth(d.year, d.month))
    }
  }
}

/** One period after `date` (used by after-completion chores). */
export function advance(date: ISODate, freq: RecurrenceFreq, every: number): ISODate {
  switch (freq) {
    case 'daily': return addDays(date, every)
    case 'weekly': return addDays(date, 7 * every)
    case 'monthly': return addMonths(date, every)
    case 'yearly': return addMonths(date, 12 * every)
  }
}

/**
 * Upcoming occurrence dates on/after `from` (fixed mode), with their 0-based
 * occurrence index counted from the start date — the index drives rotation.
 */
export function upcoming(
  rule: RecurrenceRule,
  from: ISODate,
  count: number,
  maxScanDays = 366 * 6,
): Array<{ date: ISODate; index: number }> {
  const out: Array<{ date: ISODate; index: number }> = []
  if (rule.mode === 'after_completion') {
    let d = from > rule.startDate ? from : rule.startDate
    for (let i = 0; i < count; i++) {
      if (rule.endDate && d > rule.endDate) break
      out.push({ date: d, index: i })
      d = advance(d, rule.freq, rule.every)
    }
    return out
  }
  let index = 0
  let d = rule.startDate
  for (let scanned = 0; scanned < maxScanDays && out.length < count; scanned++) {
    if (rule.endDate && d > rule.endDate) break
    if (occursOn(rule, d)) {
      if (d >= from) out.push({ date: d, index })
      index++
    }
    d = addDays(d, 1)
  }
  return out
}

/** Deterministic part of the server's pick_assignee ('balanced' depends on live load). */
export function assigneeFor(strategy: AssignmentStrategy, rotation: UUID[], index: number): UUID | null | 'balanced' {
  switch (strategy) {
    case 'unassigned': return null
    case 'fixed': return rotation[0] ?? null
    case 'rotation': return rotation.length ? rotation[index % rotation.length]! : null
    case 'balanced': return 'balanced'
  }
}

const UNIT: Record<RecurrenceFreq, [string, string]> = {
  daily: ['day', 'days'],
  weekly: ['week', 'weeks'],
  monthly: ['month', 'months'],
  yearly: ['year', 'years'],
}

/** "Every day", "Every 2 weeks on Mon, Thu", "10 days after it's done" … */
export function describeRule(rule: Pick<RecurrenceRule, 'freq' | 'every' | 'byWeekday' | 'mode' | 'startDate'>): string {
  const [one, many] = UNIT[rule.freq]
  const span = rule.every === 1 ? one : `${rule.every} ${many}`
  if (rule.mode === 'after_completion') return `${rule.every === 1 ? `1 ${one}` : span} after it's done`

  let text = rule.every === 1 ? `Every ${one}` : `Every ${span}`
  if (rule.freq === 'weekly') {
    const days = rule.byWeekday.length ? [...rule.byWeekday].sort() : [isoWeekday(rule.startDate)]
    if (days.length === 7 && rule.every === 1) return 'Every day'
    if (days.join() === '1,2,3,4,5' && rule.every === 1) return 'Every weekday'
    text += ` on ${days.map(weekdayShort).join(', ')}`
  } else if (rule.freq === 'monthly') {
    text += ` on day ${ymd(rule.startDate).day}`
  }
  return text
}
