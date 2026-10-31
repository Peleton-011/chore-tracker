<script setup lang="ts">
import type { Task } from '#shared/types/schema'
import { groupTasks } from '#shared/utils/grouping'
import { todayISO } from '#shared/utils/dates'

const props = defineProps<{ tasks: Task[]; showSpace?: boolean; emptyTitle?: string; emptyText?: string }>()
const groups = computed(() => groupTasks(props.tasks, todayISO()))
</script>

<template>
  <div v-if="groups.length" class="stack" style="--gap:1.25rem">
    <section v-for="g in groups" :key="g.key">
      <h2 :class="{ late: g.key === 'overdue' }">{{ g.title }} <span class="count">{{ g.tasks.length }}</span></h2>
      <div class="card flush">
        <TaskItem v-for="t in g.tasks" :key="t.id" :task="t" :show-space="showSpace"
          :show-date="!['today', 'tomorrow'].includes(g.key)" />
      </div>
    </section>
  </div>
  <div v-else class="empty">
    <strong>{{ emptyTitle ?? 'Nothing here' }}</strong>
    {{ emptyText ?? 'Enjoy the free time.' }}
  </div>
</template>

<style scoped>
h2 { font-size: 1rem; }
.late { color: var(--danger); }
</style>
