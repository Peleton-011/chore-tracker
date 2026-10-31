import type { ISODate, Task } from '../types/schema'
import { addDays, diffDays, startOfWeek } from './dates'

export type BucketKey = 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'later' | 'someday'

export interface Bucket<T> {
  key: BucketKey
  title: string
  tasks: T[]
}

const TITLES: Record<BucketKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  thisWeek: 'Later this week',
  nextWeek: 'Next week',
  later: 'Later',
  someday: 'No date',
}

export function bucketOf(due: ISODate | null, today: ISODate): BucketKey {
  if (!due) return 'someday'
  const diff = diffDays(due, today)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  const nextMonday = addDays(startOfWeek(today), 7)
  if (due < nextMonday) return 'thisWeek'
  if (due < addDays(nextMonday, 7)) return 'nextWeek'
  return 'later'
}

/** Sort: date, then time (untimed last within a day), then priority desc, then title. */
export function compareTasks(a: Pick<Task, 'due_date' | 'due_time' | 'priority' | 'title'>,
  b: Pick<Task, 'due_date' | 'due_time' | 'priority' | 'title'>): number {
  if (a.due_date !== b.due_date) {
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return a.due_date < b.due_date ? -1 : 1
  }
  if (a.due_time !== b.due_time) {
    if (!a.due_time) return 1
    if (!b.due_time) return -1
    return a.due_time < b.due_time ? -1 : 1
  }
  if (a.priority !== b.priority) return b.priority - a.priority
  return a.title.localeCompare(b.title)
}

/** Groups open tasks into agenda buckets, keeping empty buckets out. */
export function groupTasks<T extends Pick<Task, 'due_date' | 'due_time' | 'priority' | 'title'>>(
  tasks: T[],
  today: ISODate,
): Bucket<T>[] {
  const order: BucketKey[] = ['overdue', 'today', 'tomorrow', 'thisWeek', 'nextWeek', 'later', 'someday']
  const map = new Map<BucketKey, T[]>(order.map(k => [k, []]))
  for (const t of [...tasks].sort(compareTasks)) map.get(bucketOf(t.due_date, today))!.push(t)
  return order.filter(k => map.get(k)!.length).map(k => ({ key: k, title: TITLES[k], tasks: map.get(k)! }))
}
