<script setup lang="ts">
import { STRATEGY_LABELS, type Activity, type MemberRole, type SpaceInvite } from '#shared/types/schema'
import { humanDate, todayISO } from '#shared/utils/dates'
import { describeRule } from '#shared/utils/recurrence'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const userId = useUserId()
const spacesApi = useSpaces()
const { spaceById, membersOf, displayName, stats } = spacesApi
const tasks = useTasks()
const choresApi = useChores()
const editor = useEditor()
const toast = useToast()
const activityApi = useActivity()
const app = useAppData()

const space = computed(() => spaceById(id.value))
const isHousehold = computed(() => space.value?.kind === 'household')
const isAdmin = computed(() => space.value?.role === 'owner' || space.value?.role === 'admin')
const isOwner = computed(() => space.value?.role === 'owner')
useHead({ title: () => `${space.value?.name ?? 'Household'} · Household Hero` })

type Tab = 'tasks' | 'chores' | 'people' | 'activity' | 'settings'
const tab = ref<Tab>((route.query.tab as Tab) || 'tasks')
watch(tab, t => router.replace({ query: { ...route.query, tab: t } }))

const members = computed(() => membersOf(id.value))
const openTasks = computed(() => tasks.open.value.filter(t => t.space_id === id.value))
const chores = computed(() => choresApi.chores.value.filter(c => c.space_id === id.value))
const nextOf = (choreId: string) => openTasks.value
  .filter(t => t.chore_id === choreId && t.due_date).sort((a, b) => a.due_date!.localeCompare(b.due_date!))[0]

// ---- people / fairness ----
const memberStats = computed(() => members.value.map(m => ({
  ...m,
  s: stats.value.find(s => s.space_id === id.value && s.user_id === m.user_id),
})))
const totalEffort = computed(() => memberStats.value.reduce((n, m) => n + Number(m.s?.effort_30d ?? 0), 0))

// ---- invites ----
const invites = ref<SpaceInvite[]>([])
async function loadInvites() {
  if (!isHousehold.value) return
  try { invites.value = await spacesApi.listInvites(id.value) } catch (e) { toast.error(e) }
}
const inviteUrl = (token: string) => `${window.location.origin}/invite/${token}`
async function newInvite() {
  try {
    const inv = await spacesApi.createInvite(id.value)
    await copy(inviteUrl(inv.token))
    await loadInvites()
  } catch (e) { toast.error(e) }
}
async function copy(text: string) {
  try {
    if (navigator.share && /Mobi/i.test(navigator.userAgent)) await navigator.share({ title: `Join ${space.value?.name}`, url: text })
    else { await navigator.clipboard.writeText(text); toast.info('Invite link copied') }
  } catch { /* share sheet dismissed */ }
}
async function revoke(inv: SpaceInvite) {
  try { await spacesApi.revokeInvite(inv.id); await loadInvites() } catch (e) { toast.error(e) }
}

// ---- activity ----
const activity = ref<Activity[]>([])
async function loadActivity() {
  try { activity.value = await activityApi.fetchFor(id.value) } catch (e) { toast.error(e) }
}
function describe(a: Activity) {
  const who = displayName(a.actor_id)
  const what = a.subject ? `“${a.subject}”` : ''
  switch (a.verb) {
    case 'task.completed': return `${who} completed ${what}`
    case 'task.skipped': return `${who} skipped ${what}`
    case 'task.reopened': return `${who} reopened ${what}`
    case 'task.created': return `${who} added ${what}`
    case 'chore.created': return `${who} set up the chore ${what}`
    case 'trade.proposed': return a.data.to_user
      ? `${who} asked ${displayName(String(a.data.to_user))} to take ${what}`
      : `${who} offered ${what} to anyone`
    case 'trade.accepted': return a.data.counter_subject
      ? `${who} swapped ${what} for “${a.data.counter_subject}” with ${displayName(String(a.data.from_user))}`
      : `${who} took over ${what} from ${displayName(String(a.data.from_user))}`
    case 'trade.declined': return `${who} declined a trade`
    case 'member.joined': return `${who} joined`
    case 'member.left': return `${a.actor_id ? who : 'Someone'} left`
  }
  return `${who} did something`
}
const when = (ts: string) => {
  const d = new Date(ts)
  return `${humanDate(d.toISOString().slice(0, 10), todayISO())} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
}

watch(tab, (t) => {
  if (t === 'people') { loadInvites(); spacesApi.fetchStats().catch(() => {}) }
  if (t === 'activity') loadActivity()
}, { immediate: true })

onMounted(() => { tasks.fetchSpace(id.value).catch(() => {}) })

// ---- settings ----
const settings = reactive({ name: '', description: '', color: '' })
watch(space, (s) => {
  if (!s) return
  settings.name = s.name
  settings.description = s.description ?? ''
  settings.color = s.color ?? '#5b4bdb'
}, { immediate: true })
async function saveSettings() {
  try {
    await spacesApi.updateSpace(id.value, { name: settings.name.trim(), description: settings.description.trim() || null, color: settings.color })
    toast.info('Saved')
  } catch (e) { toast.error(e) }
}
async function leave() {
  if (!confirm(`Leave ${space.value?.name}? Your open tasks there become up for grabs.`)) return
  try {
    await spacesApi.leaveSpace(id.value)
    await app.reload()
    router.push('/spaces')
  } catch (e) { toast.error(e) }
}
async function destroy() {
  if (!confirm(`Delete ${space.value?.name} for everyone? All its chores, tasks and history go too.`)) return
  try {
    await spacesApi.deleteSpace(id.value)
    await app.reload()
    router.push('/spaces')
  } catch (e) { toast.error(e) }
}
async function changeRole(uid: string, role: MemberRole) {
  if (role === 'owner' && !confirm('Transfer ownership? You will become an admin.')) return
  try { await spacesApi.setRole(id.value, uid, role) } catch (e) { toast.error(e) }
}
async function kick(uid: string) {
  if (!confirm(`Remove ${displayName(uid)} from ${space.value?.name}?`)) return
  try { await spacesApi.removeMember(id.value, uid); await tasks.fetchSpace(id.value) } catch (e) { toast.error(e) }
}
</script>

<template>
  <div v-if="!space" class="empty">
    <strong>Household not found</strong>
    It may have been deleted, or you're not a member. <NuxtLink to="/spaces">Back to households</NuxtLink>
  </div>
  <div v-else>
    <header class="page-head">
      <div class="row" style="--gap:.9rem">
        <span class="swatch" :style="{ background: space.color || 'var(--accent)' }">
          <AppIcon :name="isHousehold ? 'home' : 'user'" />
        </span>
        <div>
          <h1 style="margin:0">{{ isHousehold ? space.name : 'Personal' }}</h1>
          <p v-if="space.description">{{ space.description }}</p>
        </div>
      </div>
      <div class="row">
        <button class="btn" @click="editor.newChore(space.id)"><AppIcon name="repeat" :size="16" /> New chore</button>
        <button class="btn btn-primary" @click="editor.newTask({ space_id: space.id, assignee_id: isHousehold ? null : userId })">
          <AppIcon name="plus" :size="16" /> Task
        </button>
      </div>
    </header>

    <div class="tabs" role="tablist">
      <button role="tab" :aria-selected="tab === 'tasks'" @click="tab = 'tasks'">Tasks</button>
      <button role="tab" :aria-selected="tab === 'chores'" @click="tab = 'chores'">Chores <span class="count">{{ chores.length }}</span></button>
      <button v-if="isHousehold" role="tab" :aria-selected="tab === 'people'" @click="tab = 'people'">People <span class="count">{{ members.length }}</span></button>
      <button v-if="isHousehold" role="tab" :aria-selected="tab === 'activity'" @click="tab = 'activity'">Activity</button>
      <button v-if="isHousehold" role="tab" :aria-selected="tab === 'settings'" @click="tab = 'settings'">Settings</button>
    </div>

    <!-- TASKS -->
    <TaskGroups v-if="tab === 'tasks'" :tasks="openTasks" empty-title="Nothing open here"
      empty-text="Add a task or set up a recurring chore." />

    <!-- CHORES -->
    <div v-else-if="tab === 'chores'">
      <div v-if="chores.length" class="card flush">
        <ul class="list">
          <li v-for="c in chores" :key="c.id" class="list-row chore" @click="editor.editChore(c)">
            <AppIcon :name="c.active ? 'repeat' : 'pause'" :size="18" />
            <div class="grow">
              <strong class="truncate" style="display:block">{{ c.title }}</strong>
              <span class="muted">
                {{ describeRule({ freq: c.freq, every: c.every, byWeekday: c.by_weekday, mode: c.mode, startDate: c.start_date }) }}
                <template v-if="isHousehold"> · {{ STRATEGY_LABELS[c.strategy] }}</template>
                <template v-if="nextOf(c.id)"> · next {{ humanDate(nextOf(c.id)!.due_date!) }}</template>
              </span>
            </div>
            <span v-if="!c.active" class="chip">paused</span>
            <div v-else-if="isHousehold" class="avatars">
              <UserAvatar v-for="uid in c.rotation.slice(0, 5)" :key="uid" :user-id="uid" :size="24" />
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="empty">
        <strong>No chores yet</strong>
        Chores repeat on their own and get handed out automatically.
        <div style="margin-top:.75rem"><button class="btn btn-primary" @click="editor.newChore(space.id)">Set one up</button></div>
      </div>
    </div>

    <!-- PEOPLE -->
    <div v-else-if="tab === 'people'" class="stack" style="--gap:1.5rem">
      <div class="card flush">
        <ul class="list">
          <li v-for="m in memberStats" :key="m.user_id" class="list-row person">
            <UserAvatar :user-id="m.user_id" :size="36" />
            <div class="grow">
              <div class="row" style="--gap:.4rem">
                <strong>{{ displayName(m.user_id) }}</strong>
                <span v-if="m.role !== 'member'" class="chip accent">{{ m.role }}</span>
              </div>
              <div class="muted">
                {{ m.s?.done_30d ?? 0 }} done in 30 days · {{ m.s?.open_assigned ?? 0 }} open
                <span v-if="Number(m.s?.overdue)" class="late"> · {{ m.s?.overdue }} overdue</span>
              </div>
              <div class="bar" :title="`${m.s?.effort_30d ?? 0} effort points in the last 30 days`">
                <span :style="{ width: totalEffort ? `${(Number(m.s?.effort_30d ?? 0) / totalEffort) * 100}%` : '0%' }" />
              </div>
            </div>
            <div v-if="m.user_id !== userId && (isOwner || (isAdmin && m.role === 'member'))" class="row" style="--gap:.25rem">
              <select v-if="isOwner" class="select" style="width:auto" :value="m.role"
                @change="changeRole(m.user_id, ($event.target as HTMLSelectElement).value as MemberRole)">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
              <button v-if="m.role !== 'owner'" class="btn btn-ghost btn-icon btn-danger" :aria-label="`Remove ${displayName(m.user_id)}`"
                @click="kick(m.user_id)">
                <AppIcon name="x" :size="16" />
              </button>
            </div>
          </li>
        </ul>
      </div>
      <p class="hint">The bar shows each person's share of the effort completed in the last 30 days.</p>

      <section>
        <div class="row between">
          <h2 style="margin:0">Invite people</h2>
          <button class="btn btn-primary btn-sm" @click="newInvite"><AppIcon name="link" :size="14" /> New invite link</button>
        </div>
        <p class="muted">Links work for 7 days. Anyone with the link can join after signing in.</p>
        <div v-if="invites.length" class="card flush">
          <ul class="list">
            <li v-for="inv in invites" :key="inv.id" class="list-row">
              <code class="grow truncate">{{ inviteUrl(inv.token) }}</code>
              <span class="muted">until {{ humanDate(inv.expires_at.slice(0, 10)) }}</span>
              <button class="btn btn-sm" @click="copy(inviteUrl(inv.token))">Copy</button>
              <button class="btn btn-sm btn-ghost btn-danger" @click="revoke(inv)">Revoke</button>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- ACTIVITY -->
    <div v-else-if="tab === 'activity'">
      <div v-if="activity.length" class="card flush">
        <ul class="list">
          <li v-for="a in activity" :key="a.id" class="list-row">
            <UserAvatar :user-id="a.actor_id" :size="26" />
            <span class="grow">{{ describe(a) }}</span>
            <span class="muted" style="white-space:nowrap">{{ when(a.created_at) }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="empty">No activity yet.</div>
    </div>

    <!-- SETTINGS -->
    <div v-else-if="tab === 'settings'" class="stack" style="--gap:1.5rem; max-width: 560px">
      <form v-if="isAdmin" class="card stack" @submit.prevent="saveSettings">
        <div class="field">
          <label for="s-name">Name</label>
          <input id="s-name" v-model="settings.name" class="input" required maxlength="80">
        </div>
        <div class="field">
          <label for="s-desc">Description</label>
          <textarea id="s-desc" v-model="settings.description" class="textarea" />
        </div>
        <div class="field">
          <label for="s-color">Colour</label>
          <input id="s-color" v-model="settings.color" type="color" class="input" style="height:2.6rem;padding:.2rem">
        </div>
        <div><button class="btn btn-primary">Save</button></div>
      </form>
      <div class="card stack">
        <h2>Leave household</h2>
        <p class="muted">Your open tasks become up for grabs and you're removed from rotations.
          <template v-if="isOwner"> Ownership passes to the longest-standing admin or member.</template></p>
        <div><button class="btn btn-danger" @click="leave">Leave {{ space.name }}</button></div>
      </div>
      <div v-if="isOwner" class="card stack">
        <h2>Delete household</h2>
        <p class="muted">Removes it for everyone, with all chores, tasks and history.</p>
        <div><button class="btn btn-danger" @click="destroy">Delete forever</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swatch { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; color: #fff; flex: none; }
.chore { cursor: pointer; }
.chore:hover { background: var(--surface-2); }
.late { color: var(--danger); }
.bar { height: 6px; background: var(--surface-2); border-radius: 99px; margin-top: .35rem; overflow: hidden; max-width: 260px; }
.bar span { display: block; height: 100%; background: var(--accent); border-radius: 99px; transition: width .3s; }
code { font-size: .8rem; color: var(--text-muted); }
</style>
