<script setup lang="ts">
const props = defineProps<{ spaceId: string }>()
const { spaceById } = useSpaces()
const space = computed(() => spaceById(props.spaceId))
</script>

<template>
  <span v-if="space" class="chip" :title="space.name">
    <span class="dot" :style="{ background: space.color || 'var(--text-muted)' }" />
    {{ space.kind === 'personal' ? 'Personal' : space.name }}
  </span>
</template>

<style scoped>
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
</style>
