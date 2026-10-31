<script setup lang="ts">
import type { InvitePreview } from '#shared/types/schema'

definePageMeta({ layout: 'bare' })
useHead({ title: 'Invitation · Household Hero' })

const route = useRoute()
const router = useRouter()
const db = useDb()
const app = useAppData()
const toast = useToast()
const token = String(route.params.token)

const preview = ref<InvitePreview | null>(null)
const loading = ref(true)
const joining = ref(false)

onMounted(async () => {
  const { data, error } = await db.rpc('invite_preview', { p_token: token })
  if (error) toast.error(error)
  preview.value = (data as InvitePreview[] | null)?.[0] ?? null
  loading.value = false
})

const REASONS: Record<string, string> = {
  not_found: "This invite link doesn't exist. Double-check it or ask for a new one.",
  revoked: 'This invite was revoked. Ask for a new link.',
  expired: 'This invite has expired. Ask for a new link.',
  used_up: 'This invite has been used up. Ask for a new link.',
}

async function join() {
  joining.value = true
  const { data, error } = await db.rpc('accept_invite', { p_token: token })
  if (error) {
    toast.error(error)
    joining.value = false
    return
  }
  await app.reload()
  router.push(`/spaces/${data}`)
}
</script>

<template>
  <div class="card stack" style="--gap:1rem; padding:1.5rem">
    <p v-if="loading" class="muted">Checking your invite…</p>
    <template v-else-if="preview && preview.valid && !preview.already_member">
      <h1 style="font-size:1.5rem">Join {{ preview.name }}</h1>
      <p v-if="preview.description" class="muted">{{ preview.description }}</p>
      <p>{{ preview.member_count }} {{ preview.member_count === 1 ? 'person is' : 'people are' }} already sharing chores here.</p>
      <button class="btn btn-primary btn-block" :disabled="joining" @click="join">Join household</button>
    </template>
    <template v-else-if="preview?.already_member">
      <h1 style="font-size:1.5rem">You're already in {{ preview.name }}</h1>
      <NuxtLink :to="`/spaces/${preview.space_id}`" class="btn btn-primary btn-block">Go there</NuxtLink>
    </template>
    <template v-else>
      <h1 style="font-size:1.5rem">Invite not valid</h1>
      <p class="muted">{{ REASONS[preview?.reason ?? 'not_found'] }}</p>
      <NuxtLink to="/" class="btn btn-block">Go home</NuxtLink>
    </template>
  </div>
</template>
