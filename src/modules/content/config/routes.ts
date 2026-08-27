import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-home-banner',
    path: '/app/content/banner',
    file: 'modules/content/views/banner/Banner.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-home-sections',
    path: '/app/content/sections',
    file: 'modules/content/views/sections/Sections.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-lists',
    path: '/app/content/lists',
    file: 'modules/content/views/lists/Lists.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-list-edit',
    path: '/app/content/lists/:id',
    file: 'modules/content/views/listEditor/ListEditor.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
