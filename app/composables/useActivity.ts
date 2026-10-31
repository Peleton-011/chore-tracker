import type { Activity } from '#shared/types/schema'

export function useActivity() {
  const db = useDb()

  async function fetchFor(spaceId: string, limit = 60) {
    const { data, error } = await db.from('activity').select('*')
      .eq('space_id', spaceId).order('created_at', { ascending: false }).limit(limit)
    if (error) throw error
    return (data ?? []) as Activity[]
  }

  return { fetchFor }
}
