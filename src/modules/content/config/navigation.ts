import type { INavNode } from '../../../shared/helpers/navigation'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CMS_NAVIGATION: INavNode[] = [
  {
    key: 'dashboard',
    labelKey: 'cms.nav.dashboard',
    icon: 'pie',
    to: '/app',
  },
  {
    key: 'home',
    labelKey: 'cms.nav.home',
    icon: 'home',
    children: [
      { key: 'home.banner', labelKey: 'cms.nav.banner', to: '/app/content/banner' },
      { key: 'home.sections', labelKey: 'cms.nav.sections', to: '/app/content/sections' },
    ],
  },
  {
    key: 'lists',
    labelKey: 'cms.nav.lists',
    icon: 'list',
    to: '/app/content/lists',
  },
]
