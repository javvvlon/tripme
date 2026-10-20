import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'marketing-shared',
    path: '/p/:code([a-z0-9]{7})',
    file: 'modules/marketing/views/sharedSelection/SharedSelection.vue',
    meta: { header: 'solid' },
  },
  {
    name: 'cms-marketing',
    path: '/app/marketing',
    file: 'modules/marketing/views/selections/Selections.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-marketing-selection',
    path: '/app/marketing/:id',
    file: 'modules/marketing/views/selection/Selection.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
