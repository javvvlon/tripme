import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { AppBootstrap } from './src/shared/bootstrap/service'
import { modules as appModules } from './src/modules'
import { LOCALES } from './src/shared/config/locales'

const bootstrap = new AppBootstrap(appModules).bootSync()

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

const revalidateSecret = process.env.NUXT_REVALIDATE_SECRET || ''

const bypassToken = revalidateSecret
  ? createHash('sha256').update(revalidateSecret).digest('hex').slice(0, 32)
  : ''

const routeRules: Record<string, Record<string, unknown>> = {}

for (const route of bootstrap.routes) {
  const suffix = route.path === '/' ? '' : route.path

  if (route.prerender) {
    for (const locale of LOCALES) routeRules[`/${locale}${suffix}`] = { prerender: true }
  }

  if (route.swr) {
    for (const locale of LOCALES) routeRules[`/${locale}${suffix}`] = { swr: route.swr, isr: route.swr }
  }

  if (route.ssr === false) {
    for (const locale of LOCALES) routeRules[`/${locale}${suffix}/**`] = { ssr: false }
  }
}

for (const locale of LOCALES) routeRules[`/${locale}/app`] = { redirect: `/${locale}/app/leads` }

export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },

  srcDir: 'src/',

  pages: true,

  ssr: true,
  routeRules,

  nitro: {
    vercel: {
      config: { bypassToken },
    },

    prerender: {
      crawlLinks: false,
    },
  },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    restructureDir: 'src/shared/i18n',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://tripme.uz',
    langDir: 'locales',
    defaultLocale: 'ru',
    strategy: 'prefix',
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'uz', language: 'uz-UZ', name: 'O‘zbekcha', file: 'uz.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tm_locale',
      redirectOn: 'root',
    },
  },

  components: [
    { path: '~/shared/components', pathPrefix: false, priority: 10 },
  ],

  imports: {
    dirs: ['shared/composables', 'shared/utils', 'shared/helpers', 'shared/config'],
  },

  css: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/inter/700.css',
    '@fontsource/inter/800.css',
    '~/shared/styles/main.scss',
  ],

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0B4FD4' },
      ],
    },
  },

  runtimeConfig: {
    revalidateSecret,
    vercelBypassToken: bypassToken,

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.tripme.uz/api/v1',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://tripme.uz',
    },
  },

  hooks: {
    'pages:extend': (pages) => {
      const build = (route: typeof bootstrap.routes[number]): NuxtPage => ({
        name: route.name,
        path: route.path,
        ...(route.file ? { file: `${srcDir}/${route.file}` } : {}),
        ...(route.redirect ? { redirect: route.redirect } : {}),
        meta: { ...(route.meta ?? {}), ...(route.layout !== undefined ? { layout: route.layout } : {}) },
        children: route.children?.map(build),
      })

      pages.push(...bootstrap.routes.map(build))
    },
  },
})

type NuxtPage = {
  name?: string
  path: string
  redirect?: string
  file?: string
  meta?: Record<string, unknown>
  children?: NuxtPage[]
}
