<template>
  <div class="bare">
    <div class="bare-inner">
      <NuxtLink to="/" class="brand"><img src="/favicon.svg" alt="">Household Hero</NuxtLink>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bare { min-height: 100dvh; display: grid; place-items: center; padding: 1.5rem 1rem; }
.bare-inner { width: min(420px, 100%); }
.brand { justify-content: center; font-size: 1.5rem; padding-bottom: 1.5rem; }
.brand img { width: 36px; height: 36px; }
</style>
