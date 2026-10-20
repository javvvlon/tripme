import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const AI_PATH = '/app/ai'

export const routes: IModuleRoute[] = [
  {
    name: 'cms-ai',
    path: AI_PATH,
    file: 'modules/ai/views/tripmeAi/TripmeAi.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth', wide: true },
  },
  {
    name: 'cms-marketing-assistant',
    path: '/app/marketing/ai',
    file: 'modules/ai/views/tripmeAi/TripmeAi.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth', wide: true },
  },
  {
    name: 'cms-site-assistant',
    path: '/app/content/ai',
    file: 'modules/ai/views/tripmeAi/TripmeAi.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth', wide: true },
  },
]
