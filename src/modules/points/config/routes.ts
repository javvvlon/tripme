import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-points',
    path: '/app/points',
    file: 'modules/points/views/points/Points.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
