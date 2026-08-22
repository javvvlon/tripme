// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },

  // ── §3.4 hybrid rendering ──────────────────────────────────────────
  // The landing and the CRM want opposite things, so they get opposite
  // rendering modes from one codebase.
  ssr: true,
  routeRules: {
    '/':          { prerender: true },   // static HTML at build time, no server in the request path
    '/agents/**': { prerender: true },   // marketing sub-pages
    '/app/**':    { ssr: false },        // CRM behind login — pure SPA, nothing to index

    // When the landing starts showing live prices, this one line becomes
    //   '/': { swr: 600 }
    // and nothing else in the project changes. That is the whole point of
    // keeping the data behind a composable (see app/composables/useHotOffers.ts).
  },

  nitro: {
    // §3.3 — the API must run on a long-lived Node process, never an edge
    // or serverless runtime, because an SSE search holds a connection for ~20s.
    preset: 'node-server',
  },

  // Self-hosted rather than Google Fonts: one less third-party request,
  // faster first paint on Uzbek connections, and no external dependency
  // for a page that must work when fonts.googleapis.com is slow or blocked.
  css: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/inter/700.css',
    '@fontsource/inter/800.css',
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0E1116' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      // tripme_api lives on a sibling subdomain so session cookies can be
      // scoped to .tripme.uz — see §3.5.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.tripme.uz/api/v1',
    },
  },
})
