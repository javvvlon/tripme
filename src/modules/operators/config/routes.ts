import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-operators',
    path: '/app/operators',
    file: 'modules/operators/views/operators/Operators.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
