// Calendar-date helpers working on `YYYY-MM-DD` strings. Arithmetic is done
// in UTC so daylight-saving changes can never shift a date by one.

import type { ISODate, Weekday } from '../types/schema'

const DAY = 86_400_000

export function toISODate(d: Date): ISODate {
  // local calendar date of a JS Date (what the user sees on their wall)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now)
}

function parts(date: ISODate): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) throw new Error(`Invalid date: ${date}`)
  return [y, m, d]
}

/** Days since 1970-01-01 for a calendar date. */
export function dayNumber(date: ISODate): number {
  const [y, m, d] = parts(date)
  return Math.round(Date.UTC(y, m - 1, d) / DAY)
}

export function fromDayNumber(n: number): ISODate {
  const dt = new Date(n * DAY)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

export function addDays(date: ISODate, days: number): ISODate {
  return fromDayNumber(dayNumber(date) + days)
}

export function diffDays(a: ISODate, b: ISODate): number {
  return dayNumber(a) - dayNumber(b)
}

/** ISO weekday, 1 = Monday … 7 = Sunday */
export function isoWeekday(date: ISODate): Weekday {
  // 1970-01-01 was a Thursday (4)
  return ((((dayNumber(date) + 3) % 7) + 7) % 7 + 1) as Weekday
}

export function startOfWeek(date: ISODate): ISODate {
  return addDays(date, 1 - isoWeekday(date))
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function ymd(date: ISODate): { year: number; month: number; day: number } {
  const [year, month, day] = parts(date)
  return { year, month, day }
}

export function makeDate(year: number, month: number, day: number): ISODate {
  // normalises month overflow, clamps the day to the month length
  const y = year + Math.floor((month - 1) / 12)
  const m = ((((month - 1) % 12) + 12) % 12) + 1
  const d = Math.min(day, daysInMonth(y, m))
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function addMonths(date: ISODate, months: number): ISODate {
  const { year, month, day } = ymd(date)
  return makeDate(year, month + months, day)
}

export function startOfMonth(date: ISODate): ISODate {
  const { year, month } = ymd(date)
  return makeDate(year, month, 1)
}

export function endOfMonth(date: ISODate): ISODate {
  const { year, month } = ymd(date)
  return makeDate(year, month, 31)
}

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December'] as const

export function weekdayShort(w: Weekday): string {
  return WEEKDAY_SHORT[w - 1]!
}

export function monthLong(month: number): string {
  return MONTH_LONG[month - 1]!
}

/** "Today", "Tomorrow", "Yesterday", "Thu 6 Nov", or "Thu 6 Nov 2027" */
export function humanDate(date: ISODate, today: ISODate = todayISO()): string {
  const diff = diffDays(date, today)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  const { year, month, day } = ymd(date)
  const base = `${weekdayShort(isoWeekday(date))} ${day} ${MONTH_SHORT[month - 1]}`
  return year === ymd(today).year ? base : `${base} ${year}`
}

export function shortTime(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : ''
}
