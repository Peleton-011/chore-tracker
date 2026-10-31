import type {
  MemberRole,
  MemberStats,
  MemberWithProfile,
  Profile,
  Space,
  SpaceInvite,
  SpaceWithRole,
} from '#shared/types/schema'

/**
 * Spaces I belong to, their members (with profiles) and invites.
 * State is global (useState) so every page shares one copy.
 */
export function useSpaces() {
  const db = useDb()
  const userId = useUserId()
  const spaces = useState<SpaceWithRole[]>('spaces', () => [])
  const members = useState<MemberWithProfile[]>('members', () => [])
  const stats = useState<MemberStats[]>('member-stats', () => [])

  const personalSpace = computed(() => spaces.value.find(s => s.kind === 'personal') ?? null)
  const households = computed(() => spaces.value.filter(s => s.kind === 'household'))
  const profiles = computed(() => {
    const map = new Map<string, Profile>()
    for (const m of members.value) map.set(m.user_id, m.profile)
    return map
  })

  function spaceById(id: string | null | undefined) {
    return spaces.value.find(s => s.id === id) ?? null
  }
  function membersOf(spaceId: string) {
    return members.value
      .filter(m => m.space_id === spaceId)
      .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
  }
  function profile(id: string | null | undefined) {
    return id ? profiles.value.get(id) ?? null : null
  }
  function displayName(id: string | null | undefined, opts: { you?: boolean } = { you: true }) {
    if (!id) return 'Anyone'
    if (opts.you && id === userId.value) return 'You'
    return profile(id)?.display_name || 'Someone'
  }

  async function fetchSpaces() {
    if (!userId.value) return
    const { data, error } = await db
      .from('space_members')
      .select('role, space:spaces(*)')
      .eq('user_id', userId.value)
    if (error) throw error
    const rows = (data ?? []) as unknown as Array<{ role: MemberRole; space: Space | null }>
    spaces.value = rows
      .filter((r): r is { role: MemberRole; space: Space } => !!r.space)
      .map(r => ({ ...r.space, role: r.role }))
      .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'personal' ? -1 : 1))
  }

  async function fetchMembers() {
    const { data, error } = await db.from('space_members').select('*, profile:profiles(*)')
    if (error) throw error
    members.value = (data ?? []) as unknown as MemberWithProfile[]
  }

  async function fetchStats() {
    const { data, error } = await db.from('member_stats').select('*')
    if (error) throw error
    stats.value = (data ?? []) as MemberStats[]
  }

  async function refresh() {
    await fetchSpaces()
    await Promise.all([fetchMembers(), fetchStats()])
  }

  async function createSpace(input: { name: string; description?: string; color?: string; icon?: string }) {
    const { data, error } = await db.rpc('create_space', {
      p_name: input.name,
      p_description: input.description ?? null,
      p_color: input.color ?? null,
      p_icon: input.icon ?? null,
    })
    if (error) throw error
    await refresh()
    return data as Space
  }

  async function updateSpace(id: string, patch: Partial<Pick<Space, 'name' | 'description' | 'color' | 'icon'>>) {
    const { error } = await db.from('spaces').update(patch).eq('id', id)
    if (error) throw error
    await fetchSpaces()
  }

  async function deleteSpace(id: string) {
    const { error, count } = await db.from('spaces').delete({ count: 'exact' }).eq('id', id)
    if (error) throw error
    if (!count) throw new Error('Only the owner can delete a household')
    await refresh()
  }

  async function leaveSpace(id: string) {
    const { error } = await db.rpc('leave_space', { p_space_id: id })
    if (error) throw error
    await refresh()
  }

  async function removeMember(spaceId: string, uid: string) {
    const { error } = await db.rpc('remove_member', { p_space_id: spaceId, p_user_id: uid })
    if (error) throw error
    await refresh()
  }

  async function setRole(spaceId: string, uid: string, role: MemberRole) {
    const { error } = await db.rpc('set_member_role', { p_space_id: spaceId, p_user_id: uid, p_role: role })
    if (error) throw error
    await refresh()
  }

  async function listInvites(spaceId: string) {
    const { data, error } = await db
      .from('space_invites')
      .select('*')
      .eq('space_id', spaceId)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as SpaceInvite[]
  }

  async function createInvite(spaceId: string, opts: { days?: number; maxUses?: number | null } = {}) {
    const expires = new Date(Date.now() + (opts.days ?? 7) * 86_400_000).toISOString()
    const { data, error } = await db
      .from('space_invites')
      .insert({ space_id: spaceId, expires_at: expires, max_uses: opts.maxUses ?? null })
      .select('*')
      .single()
    if (error) throw error
    return data as SpaceInvite
  }

  async function revokeInvite(id: string) {
    const { error } = await db.from('space_invites').update({ revoked_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  }

  return {
    spaces, members, stats, personalSpace, households,
    spaceById, membersOf, profile, displayName,
    fetchSpaces, fetchMembers, fetchStats, refresh,
    createSpace, updateSpace, deleteSpace, leaveSpace, removeMember, setRole,
    listInvites, createInvite, revokeInvite,
  }
}
