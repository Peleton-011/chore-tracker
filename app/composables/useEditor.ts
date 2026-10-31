import type { Chore, Task } from '#shared/types/schema'

/**
 * One global place for the create/edit dialogs, so any screen (or the
 * floating "+" button) can open them and the layout renders them once.
 */
export function useEditor() {
  const task = useState<{ open: boolean; task: Task | null; defaults: Partial<Task> }>('editor-task',
    () => ({ open: false, task: null, defaults: {} }))
  const chore = useState<{ open: boolean; chore: Chore | null; spaceId: string | null; draft: Partial<Chore> }>(
    'editor-chore', () => ({ open: false, chore: null, spaceId: null, draft: {} }))
  const trade = useState<{ open: boolean; task: Task | null }>('editor-trade', () => ({ open: false, task: null }))

  return {
    task, chore, trade,
    newTask: (defaults: Partial<Task> = {}) => { task.value = { open: true, task: null, defaults } },
    editTask: (t: Task) => { task.value = { open: true, task: t, defaults: {} } },
    newChore: (spaceId: string | null = null, draft: Partial<Chore> = {}) => {
      chore.value = { open: true, chore: null, spaceId, draft }
    },
    editChore: (c: Chore) => { chore.value = { open: true, chore: c, spaceId: c.space_id, draft: {} } },
    tradeTask: (t: Task) => { trade.value = { open: true, task: t } },
    closeAll: () => {
      task.value = { ...task.value, open: false }
      chore.value = { ...chore.value, open: false }
      trade.value = { ...trade.value, open: false }
    },
  }
}
