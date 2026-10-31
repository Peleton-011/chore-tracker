<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()
const router = useRouter()
const failed = ref(false)

watch(user, (u) => { if (u) router.replace(redirect.pluck() || '/') }, { immediate: true })
onMounted(() => setTimeout(() => { if (!user.value) failed.value = true }, 6000))
</script>

<template>
  <div class="card stack" style="padding:1.5rem">
    <template v-if="!failed">
      <h1 style="font-size:1.4rem">Signing you in…</h1>
      <p class="muted">One moment.</p>
    </template>
    <template v-else>
      <h1 style="font-size:1.4rem">That link didn't work</h1>
      <p class="muted">It may have expired or already been used.</p>
      <NuxtLink to="/login" class="btn btn-primary">Back to sign in</NuxtLink>
    </template>
  </div>
</template>
