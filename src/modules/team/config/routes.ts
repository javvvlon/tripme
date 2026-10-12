import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-work',
    path: '/app/work',
    file: 'modules/team/views/work/Work.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-team',
    path: '/app/team',
    file: 'modules/team/views/team/Team.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-profile',
    path: '/app/profile',
    file: 'modules/team/views/profile/StaffProfile.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
