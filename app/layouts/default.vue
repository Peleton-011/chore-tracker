<script setup lang="ts">
const userId = useUserId()
const app = useAppData()
const editor = useEditor()
const trades = useTrades()
const tasks = useTasks()
const route = useRoute()

watch(userId, (id) => { if (id) app.ensureLoaded() }, { immediate: true })

const nav = computed(() => [
  { to: '/', label: 'Today', icon: 'today' as const, badge: tasks.overdueCount.value },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' as const, badge: 0 },
  { to: '/spaces', label: 'Households', icon: 'home' as const, badge: 0 },
  { to: '/trades', label: 'Trades', icon: 'swap' as const, badge: trades.incoming.value.length },
  { to: '/profile', label: 'Me', icon: 'user' as const, badge: 0 },
])
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const spaceFromRoute = computed(() => (route.path.startsWith('/spaces/') ? String(route.params.id) : undefined))
</script>

<template>
  <div class="shell">
    <nav class="sidenav" aria-label="Main">
      <NuxtLink to="/" class="brand"><img src="/favicon.svg" alt="">Household Hero</NuxtLink>
      <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="navlink" :class="{ active: isActive(n.to) }">
        <AppIcon :name="n.icon" /> {{ n.label }}
        <span v-if="n.badge" class="dot">{{ n.badge }}</span>
      </NuxtLink>
      <div class="spacer" />
      <button class="btn btn-primary btn-block" @click="editor.newTask({ space_id: spaceFromRoute })">
        <AppIcon name="plus" :size="18" /> New task
      </button>
    </nav>

    <main class="main">
      <div v-if="!app.ready.value && app.loading.value" class="empty">Loading your chores…</div>
      <slot v-else />
    </main>

    <nav class="tabbar" aria-label="Main">
      <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="navlink" :class="{ active: isActive(n.to) }">
        <AppIcon :name="n.icon" /> {{ n.label }}
        <span v-if="n.badge" class="dot">{{ n.badge }}</span>
      </NuxtLink>
    </nav>
    <button class="fab only-mobile" aria-label="New task" @click="editor.newTask({ space_id: spaceFromRoute })">
      <AppIcon name="plus" />
    </button>

    <AppModal :open="editor.task.value.open" :title="editor.task.value.task ? 'Edit task' : 'New task'"
      @close="editor.task.value.open = false">
      <TaskForm v-if="editor.task.value.open" :key="editor.task.value.task?.id ?? 'new'" :task="editor.task.value.task"
        :defaults="editor.task.value.defaults" @done="editor.task.value.open = false" />
    </AppModal>

    <AppModal :open="editor.chore.value.open" :title="editor.chore.value.chore ? 'Edit chore' : 'New chore'" wide
      @close="editor.chore.value.open = false">
      <ChoreForm v-if="editor.chore.value.open" :key="editor.chore.value.chore?.id ?? 'new'"
        :chore="editor.chore.value.chore" :space-id="editor.chore.value.spaceId" :draft="editor.chore.value.draft"
        @done="editor.chore.value.open = false" />
    </AppModal>

    <AppModal :open="editor.trade.value.open" title="Trade or hand over" @close="editor.trade.value.open = false">
      <TradeDialog v-if="editor.trade.value.open && editor.trade.value.task" :task="editor.trade.value.task"
        @done="editor.trade.value.open = false" />
    </AppModal>
  </div>
</template>

<style scoped>
@media (min-width: 821px) { .only-mobile { display: none; } }
</style>
