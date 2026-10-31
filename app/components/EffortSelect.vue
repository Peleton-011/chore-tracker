<script setup lang="ts">
const model = defineModel<number>({ required: true })
const hints = ['', 'Quick (≈5 min)', 'Small (≈15 min)', 'Medium (≈30 min)', 'Big (≈1 h)', 'Huge (hours)']
</script>

<template>
  <div class="row wrap">
    <div class="segmented" role="group" aria-label="Effort">
      <button v-for="n in 5" :key="n" type="button" :aria-pressed="model === n" @click="model = n">{{ n }}</button>
    </div>
    <span class="hint">{{ hints[model] }}</span>
  </div>
</template>
