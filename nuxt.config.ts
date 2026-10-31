// Household Hero — chores module. SPA on purpose: every screen is behind a
// login and all data comes straight from Supabase (RLS does the authorising),
// so server rendering would buy nothing but complexity. `nuxt generate`
// produces a static bundle that can be hosted anywhere.
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: false,
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  supabase: {
    // Database types are hand-written in shared/types/database.ts
    types: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm'],
      saveRedirectToCookie: true,
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Household Hero',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Shared chores that sort themselves out: rotations, fair balancing and trades.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#5b4bdb' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap' },
      ],
    },
  },

  typescript: { strict: true },
})
