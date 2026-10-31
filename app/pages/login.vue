<script setup lang="ts">
definePageMeta({ layout: 'bare' })
useHead({ title: 'Sign in · Household Hero' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()
const router = useRouter()

const mode = ref<'signin' | 'signup' | 'magic'>('signin')
const email = ref('')
const password = ref('')
const name = ref('')
const busy = ref(false)
const error = ref('')
const notice = ref('')

watch(user, (u) => { if (u) router.replace(redirect.pluck() || '/') }, { immediate: true })

async function submit() {
  busy.value = true
  error.value = ''
  notice.value = ''
  const emailRedirectTo = `${window.location.origin}/confirm`
  try {
    if (mode.value === 'signin') {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (e) throw e
    } else if (mode.value === 'signup') {
      const { data, error: e } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: { data: { display_name: name.value.trim() }, emailRedirectTo },
      })
      if (e) throw e
      if (!data.session) notice.value = 'Check your inbox to confirm your email, then come back.'
    } else {
      const { error: e } = await supabase.auth.signInWithOtp({ email: email.value, options: { emailRedirectTo } })
      if (e) throw e
      notice.value = 'We sent you a sign-in link. Open it on this device.'
    }
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="card stack" style="--gap:1rem; padding:1.5rem">
    <div>
      <h1 style="font-size:1.6rem">{{ mode === 'signup' ? 'Create your account' : 'Welcome back' }}</h1>
      <p class="muted" style="margin:0">Shared chores that sort themselves out.</p>
    </div>

    <div class="segmented" role="group">
      <button :aria-pressed="mode === 'signin'" @click="mode = 'signin'">Sign in</button>
      <button :aria-pressed="mode === 'signup'" @click="mode = 'signup'">Sign up</button>
      <button :aria-pressed="mode === 'magic'" @click="mode = 'magic'">Email link</button>
    </div>

    <form class="stack" @submit.prevent="submit">
      <div v-if="mode === 'signup'" class="field">
        <label for="l-name">Your name</label>
        <input id="l-name" v-model="name" class="input" autocomplete="name" maxlength="60" required>
      </div>
      <div class="field">
        <label for="l-email">Email</label>
        <input id="l-email" v-model="email" type="email" class="input" autocomplete="email" required>
      </div>
      <div v-if="mode !== 'magic'" class="field">
        <label for="l-pass">Password</label>
        <input id="l-pass" v-model="password" type="password" class="input" minlength="8" required
          :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'">
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="notice" class="chip success" style="white-space:normal;padding:.5rem .75rem">{{ notice }}</p>
      <button class="btn btn-primary btn-block" :disabled="busy">
        {{ mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send me a link' }}
      </button>
    </form>
  </div>
</template>
