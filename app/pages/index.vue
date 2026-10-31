<script setup lang="ts">
import { addDays, humanDate, todayISO } from '#shared/utils/dates'

useHead({ title: 'Today · Household Hero' })

const userId = useUserId()
const tasks = useTasks()
const trades = useTrades()
const { spaceById, profile } = useSpaces()
const editor = useEditor()

const scope = ref<'mine' | 'everyone'>('mine')
const today = todayISO()

const visible = computed(() => scope.value === 'mine'
  ? tasks.mineOpen.value
  : tasks.open.value.filter(t => t.assignee_id))
const grabs = computed(() => tasks.upForGrabs.value
  .filter(t => spaceById(t.space_id)?.kind === 'household' && (!t.due_date || t.due_date <= addDays(today, 14))))
const doneToday = computed(() => tasks.all.value.filter(t =>
  t.status !== 'open' && t.closed_at && t.closed_at.slice(0, 10) >= addDays(today, -1)
  && (t.completed_by === userId.value || t.assignee_id === userId.value)))
const dueToday = computed(() => tasks.mineOpen.value.filter(t => t.due_date && t.due_date <= today).length)

const firstName = computed(() => profile(userId.value)?.display_name?.split(' ')[0] ?? '')
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 19 ? 'Good afternoon' : 'Good evening'
})
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>{{ greeting }}{{ firstName ? `, ${firstName}` : '' }}</h1>
        <p>
          {{ humanDate(today) === 'Today' ? new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : '' }}
          · {{ dueToday ? `${dueToday} thing${dueToday === 1 ? '' : 's'} for today` : 'nothing due today' }}
        </p>
      </div>
      <div class="segmented" role="group" aria-label="Whose tasks">
        <button :aria-pressed="scope === 'mine'" @click="scope = 'mine'">Mine</button>
        <button :aria-pressed="scope === 'everyone'" @click="scope = 'everyone'">Everyone</button>
      </div>
    </header>

    <NuxtLink v-if="trades.directIncoming.value.length" to="/trades" class="card banner row">
      <AppIcon name="swap" />
      <span class="grow">
        <strong>{{ trades.directIncoming.value.length }} trade request{{ trades.directIncoming.value.length === 1 ? '' : 's' }}</strong>
        waiting for your answer
      </span>
      <AppIcon name="right" />
    </NuxtLink>

    <TaskGroups :tasks="visible" show-space
      :empty-title="scope === 'mine' ? 'All clear' : 'Nothing assigned'"
      :empty-text="scope === 'mine' ? 'Nothing on your plate. Add a task with the + button.' : 'No one has anything assigned right now.'" />

    <section v-if="grabs.length" class="section">
      <h2>Up for grabs <span class="count">{{ grabs.length }}</span></h2>
      <p class="muted">Unassigned household tasks — take one and be a hero.</p>
      <div class="card flush">
        <TaskItem v-for="t in grabs" :key="t.id" :task="t" show-space />
      </div>
    </section>

    <section v-if="doneToday.length" class="section">
      <h2>Recently done <span class="count">{{ doneToday.length }}</span></h2>
      <div class="card flush">
        <TaskItem v-for="t in doneToday" :key="t.id" :task="t" show-space />
      </div>
    </section>

    <div v-if="!tasks.all.value.length" class="section empty">
      <strong>Welcome!</strong>
      Start with a <a href="#" @click.prevent="editor.newTask()">task</a>, set up a
      <a href="#" @click.prevent="editor.newChore()">recurring chore</a>, or
      <NuxtLink to="/spaces">create a household</NuxtLink> and invite your flatmates.
    </div>
  </div>
</template>

<style scoped>
.banner { margin-bottom: 1.25rem; color: var(--text); text-decoration: none; background: var(--warning-soft); border-color: transparent; gap: .75rem; }
.banner:hover { text-decoration: none; filter: brightness(.98); }
</style>
