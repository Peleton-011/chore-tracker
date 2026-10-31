import type { TaskTrade } from '#shared/types/schema'

export function useTrades() {
  const db = useDb()
  const userId = useUserId()
  const trades = useState<TaskTrade[]>('trades', () => [])
  const tasks = useTasks()

  const pending = computed(() => trades.value.filter(t => t.status === 'pending'))
  /** Addressed to me, or open offers from someone else. */
  const incoming = computed(() => pending.value.filter(t =>
    t.from_user !== userId.value && (t.to_user === userId.value || t.to_user === null)))
  const directIncoming = computed(() => incoming.value.filter(t => t.to_user === userId.value))
  const outgoing = computed(() => pending.value.filter(t => t.from_user === userId.value))
  const history = computed(() => trades.value
    .filter(t => t.status !== 'pending' && (t.from_user === userId.value || t.to_user === userId.value))
    .sort((a, b) => (b.responded_at ?? b.created_at).localeCompare(a.responded_at ?? a.created_at)))

  function pendingFor(taskId: string) {
    return pending.value.find(t => t.task_id === taskId || t.counter_task_id === taskId) ?? null
  }

  async function fetchTrades() {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
    const { data, error } = await db.from('task_trades').select('*')
      .or(`status.eq.pending,created_at.gte.${since}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    trades.value = (data ?? []) as TaskTrade[]
  }

  async function propose(input: { taskId: string; toUser: string | null; counterTaskId: string | null; message: string }) {
    const { error } = await db.rpc('propose_trade', {
      p_task_id: input.taskId,
      p_to_user: input.toUser,
      p_counter_task_id: input.counterTaskId,
      p_message: input.message || null,
    })
    if (error) throw error
    await fetchTrades()
  }

  async function respond(trade: TaskTrade, accept: boolean) {
    const { error } = await db.rpc('respond_trade', { p_trade_id: trade.id, p_accept: accept })
    await fetchTrades()
    if (error) throw error
    if (accept) await tasks.fetchCurrent()
  }

  async function cancel(trade: TaskTrade) {
    const { error } = await db.rpc('cancel_trade', { p_trade_id: trade.id })
    if (error) throw error
    await fetchTrades()
  }

  return { trades, pending, incoming, directIncoming, outgoing, history, pendingFor, fetchTrades, propose, respond, cancel }
}
