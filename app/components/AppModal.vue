<script setup lang="ts">
const props = defineProps<{ open: boolean; title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @mousedown.self="emit('close')">
      <div class="modal" :style="wide ? { width: 'min(680px, 100%)' } : undefined" role="dialog" aria-modal="true"
        :aria-label="title">
        <div class="modal-head">
          <h2>{{ title }}</h2>
          <button class="btn btn-ghost btn-icon" aria-label="Close" @click="emit('close')">
            <AppIcon name="x" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
