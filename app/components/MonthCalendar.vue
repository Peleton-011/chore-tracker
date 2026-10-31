<script setup lang="ts">
import type { ISODate, Task } from '#shared/types/schema'
import { addDays, addMonths, endOfMonth, monthLong, startOfMonth, startOfWeek, todayISO, ymd } from '#shared/utils/dates'

const props = defineProps<{ month: ISODate; selected: ISODate; tasks: Task[] }>()
const emit = defineEmits<{ select: [ISODate]; month: [ISODate] }>()

const title = computed(() => {
  const { year, month } = ymd(props.month)
  return `${monthLong(month)} ${year}`
})
const days = computed(() => {
  const first = startOfWeek(startOfMonth(props.month))
  const last = addDays(startOfWeek(endOfMonth(props.month)), 6)
  const out: ISODate[] = []
  for (let d = first; d <= last; d = addDays(d, 1)) out.push(d)
  return out
})
const byDay = computed(() => {
  const map = new Map<ISODate, { open: number; done: number; late: boolean }>()
  const today = todayISO()
  for (const t of props.tasks) {
    if (!t.due_date) continue
    const e = map.get(t.due_date) ?? { open: 0, done: 0, late: false }
    if (t.status === 'open') { e.open++; if (t.due_date < today) e.late = true } else e.done++
    map.set(t.due_date, e)
  }
  return map
})
const inMonth = (d: ISODate) => ymd(d).month === ymd(props.month).month
</script>

<template>
  <div class="cal card">
    <div class="row between head">
      <button class="btn btn-ghost btn-icon" aria-label="Previous month" @click="emit('month', addMonths(month, -1))">
        <AppIcon name="left" />
      </button>
      <strong>{{ title }}</strong>
      <button class="btn btn-ghost btn-icon" aria-label="Next month" @click="emit('month', addMonths(month, 1))">
        <AppIcon name="right" />
      </button>
    </div>
    <div class="grid">
      <span v-for="(w, i) in ['M', 'T', 'W', 'T', 'F', 'S', 'S']" :key="i" class="wd">{{ w }}</span>
      <button v-for="d in days" :key="d" class="day"
        :class="{ out: !inMonth(d), today: d === todayISO(), sel: d === selected }" @click="emit('select', d)">
        <span class="n">{{ ymd(d).day }}</span>
        <span v-if="byDay.get(d)" class="marks">
          <span v-if="byDay.get(d)!.open" class="mark" :class="{ late: byDay.get(d)!.late }">{{ byDay.get(d)!.open }}</span>
          <span v-else class="mark done">✓</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.head { margin-bottom: .5rem; }
.grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.wd { text-align: center; font-size: .75rem; font-weight: 600; color: var(--text-muted); padding: .25rem 0; }
.day {
  aspect-ratio: 1 / .9; border: 1px solid transparent; border-radius: 10px; background: var(--surface-2);
  font: inherit; color: var(--text); cursor: pointer; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 2px; padding: 0;
}
.day.out { opacity: .4; }
.day.today .n { color: var(--accent); font-weight: 800; }
.day.sel { border-color: var(--accent); background: var(--accent-soft); }
.n { font-size: .9rem; font-weight: 550; }
.mark { font-size: .65rem; font-weight: 700; border-radius: 99px; padding: 0 .4rem; background: var(--accent); color: var(--on-accent); }
.mark.late { background: var(--danger); }
.mark.done { background: transparent; color: var(--success); }
</style>
