import { todayISO } from '#shared/utils/dates'

/**
 * Boots the session's data once: rolls chores forward to "today" (the
 * client's local date), then loads spaces, members, chores, tasks and trades,
 * and subscribes to realtime changes so household members see each other's
 * updates live.
 */
export function useAppData() {
  const ready = useState('app-ready', () => false)
  const loading = useState('app-loading', () => false)
  const db = useDb()
  const userId = useUserId()
  const spaces = useSpaces()
  const tasks = useTasks()
  const chores = useChores()
  const trades = useTrades()
  const toast = useToast()

  async function reload() {
    const { error } = await db.rpc('sync_my_spaces', { p_today: todayISO() })
    if (error) throw error
    await spaces.refresh()
    await Promise.all([tasks.fetchCurrent(), chores.fetchChores(), trades.fetchTrades()])
  }

  async function ensureLoaded() {
    if (ready.value || loading.value || !userId.value) return
    loading.value = true
    try {
      await reload()
      ready.value = true
      subscribe()
    } catch (e) {
      toast.error(e)
    } finally {
      loading.value = false
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  function debounced(fn: () => Promise<unknown>) {
    clearTimeout(timer)
    timer = setTimeout(() => { fn().catch(() => {}) }, 400)
  }

  function subscribe() {
    db.channel('household-hero')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () =>
        debounced(() => Promise.all([tasks.fetchCurrent(), spaces.fetchStats()])))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_trades' }, () =>
        debounced(() => trades.fetchTrades()))
      .subscribe()
  }

  function reset() {
    ready.value = false
    db.removeAllChannels()
  }

  return { ready, loading, ensureLoaded, reload, reset }
}
