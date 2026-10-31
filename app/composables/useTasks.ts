import type { ISODate, Task } from '#shared/types/schema'
import { addDays, todayISO } from '#shared/utils/dates'

export type TaskInput = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>> & { space_id: string; title: string }

/**
 * Tasks cache, keyed by id. Holds every open task in my spaces plus recently
 * closed ones and whatever month the calendar asked for.
 */
export function useTasks() {
  const db = useDb()
  const userId = useUserId()
  const toast = useToast()
  const byId = useState<Record<string, Task>>('tasks', () => ({}))

  const all = computed(() => Object.values(byId.value))
  const open = computed(() => all.value.filter(t => t.status === 'open'))
  const mineOpen = computed(() => open.value.filter(t => t.assignee_id === userId.value))
  const upForGrabs = computed(() => open.value.filter(t => !t.assignee_id))

  function put(rows: Task[]) {
    const next = { ...byId.value }
    for (const r of rows) next[r.id] = r
    byId.value = next
  }
  function drop(ids: string[]) {
    const next = { ...byId.value }
    for (const id of ids) delete next[id]
    byId.value = next
  }

  /** Open tasks everywhere + anything closed in the last two weeks. */
  async function fetchCurrent() {
    const since = new Date(Date.now() - 14 * 86_400_000).toISOString()
    const [openRes, closedRes] = await Promise.all([
      db.from('tasks').select('*').eq('status', 'open').order('due_date', { ascending: true, nullsFirst: false }).limit(2000),
      db.from('tasks').select('*').neq('status', 'open').gte('closed_at', since).limit(1000),
    ])
    if (openRes.error) throw openRes.error
    if (closedRes.error) throw closedRes.error
    // replace stale open tasks (deleted or regenerated server-side)
    const fresh = [...(openRes.data ?? []), ...(closedRes.data ?? [])] as Task[]
    const keep = Object.values(byId.value).filter(t => t.status !== 'open' && !fresh.some(f => f.id === t.id))
    byId.value = Object.fromEntries([...keep, ...fresh].map(t => [t.id, t]))
  }

  async function fetchRange(from: ISODate, to: ISODate) {
    const { data, error } = await db.from('tasks').select('*').gte('due_date', from).lte('due_date', to).limit(3000)
    if (error) throw error
    put((data ?? []) as Task[])
  }

  async function fetchSpace(spaceId: string) {
    const { data, error } = await db.from('tasks').select('*').eq('space_id', spaceId)
      .or(`status.eq.open,closed_at.gte.${new Date(Date.now() - 30 * 86_400_000).toISOString()}`)
      .limit(2000)
    if (error) throw error
    drop(open.value.filter(t => t.space_id === spaceId).map(t => t.id))
    put((data ?? []) as Task[])
  }

  async function create(input: TaskInput) {
    const { data, error } = await db.from('tasks').insert(input).select('*').single()
    if (error) throw error
    put([data as Task])
    return data as Task
  }

  async function update(id: string, patch: Partial<Task>) {
    const { data, error } = await db.from('tasks').update(patch).eq('id', id).select('*').single()
    if (error) throw error
    put([data as Task])
    return data as Task
  }

  async function setStatus(task: Task, status: Task['status']) {
    const prev = task.status
    // optimistic
    put([{ ...task, status, closed_at: status === 'open' ? null : new Date().toISOString() }])
    try {
      await update(task.id, { status })
      // closing a chore occurrence may spawn the next one server-side
      if (task.chore_id) await fetchCurrent()
      if (status !== 'open') {
        toast.info(status === 'done' ? `“${task.title}” done` : `“${task.title}” skipped`, {
          label: 'Undo', run: () => setStatus({ ...task, status }, prev),
        })
      }
    } catch (e) {
      put([task])
      toast.error(e)
    }
  }

  async function remove(task: Task) {
    const { error } = await db.from('tasks').delete().eq('id', task.id)
    if (error) throw error
    drop([task.id])
  }

  async function claim(task: Task) {
    if (!userId.value) return
    const { data, error } = await db.from('tasks').update({ assignee_id: userId.value })
      .eq('id', task.id).is('assignee_id', null).select('*')
    if (error) throw error
    if (!data?.length) throw new Error('Someone got there first')
    put(data as Task[])
  }

  /** Tasks shown on a given day (open ones + ones closed on/for that day). */
  function onDay(date: ISODate) {
    return all.value.filter(t => t.due_date === date)
  }

  const today = computed(() => todayISO())
  const overdueCount = computed(() => mineOpen.value.filter(t => t.due_date && t.due_date < today.value).length)
  const dueSoon = computed(() => mineOpen.value.filter(t => t.due_date && t.due_date <= addDays(today.value, 0)).length)

  return {
    byId, all, open, mineOpen, upForGrabs, overdueCount, dueSoon,
    fetchCurrent, fetchRange, fetchSpace, create, update, setStatus, remove, claim, onDay, put, drop,
  }
}
