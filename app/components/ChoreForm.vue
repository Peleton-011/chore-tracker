<script setup lang="ts">
import {
  STRATEGY_LABELS,
  type AssignmentStrategy,
  type Chore,
  type Priority,
  type RecurrenceFreq,
  type RecurrenceMode,
  type Weekday,
} from '#shared/types/schema'
import { humanDate, isoWeekday, todayISO, weekdayShort } from '#shared/utils/dates'
import { assigneeFor, describeRule, upcoming } from '#shared/utils/recurrence'

const props = defineProps<{ chore: Chore | null; spaceId: string | null; draft: Partial<Chore> }>()
const emit = defineEmits<{ done: [] }>()

const userId = useUserId()
const chores = useChores()
const toast = useToast()
const { spaces, households, personalSpace, membersOf, spaceById, displayName } = useSpaces()

const base: Partial<Chore> = props.chore ?? props.draft
const initialSpace = base.space_id ?? props.spaceId ?? households.value[0]?.id ?? personalSpace.value?.id ?? ''
const form = reactive({
  space_id: initialSpace,
  title: base.title ?? '',
  description: base.description ?? '',
  priority: (base.priority ?? 0) as Priority,
  effort: base.effort ?? 1,
  freq: (base.freq ?? 'weekly') as RecurrenceFreq,
  every: base.every ?? 1,
  by_weekday: [...(base.by_weekday ?? [])] as Weekday[],
  mode: (base.mode ?? 'fixed') as RecurrenceMode,
  start_date: base.start_date ?? todayISO(),
  end_date: base.end_date ?? '',
  due_time: base.due_time?.slice(0, 5) ?? '',
  strategy: (base.strategy ?? 'rotation') as AssignmentStrategy,
  rotation: [...(base.rotation ?? [])] as string[],
  active: base.active ?? true,
})
const saving = ref(false)

const space = computed(() => spaceById(form.space_id))
const isPersonal = computed(() => space.value?.kind === 'personal')
const members = computed(() => membersOf(form.space_id))

function seedRotation() {
  if (isPersonal.value) {
    form.strategy = 'fixed'
    form.rotation = userId.value ? [userId.value] : []
  } else if (!form.rotation.length || form.rotation.some(id => !members.value.some(m => m.user_id === id))) {
    form.rotation = members.value.map(m => m.user_id)
  }
}
watch(() => form.space_id, seedRotation)
onMounted(() => { if (!props.chore) seedRotation() })

watch(() => form.freq, (f) => { if (f !== 'weekly') form.by_weekday = [] })

const rule = computed(() => ({
  freq: form.freq,
  every: Math.max(1, Number(form.every) || 1),
  byWeekday: form.by_weekday,
  mode: form.mode,
  startDate: form.start_date || todayISO(),
  endDate: form.end_date || null,
}))
const summary = computed(() => describeRule(rule.value))
const preview = computed(() => upcoming(rule.value, todayISO(), 6).map(o => ({
  ...o,
  who: assigneeFor(form.strategy, form.rotation, o.index),
})))

function toggleDay(d: Weekday) {
  form.by_weekday = form.by_weekday.includes(d) ? form.by_weekday.filter(x => x !== d) : [...form.by_weekday, d]
}
function inRotation(id: string) { return form.rotation.includes(id) }
function toggleMember(id: string) {
  form.rotation = inRotation(id) ? form.rotation.filter(x => x !== id) : [...form.rotation, id]
}
function move(id: string, dir: -1 | 1) {
  const i = form.rotation.indexOf(id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= form.rotation.length) return
  const next = [...form.rotation]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  form.rotation = next
}
const orderedMembers = computed(() => [
  ...form.rotation.map(id => members.value.find(m => m.user_id === id)).filter(m => !!m),
  ...members.value.filter(m => !inRotation(m.user_id)),
])

async function save() {
  if (!form.title.trim()) return
  saving.value = true
  const payload = {
    space_id: form.space_id,
    title: form.title.trim(),
    description: form.description.trim() || null,
    priority: form.priority,
    effort: form.effort,
    freq: form.freq,
    every: Math.max(1, Number(form.every) || 1),
    by_weekday: form.freq === 'weekly' ? form.by_weekday : [],
    mode: form.mode,
    start_date: form.start_date || todayISO(),
    end_date: form.end_date || null,
    due_time: form.due_time || null,
    strategy: form.strategy,
    rotation: form.strategy === 'unassigned' ? [] : form.rotation,
    active: form.active,
  }
  try {
    if (props.chore) await chores.update(props.chore.id, payload)
    else await chores.create(payload)
    toast.info(props.chore ? 'Chore updated — upcoming turns re-planned' : 'Chore created')
    emit('done')
  } catch (e) {
    toast.error(e)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!props.chore || !confirm(`Delete “${props.chore.title}”? Upcoming occurrences go too; history stays.`)) return
  try {
    await chores.remove(props.chore)
    toast.info('Chore deleted')
    emit('done')
  } catch (e) { toast.error(e) }
}

const freqs: Array<[RecurrenceFreq, string]> = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['yearly', 'Yearly']]
const units: Record<RecurrenceFreq, string> = { daily: 'day(s)', weekly: 'week(s)', monthly: 'month(s)', yearly: 'year(s)' }
const weekdays: Weekday[] = [1, 2, 3, 4, 5, 6, 7]
const strategies: AssignmentStrategy[] = ['rotation', 'balanced', 'fixed', 'unassigned']
const strategyHelp: Record<AssignmentStrategy, string> = {
  rotation: 'Each occurrence goes to the next person in the order below.',
  balanced: 'Goes to whoever has the least effort on their plate around that date.',
  fixed: 'Always the first person in the list.',
  unassigned: 'Nobody by default — anyone can take it.',
}
</script>

<template>
  <form class="stack" style="--gap:1.1rem" @submit.prevent="save">
    <div class="field">
      <label for="c-title">Chore</label>
      <input id="c-title" v-model="form.title" class="input" required maxlength="200" placeholder="e.g. Take out the trash"
        autofocus>
    </div>

    <div class="grid-2">
      <div class="field">
        <label for="c-space">Where</label>
        <select id="c-space" v-model="form.space_id" class="select" :disabled="!!chore">
          <option v-for="s in spaces" :key="s.id" :value="s.id">{{ s.kind === 'personal' ? 'Personal' : s.name }}</option>
        </select>
      </div>
      <div class="field">
        <label for="c-start">Starting</label>
        <input id="c-start" v-model="form.start_date" type="date" class="input" required>
      </div>
    </div>

    <div class="field">
      <span class="label">Repeats</span>
      <div class="segmented" role="group">
        <button v-for="[f, label] in freqs" :key="f" type="button" :aria-pressed="form.freq === f" @click="form.freq = f">
          {{ label }}
        </button>
      </div>
      <div class="row wrap" style="margin-top:.4rem">
        <span>every</span>
        <input v-model.number="form.every" type="number" min="1" max="365" class="input" style="width:5rem">
        <span>{{ units[form.freq] }}</span>
      </div>
    </div>

    <div v-if="form.freq === 'weekly' && form.mode === 'fixed'" class="field">
      <span class="label">On</span>
      <div class="daypicker">
        <button v-for="d in weekdays" :key="d" type="button" :aria-pressed="form.by_weekday.includes(d)"
          @click="toggleDay(d)">
          {{ weekdayShort(d).slice(0, 2) }}
        </button>
      </div>
      <span v-if="!form.by_weekday.length" class="hint">Defaults to {{ weekdayShort(isoWeekday(form.start_date || todayISO())) }}, the start date's weekday.</span>
    </div>

    <div class="field">
      <span class="label">Schedule</span>
      <div class="segmented" role="group">
        <button type="button" :aria-pressed="form.mode === 'fixed'" @click="form.mode = 'fixed'">On a fixed schedule</button>
        <button type="button" :aria-pressed="form.mode === 'after_completion'" @click="form.mode = 'after_completion'">
          Counting from when it's done
        </button>
      </div>
      <span class="hint">
        {{ form.mode === 'fixed'
          ? 'Occurrences land on the calendar regardless of when the last one was done (bins, rent).'
          : 'The next one is due a period after the last one was actually done (haircut, descaling).' }}
      </span>
    </div>

    <div class="grid-2">
      <div class="field">
        <label for="c-time">At (optional)</label>
        <input id="c-time" v-model="form.due_time" type="time" class="input">
      </div>
      <div class="field">
        <label for="c-end">Until (optional)</label>
        <input id="c-end" v-model="form.end_date" type="date" class="input" :min="form.start_date">
      </div>
    </div>

    <template v-if="!isPersonal">
      <div class="field">
        <span class="label">Who does it</span>
        <div class="segmented" role="group">
          <button v-for="s in strategies" :key="s" type="button" :aria-pressed="form.strategy === s"
            @click="form.strategy = s">
            {{ STRATEGY_LABELS[s] }}
          </button>
        </div>
        <span class="hint">{{ strategyHelp[form.strategy] }}</span>
      </div>

      <div v-if="form.strategy !== 'unassigned'" class="card flush">
        <ul class="list">
          <li v-for="m in orderedMembers" :key="m.user_id" class="list-row">
            <input type="checkbox" :checked="inRotation(m.user_id)" :aria-label="`Include ${m.profile.display_name}`"
              @change="toggleMember(m.user_id)">
            <span v-if="inRotation(m.user_id)" class="count">{{ form.rotation.indexOf(m.user_id) + 1 }}</span>
            <UserAvatar :user-id="m.user_id" :size="24" />
            <span class="grow truncate">{{ displayName(m.user_id) }}</span>
            <template v-if="inRotation(m.user_id) && form.strategy !== 'balanced'">
              <button type="button" class="btn btn-ghost btn-sm" aria-label="Earlier" @click="move(m.user_id, -1)">↑</button>
              <button type="button" class="btn btn-ghost btn-sm" aria-label="Later" @click="move(m.user_id, 1)">↓</button>
            </template>
          </li>
        </ul>
      </div>
    </template>

    <div class="grid-2">
      <div class="field">
        <span class="label">Priority</span>
        <PrioritySelect v-model="form.priority" />
      </div>
      <div v-if="!isPersonal" class="field">
        <span class="label">Effort</span>
        <EffortSelect v-model="form.effort" />
      </div>
    </div>

    <div class="field">
      <label for="c-desc">Notes</label>
      <textarea id="c-desc" v-model="form.description" class="textarea" placeholder="How to do it, where the bags are…" />
    </div>

    <div class="card preview">
      <div class="row between">
        <strong>{{ summary }}</strong>
        <label v-if="chore" class="row" style="--gap:.35rem"><input v-model="form.active" type="checkbox"> Active</label>
      </div>
      <ul class="list">
        <li v-for="o in preview" :key="o.date" class="row between">
          <span>{{ humanDate(o.date) }}<template v-if="form.due_time"> · {{ form.due_time }}</template></span>
          <span v-if="!isPersonal" class="row" style="--gap:.4rem">
            <template v-if="o.who === 'balanced'"><span class="muted">least busy</span></template>
            <template v-else>
              <UserAvatar :user-id="o.who" :size="20" /><span class="muted">{{ displayName(o.who) }}</span>
            </template>
          </span>
        </li>
        <li v-if="!preview.length" class="muted">No upcoming occurrences with these settings.</li>
      </ul>
      <p v-if="form.mode === 'after_completion'" class="hint" style="margin:0">
        Dates after the first assume it gets done on the day it's due.
      </p>
    </div>

    <div class="modal-foot">
      <button v-if="chore" type="button" class="btn btn-danger" style="margin-right:auto" @click="remove">
        <AppIcon name="trash" :size="16" /> Delete
      </button>
      <button type="button" class="btn" @click="emit('done')">Cancel</button>
      <button class="btn btn-primary" :disabled="saving || !form.title.trim()">{{ chore ? 'Save chore' : 'Create chore' }}</button>
    </div>
  </form>
</template>

<style scoped>
.preview { background: var(--surface-2); box-shadow: none; }
.preview .list li { padding: .35rem 0; }
</style>
