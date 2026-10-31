<script setup lang="ts">
const props = defineProps<{ userId: string | null; size?: number; title?: boolean }>()
const { profile, displayName } = useSpaces()

const PALETTE = ['#5b4bdb', '#d0457a', '#e07a12', '#15935a', '#2f7fd8', '#8a4fd8', '#c2410c', '#0f766e']
const p = computed(() => profile(props.userId))
const name = computed(() => displayName(props.userId, { you: false }))
const initials = computed(() => name.value.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase())
const color = computed(() => {
  const id = props.userId ?? ''
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
})
</script>

<template>
  <span v-if="!userId" class="avatar avatar-none" :style="{ '--size': `${size ?? 28}px` }" title="Up for grabs">?</span>
  <span v-else class="avatar" :style="{ '--size': `${size ?? 28}px`, background: color }"
    :title="title === false ? undefined : name">
    <img v-if="p?.avatar_url" :src="p.avatar_url" :alt="name">
    <template v-else>{{ initials }}</template>
  </span>
</template>
