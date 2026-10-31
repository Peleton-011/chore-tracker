<script setup lang="ts">
import type { Task } from '#shared/types/schema'
import { humanDate, todayISO } from '#shared/utils/dates'
import { compareTasks } from '#shared/utils/grouping'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ done: [] }>()

const userId = useUserId()
const tasks = useTasks()
const trades = useTrades()
const toast = useToast()
const { membersOf, displayName, spaceById } = useSpaces()

const toUser = ref<string | null>(null)
const counterTaskId = ref<string | null>(null)
const message = ref('')
const saving = ref(false)

const others = computed(() => membersOf(props.task.space_id).filter(m => m.user_id !== userId.value))
const theirTasks = computed(() => tasks.open.value
  .filter(t => t.space_id === props.task.space_id && t.assignee_id === toUser.value && t.id !== props.task.id
    && (!t.due_date || t.due_date >= todayISO()) && !trades.pendingFor(t.id))
  .sort(compareTasks)
  .slice(0, 12))

watch(toUser, () => { counterTaskId.value = null })

async function send() {
  saving.value = true
  try {
    await trades.propose({ taskId: props.task.id, toUser: toUser.value, counterTaskId: counterTaskId.value, message: message.value })
    toast.info(toUser.value ? `Asked ${displayName(toUser.value)}` : 'Offered to the household')
    emit('done')
  } catch (e) {
    toast.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="stack" style="--gap:1rem">
    <div class="card" style="box-shadow:none;background:var(--surface-2)">
      <strong>{{ task.title }}</strong>
      <div class="muted">{{ task.due_date ? humanDate(task.due_date) : 'No date' }} · {{ spaceById(task.space_id)?.name }}</div>
    </div>

    <div class="field">
      <span class="label">Who should take it?</span>
      <div class="people">
        <button type="button" class="person" :aria-pressed="toUser === null" @click="toUser = null">
          <span class="avatar avatar-none" style="--size:36px">?</span>
          <span>Anyone</span>
        </button>
        <button v-for="m in others" :key="m.user_id" type="button" class="person" :aria-pressed="toUser === m.user_id"
          @click="toUser = m.user_id">
          <UserAvatar :user-id="m.user_id" :size="36" />
          <span class="truncate">{{ m.profile.display_name }}</span>
        </button>
      </div>
      <span class="hint">{{ toUser ? 'Only they can accept.' : 'First person in the household to accept gets it.' }}</span>
    </div>

    <div v-if="toUser" class="field">
      <span class="label">In exchange for (optional)</span>
      <div class="card flush">
        <ul class="list">
          <li class="list-row">
            <input id="none" v-model="counterTaskId" type="radio" :value="null">
            <label for="none" class="grow">Nothing — just a favour</label>
          </li>
          <li v-for="t in theirTasks" :key="t.id" class="list-row">
            <input :id="t.id" v-model="counterTaskId" type="radio" :value="t.id">
            <label :for="t.id" class="grow">{{ t.title }}</label>
            <span class="muted">{{ t.due_date ? humanDate(t.due_date) : 'No date' }}</span>
          </li>
        </ul>
      </div>
      <span v-if="!theirTasks.length" class="hint">{{ displayName(toUser) }} has nothing upcoming here to swap.</span>
    </div>

    <div class="field">
      <label for="tr-msg">Message</label>
      <input id="tr-msg" v-model="message" class="input" maxlength="500" placeholder="I'm away that weekend…">
    </div>

    <div class="modal-foot">
      <button class="btn" @click="emit('done')">Cancel</button>
      <button class="btn btn-primary" :disabled="saving" @click="send">
        <AppIcon name="swap" :size="16" /> {{ counterTaskId ? 'Propose swap' : toUser ? 'Ask' : 'Offer to everyone' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.people { display: flex; gap: .5rem; flex-wrap: wrap; }
.person {
  display: flex; flex-direction: column; align-items: center; gap: .3rem; width: 5.5rem;
  padding: .6rem .3rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--text); font: inherit; font-size: .8rem; cursor: pointer;
}
.person[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
.person span:last-child { max-width: 100%; }
</style>
