<script setup lang="ts">
import type { ISODate } from '#shared/types/schema'
import { addDays, endOfMonth, humanDate, startOfMonth, startOfWeek, todayISO } from '#shared/utils/dates'
import { compareTasks } from '#shared/utils/grouping'

useHead({ title: 'Calendar · Household Hero' })

const userId = useUserId()
const tasks = useTasks()
const editor = useEditor()
const toast = useToast()

const month = ref(startOfMonth(todayISO()))
const selected = ref<ISODate>(todayISO())
const scope = ref<'mine' | 'all'>('mine')

async function load() {
  try {
    await tasks.fetchRange(startOfWeek(month.value), addDays(endOfMonth(month.value), 7))
  } catch (e) { toast.error(e) }
}
watch(month, load, { immediate: true })

const scoped = computed(() => tasks.all.value.filter(t => scope.value === 'all' || t.assignee_id === userId.value))
const dayTasks = computed(() => scoped.value.filter(t => t.due_date === selected.value).sort(compareTasks))

function pick(d: ISODate) {
  selected.value = d
  if (d < startOfMonth(month.value) || d > endOfMonth(month.value)) month.value = startOfMonth(d)
}
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Calendar</h1>
        <p>See what's coming and plan around it.</p>
      </div>
      <div class="segmented" role="group">
        <button :aria-pressed="scope === 'mine'" @click="scope = 'mine'">Mine</button>
        <button :aria-pressed="scope === 'all'" @click="scope = 'all'">Everything</button>
      </div>
    </header>

    <div class="layout">
      <MonthCalendar :month="month" :selected="selected" :tasks="scoped" @select="pick" @month="m => (month = m)" />

      <section>
        <div class="row between" style="margin-bottom:.6rem">
          <h2 style="margin:0">{{ humanDate(selected) }}</h2>
          <button class="btn btn-sm" @click="editor.newTask({ due_date: selected })">
            <AppIcon name="plus" :size="14" /> Add
          </button>
        </div>
        <div v-if="dayTasks.length" class="card flush">
          <TaskItem v-for="t in dayTasks" :key="t.id" :task="t" show-space :show-date="false" />
        </div>
        <div v-else class="empty">Nothing on this day.</div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: minmax(280px, 420px) 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
</style>
