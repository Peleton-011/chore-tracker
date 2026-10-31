<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.kind">
      <span>{{ t.message }}</span>
      <button v-if="t.action" @click="t.action.run(); dismiss(t.id)">{{ t.action.label }}</button>
    </div>
  </div>
</template>
