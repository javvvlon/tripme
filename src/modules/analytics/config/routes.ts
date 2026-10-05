import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-analytics',
    path: '/app/analytics',
    file: 'modules/analytics/views/analytics/Analytics.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
