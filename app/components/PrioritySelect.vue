<script setup lang="ts">
import { PRIORITY_LABELS, type Priority } from '#shared/types/schema'
const model = defineModel<Priority>({ required: true })
const levels: Priority[] = [0, 1, 2, 3, 4]
</script>

<template>
  <div class="segmented" role="group" aria-label="Priority">
    <button v-for="p in levels" :key="p" type="button" :aria-pressed="model === p" @click="model = p">
      {{ p === 0 ? 'None' : PRIORITY_LABELS[p] }}
    </button>
  </div>
</template>
