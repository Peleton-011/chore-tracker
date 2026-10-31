<script setup lang="ts">
useHead({ title: 'Households · Household Hero' })

const { households, membersOf, createSpace } = useSpaces()
const tasks = useTasks()
const toast = useToast()
const router = useRouter()

const COLORS = ['#5b4bdb', '#d0457a', '#e07a12', '#15935a', '#2f7fd8', '#0f766e']
const creating = ref(false)
const form = reactive({ name: '', description: '', color: COLORS[0]! })
const saving = ref(false)

async function create() {
  saving.value = true
  try {
    const space = await createSpace({ name: form.name.trim(), description: form.description.trim(), color: form.color })
    creating.value = false
    form.name = ''
    form.description = ''
    router.push(`/spaces/${space.id}`)
  } catch (e) {
    toast.error(e)
  } finally {
    saving.value = false
  }
}

const openCount = (id: string) => tasks.open.value.filter(t => t.space_id === id).length
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Households</h1>
        <p>Shared spaces with shared chores. Invite people with a link.</p>
      </div>
      <button class="btn btn-primary" @click="creating = true"><AppIcon name="plus" :size="18" /> New household</button>
    </header>

    <div v-if="households.length" class="grid-2">
      <NuxtLink v-for="s in households" :key="s.id" :to="`/spaces/${s.id}`" class="card space">
        <div class="row" style="--gap:.75rem">
          <span class="swatch" :style="{ background: s.color || 'var(--accent)' }"><AppIcon name="home" :size="18" /></span>
          <div class="grow">
            <strong class="truncate" style="display:block">{{ s.name }}</strong>
            <span class="muted">{{ s.role === 'member' ? 'Member' : s.role === 'owner' ? 'Owner' : 'Admin' }}</span>
          </div>
        </div>
        <p v-if="s.description" class="muted desc">{{ s.description }}</p>
        <div class="row between">
          <div class="avatars">
            <UserAvatar v-for="m in membersOf(s.id).slice(0, 6)" :key="m.user_id" :user-id="m.user_id" :size="26" />
          </div>
          <span class="chip">{{ openCount(s.id) }} open</span>
        </div>
      </NuxtLink>
    </div>
    <div v-else class="empty">
      <strong>No households yet</strong>
      Create one for your flat, family or team — or open an invite link someone sent you.
    </div>

    <AppModal :open="creating" title="New household" @close="creating = false">
      <form class="stack" style="--gap:1rem" @submit.prevent="create">
        <div class="field">
          <label for="h-name">Name</label>
          <input id="h-name" v-model="form.name" class="input" required maxlength="80" placeholder="e.g. Calle Mayor 12" autofocus>
        </div>
        <div class="field">
          <label for="h-desc">Description</label>
          <textarea id="h-desc" v-model="form.description" class="textarea" placeholder="Optional" />
        </div>
        <div class="field">
          <span class="label">Colour</span>
          <div class="row">
            <button v-for="c in COLORS" :key="c" type="button" class="color" :style="{ background: c }"
              :aria-pressed="form.color === c" :aria-label="c" @click="form.color = c" />
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn" @click="creating = false">Cancel</button>
          <button class="btn btn-primary" :disabled="saving || !form.name.trim()">Create</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
.space { color: var(--text); display: flex; flex-direction: column; gap: .75rem; text-decoration: none; transition: transform .1s; }
.space:hover { text-decoration: none; transform: translateY(-2px); }
.swatch { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; color: #fff; flex: none; }
.desc { margin: 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.color { width: 30px; height: 30px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; }
.color[aria-pressed="true"] { border-color: var(--text); }
</style>
