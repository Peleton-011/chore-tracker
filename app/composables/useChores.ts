import type { Chore } from '#shared/types/schema'

export type ChoreInput = Partial<Omit<Chore, 'id' | 'generated_until' | 'generated_count' | 'created_at' | 'updated_at'>>
  & { space_id: string; title: string }

export function useChores() {
  const db = useDb()
  const chores = useState<Chore[]>('chores', () => [])
  const tasks = useTasks()

  function choreById(id: string | null | undefined) {
    return chores.value.find(c => c.id === id) ?? null
  }

  async function fetchChores() {
    const { data, error } = await db.from('chores').select('*').order('title')
    if (error) throw error
    chores.value = (data ?? []) as Chore[]
  }

  async function create(input: ChoreInput) {
    const { data, error } = await db.from('chores').insert(input).select('*').single()
    if (error) throw error
    await Promise.all([fetchChores(), tasks.fetchSpace(input.space_id)])
    return data as Chore
  }

  async function update(id: string, patch: Partial<ChoreInput>) {
    const { space_id: _ignored, ...rest } = patch
    const { data, error } = await db.from('chores').update(rest).eq('id', id).select('*').single()
    if (error) throw error
    const chore = data as Chore
    await Promise.all([fetchChores(), tasks.fetchSpace(chore.space_id)])
    return chore
  }

  async function remove(chore: Chore) {
    const { error } = await db.from('chores').delete().eq('id', chore.id)
    if (error) throw error
    await Promise.all([fetchChores(), tasks.fetchSpace(chore.space_id)])
  }

  return { chores, choreById, fetchChores, create, update, remove }
}
