import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'auth-login',
    path: '/auth',
    file: 'modules/auth/views/auth/Auth.vue',
    layout: 'blank',
    ssr: false,
    meta: { middleware: 'guest' },
  },
]
