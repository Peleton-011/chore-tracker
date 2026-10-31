<script setup lang="ts">
import type { TaskTrade } from '#shared/types/schema'
import { humanDate } from '#shared/utils/dates'

useHead({ title: 'Trades · Household Hero' })

const trades = useTrades()
const tasks = useTasks()
const toast = useToast()
const { displayName, spaceById } = useSpaces()
const busy = ref<string | null>(null)

const task = (id: string | null) => (id ? tasks.byId.value[id] ?? null : null)
const label = (id: string | null) => {
  const t = task(id)
  return t ? `“${t.title}”${t.due_date ? ` (${humanDate(t.due_date)})` : ''}` : 'a task'
}

async function act(tr: TaskTrade, fn: () => Promise<void>, done: string) {
  busy.value = tr.id
  try { await fn(); toast.info(done) } catch (e) { toast.error(e) } finally { busy.value = null }
}

const STATUS: Record<TaskTrade['status'], string> = {
  pending: 'pending', accepted: 'accepted', declined: 'declined', cancelled: 'cancelled', expired: 'expired',
}
const statusClass = (s: TaskTrade['status']) => (s === 'accepted' ? 'success' : s === 'declined' ? 'danger' : '')
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Trades</h1>
        <p>Can't make it? Hand a task over, or swap it for one of theirs.</p>
      </div>
    </header>

    <section>
      <h2>For you <span class="count">{{ trades.incoming.value.length }}</span></h2>
      <div v-if="trades.incoming.value.length" class="stack">
        <div v-for="tr in trades.incoming.value" :key="tr.id" class="card trade">
          <div class="row" style="--gap:.75rem; align-items:flex-start">
            <UserAvatar :user-id="tr.from_user" :size="36" />
            <div class="grow">
              <p style="margin:0">
                <strong>{{ displayName(tr.from_user) }}</strong>
                {{ tr.to_user ? 'asks you to take' : 'is offering' }} {{ label(tr.task_id) }}
                <template v-if="tr.counter_task_id"> in exchange for your {{ label(tr.counter_task_id) }}</template>
                <template v-else-if="!tr.to_user"> to anyone</template>
              </p>
              <p v-if="tr.message" class="quote">“{{ tr.message }}”</p>
              <span class="muted">{{ spaceById(tr.space_id)?.name }}</span>
            </div>
          </div>
          <div class="row" style="justify-content:flex-end">
            <button v-if="tr.to_user" class="btn" :disabled="busy === tr.id"
              @click="act(tr, () => trades.respond(tr, false), 'Declined')">Decline</button>
            <button class="btn btn-primary" :disabled="busy === tr.id"
              @click="act(tr, () => trades.respond(tr, true), tr.counter_task_id ? 'Swapped!' : 'It\'s yours now')">
              <AppIcon name="check" :size="16" /> {{ tr.counter_task_id ? 'Swap' : 'Take it' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty">No requests right now.</div>
    </section>

    <section class="section">
      <h2>Sent by you <span class="count">{{ trades.outgoing.value.length }}</span></h2>
      <div v-if="trades.outgoing.value.length" class="card flush">
        <ul class="list">
          <li v-for="tr in trades.outgoing.value" :key="tr.id" class="list-row">
            <AppIcon name="swap" :size="18" />
            <span class="grow">
              {{ label(tr.task_id) }} →
              <strong>{{ tr.to_user ? displayName(tr.to_user) : 'anyone' }}</strong>
              <template v-if="tr.counter_task_id"> for {{ label(tr.counter_task_id) }}</template>
            </span>
            <button class="btn btn-sm" :disabled="busy === tr.id" @click="act(tr, () => trades.cancel(tr), 'Withdrawn')">Withdraw</button>
          </li>
        </ul>
      </div>
      <div v-else class="empty">To trade a task, open its ⋯ menu and choose “Trade or hand over”.</div>
    </section>

    <section v-if="trades.history.value.length" class="section">
      <h2>Recent</h2>
      <div class="card flush">
        <ul class="list">
          <li v-for="tr in trades.history.value.slice(0, 20)" :key="tr.id" class="list-row">
            <UserAvatar :user-id="tr.from_user" :size="24" />
            <span class="grow muted">
              {{ displayName(tr.from_user) }} → {{ tr.to_user ? displayName(tr.to_user) : 'anyone' }}: {{ label(tr.task_id) }}
            </span>
            <span class="chip" :class="statusClass(tr.status)">{{ STATUS[tr.status] }}</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.trade { display: flex; flex-direction: column; gap: .75rem; }
.quote { margin: .3rem 0; font-style: italic; color: var(--text-muted); }
</style>
