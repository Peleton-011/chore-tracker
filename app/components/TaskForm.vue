<script setup lang="ts">
import type { Priority, Task } from '#shared/types/schema'
import { todayISO } from '#shared/utils/dates'

const props = defineProps<{ task: Task | null; defaults: Partial<Task> }>()
const emit = defineEmits<{ done: [] }>()

const userId = useUserId()
const tasks = useTasks()
const editor = useEditor()
const toast = useToast()
const { spaces, personalSpace, membersOf, spaceById } = useSpaces()
const { choreById } = useChores()

const isEdit = computed(() => !!props.task)
const base = props.task ?? props.defaults
const form = reactive({
  title: base.title ?? '',
  description: base.description ?? '',
  space_id: base.space_id ?? personalSpace.value?.id ?? spaces.value[0]?.id ?? '',
  due_date: base.due_date === undefined ? todayISO() : (base.due_date ?? ''),
  due_time: base.due_time?.slice(0, 5) ?? '',
  assignee_id: base.assignee_id === undefined ? userId.value : base.assignee_id,
  priority: (base.priority ?? 0) as Priority,
  effort: base.effort ?? 1,
})
const saving = ref(false)
const chore = computed(() => choreById(props.task?.chore_id))
const space = computed(() => spaceById(form.space_id))
const members = computed(() => membersOf(form.space_id))

watch(() => form.space_id, () => {
  if (space.value?.kind === 'personal') form.assignee_id = userId.value
  else if (form.assignee_id && !members.value.some(m => m.user_id === form.assignee_id)) form.assignee_id = userId.value
})

async function save() {
  if (!form.title.trim()) return
  saving.value = true
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    space_id: form.space_id,
    due_date: form.due_date || null,
    due_time: form.due_time || null,
    assignee_id: form.assignee_id || null,
    priority: form.priority,
    effort: form.effort,
  }
  try {
    if (props.task) {
      const { space_id: _s, ...patch } = payload
      await tasks.update(props.task.id, chore.value ? patch : payload)
      toast.info('Saved')
    } else {
      await tasks.create(payload)
      toast.info('Task added')
    }
    emit('done')
  } catch (e) {
    toast.error(e)
  } finally {
    saving.value = false
  }
}

function makeRecurring() {
  emit('done')
  editor.newChore(form.space_id, {
    title: form.title,
    description: form.description || null,
    priority: form.priority,
    effort: form.effort,
    start_date: form.due_date || todayISO(),
    due_time: form.due_time || null,
  })
}
</script>

<template>
  <form class="stack" style="--gap:1rem" @submit.prevent="save">
    <p v-if="chore" class="chip accent" style="align-self:flex-start">
      <AppIcon name="repeat" :size="12" /> One occurrence of “{{ chore.title }}” — changes apply to this one only
    </p>

    <div class="field">
      <label for="t-title">What needs doing?</label>
      <input id="t-title" v-model="form.title" class="input" required maxlength="200" placeholder="e.g. Buy bin bags"
        autofocus>
    </div>

    <div class="field">
      <label for="t-desc">Notes</label>
      <textarea id="t-desc" v-model="form.description" class="textarea" placeholder="Optional details" />
    </div>

    <div class="grid-2">
      <div class="field">
        <label for="t-space">Where</label>
        <select id="t-space" v-model="form.space_id" class="select" :disabled="!!chore">
          <option v-for="s in spaces" :key="s.id" :value="s.id">{{ s.kind === 'personal' ? 'Personal' : s.name }}</option>
        </select>
      </div>
      <div v-if="space?.kind === 'household'" class="field">
        <label for="t-who">Who</label>
        <select id="t-who" v-model="form.assignee_id" class="select">
          <option :value="null">Anyone (up for grabs)</option>
          <option v-for="m in members" :key="m.user_id" :value="m.user_id">
            {{ m.user_id === userId ? 'Me' : m.profile.display_name }}
          </option>
        </select>
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label for="t-date">Due</label>
        <input id="t-date" v-model="form.due_date" type="date" class="input">
        <span class="hint">Leave empty for “someday”.</span>
      </div>
      <div class="field">
        <label for="t-time">Time</label>
        <input id="t-time" v-model="form.due_time" type="time" class="input">
      </div>
    </div>

    <div class="field">
      <span class="label">Priority</span>
      <PrioritySelect v-model="form.priority" />
    </div>

    <div v-if="space?.kind === 'household'" class="field">
      <span class="label">Effort</span>
      <EffortSelect v-model="form.effort" />
    </div>

    <div class="modal-foot">
      <button v-if="!isEdit" type="button" class="btn btn-ghost" style="margin-right:auto" @click="makeRecurring">
        <AppIcon name="repeat" :size="16" /> Make it repeat…
      </button>
      <button type="button" class="btn" @click="emit('done')">Cancel</button>
      <button class="btn btn-primary" :disabled="saving || !form.title.trim()">{{ isEdit ? 'Save' : 'Add task' }}</button>
    </div>
  </form>
</template>
