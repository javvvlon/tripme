import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'dashboard-home',
    path: '/app',
    file: 'modules/dashboard/views/dashboard/Dashboard.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
