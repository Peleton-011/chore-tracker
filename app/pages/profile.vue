<script setup lang="ts">
useHead({ title: 'Me · Household Hero' })

const db = useDb()
const userId = useUserId()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { profile, fetchMembers, personalSpace } = useSpaces()
const app = useAppData()
const toast = useToast()
const router = useRouter()

const name = ref(profile(userId.value)?.display_name ?? '')
watch(() => profile(userId.value)?.display_name, (n) => { if (n && !name.value) name.value = n })
const saving = ref(false)

async function save() {
  if (!userId.value) return
  saving.value = true
  const { error } = await db.from('profiles').update({ display_name: name.value.trim() || null }).eq('id', userId.value)
  saving.value = false
  if (error) return toast.error(error)
  await fetchMembers()
  toast.info('Saved')
}

async function signOut() {
  app.reset()
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div style="max-width:560px">
    <header class="page-head">
      <div class="row" style="--gap:1rem">
        <UserAvatar :user-id="userId" :size="56" />
        <div>
          <h1 style="margin:0">{{ profile(userId)?.display_name || 'You' }}</h1>
          <p>{{ user?.email }}</p>
        </div>
      </div>
    </header>

    <form class="card stack" @submit.prevent="save">
      <div class="field">
        <label for="p-name">Display name</label>
        <input id="p-name" v-model="name" class="input" maxlength="60" placeholder="How your household sees you">
      </div>
      <div><button class="btn btn-primary" :disabled="saving">Save</button></div>
    </form>

    <div class="card stack">
      <h2>Personal space</h2>
      <p class="muted">Your private tasks and chores live here — nobody else can see them.</p>
      <div><NuxtLink v-if="personalSpace" :to="`/spaces/${personalSpace.id}?tab=chores`" class="btn">Open personal chores</NuxtLink></div>
    </div>

    <div class="card">
      <button class="btn btn-danger" @click="signOut"><AppIcon name="logout" :size="16" /> Sign out</button>
    </div>
  </div>
</template>
