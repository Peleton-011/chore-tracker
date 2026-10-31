<script setup lang="ts">
import type { Task } from '#shared/types/schema'
import { humanDate, shortTime, todayISO } from '#shared/utils/dates'

const props = defineProps<{ task: Task; showSpace?: boolean; showDate?: boolean }>()

const userId = useUserId()
const tasks = useTasks()
const trades = useTrades()
const editor = useEditor()
const toast = useToast()
const { spaceById, displayName } = useSpaces()
const { choreById } = useChores()

const menuOpen = ref(false)
const isOpen = computed(() => props.task.status === 'open')
const isMine = computed(() => props.task.assignee_id === userId.value)
const space = computed(() => spaceById(props.task.space_id))
const isHousehold = computed(() => space.value?.kind === 'household')
const overdue = computed(() => isOpen.value && !!props.task.due_date && props.task.due_date < todayISO())
const pendingTrade = computed(() => trades.pendingFor(props.task.id))
const chore = computed(() => choreById(props.task.chore_id))

function toggle() {
  tasks.setStatus(props.task, isOpen.value ? 'done' : 'open')
}

async function run(action: () => Promise<unknown> | void) {
  menuOpen.value = false
  try { await action() } catch (e) { toast.error(e) }
}

async function claim() {
  await tasks.claim(props.task)
  toast.info(`“${props.task.title}” is yours`)
}

async function remove() {
  const what = props.task.chore_id ? 'this occurrence (the chore keeps going)' : 'this task'
  if (!confirm(`Delete ${what}?`)) return
  await tasks.remove(props.task)
}

function closeMenu(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.task-menu')) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))
</script>

<template>
  <div class="task" :class="{ closed: !isOpen, overdue }">
    <button class="check" :class="{ done: task.status === 'done', skipped: task.status === 'skipped' }"
      :aria-label="isOpen ? `Mark “${task.title}” done` : `Reopen “${task.title}”`" @click="toggle">
      <AppIcon v-if="task.status === 'done'" name="check" :size="14" />
      <AppIcon v-else-if="task.status === 'skipped'" name="skip" :size="12" />
    </button>

    <div class="body" @click="editor.editTask(task)">
      <div class="title">
        <span class="truncate">{{ task.title }}</span>
        <AppIcon v-if="task.priority >= 3" name="flag" :size="14" :class="`p${task.priority}`" />
      </div>
      <div class="meta">
        <span v-if="showDate !== false && task.due_date" :class="{ late: overdue }">
          {{ humanDate(task.due_date) }}<template v-if="task.due_time"> · {{ shortTime(task.due_time) }}</template>
        </span>
        <span v-else-if="task.due_time">{{ shortTime(task.due_time) }}</span>
        <span v-if="chore" class="row" style="--gap:.2rem" :title="chore.title"><AppIcon name="repeat" :size="12" /> chore</span>
        <SpaceTag v-if="showSpace" :space-id="task.space_id" />
        <span v-if="pendingTrade" class="chip warning">trade pending</span>
        <span v-if="task.status === 'done' && task.completed_by && task.completed_by !== task.assignee_id" class="muted">
          done by {{ displayName(task.completed_by) }}
        </span>
      </div>
    </div>

    <button v-if="isOpen && !task.assignee_id && isHousehold" class="btn btn-sm" title="Take it" @click="run(claim)">
      <AppIcon name="hand" :size="14" /> Take it
    </button>
    <UserAvatar v-else-if="isHousehold" :user-id="task.assignee_id" :size="26" />

    <div class="task-menu">
      <button class="btn btn-ghost btn-icon" aria-label="More actions" @click.stop="menuOpen = !menuOpen">
        <AppIcon name="more" />
      </button>
      <div v-if="menuOpen" class="menu card">
        <button @click="run(() => editor.editTask(task))"><AppIcon name="edit" :size="16" /> Edit</button>
        <button v-if="isOpen && isMine && isHousehold && !pendingTrade" @click="run(() => editor.tradeTask(task))">
          <AppIcon name="swap" :size="16" /> Trade or hand over
        </button>
        <button v-if="isOpen" @click="run(() => tasks.setStatus(task, 'skipped'))"><AppIcon name="skip" :size="16" /> Skip</button>
        <button v-if="chore" @click="run(() => editor.editChore(chore!))"><AppIcon name="repeat" :size="16" /> Edit chore</button>
        <button class="danger" @click="run(remove)"><AppIcon name="trash" :size="16" /> Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task { display: flex; align-items: center; gap: .75rem; padding: .65rem .9rem; background: var(--surface); position: relative; }
.task + .task { border-top: 1px solid var(--border); }
.task.closed .title { text-decoration: line-through; color: var(--text-muted); }
.check {
  flex: none; width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--border); background: transparent; color: #fff;
  display: grid; place-items: center; cursor: pointer; padding: 0;
  transition: border-color .15s, background .15s;
}
.check:hover { border-color: var(--success); }
.check.done { background: var(--success); border-color: var(--success); }
.check.skipped { background: var(--text-muted); border-color: var(--text-muted); }
.body { flex: 1; min-width: 0; cursor: pointer; }
.title { display: flex; align-items: center; gap: .35rem; font-weight: 550; }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: .25rem .6rem; font-size: .8rem; color: var(--text-muted); }
.late { color: var(--danger); font-weight: 600; }
.p3 { color: var(--p3); } .p4 { color: var(--p4); }
.task-menu { position: relative; }
.menu { position: absolute; right: 0; top: calc(100% + 4px); z-index: 10; min-width: 210px; padding: .35rem; display: flex; flex-direction: column; }
.menu button {
  display: flex; align-items: center; gap: .6rem; width: 100%; text-align: left;
  font: inherit; font-size: .9rem; color: var(--text); background: none; border: 0;
  padding: .5rem .6rem; border-radius: 6px; cursor: pointer;
}
.menu button:hover { background: var(--surface-2); }
.menu .danger { color: var(--danger); }
</style>
