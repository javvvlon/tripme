import type { INavNode } from '../../../shared/helpers/navigation'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CMS_NAVIGATION: INavNode[] = [
  {
    key: 'work',
    labelKey: 'cms.nav.groups.work',
    children: [
      { key: 'analytics', labelKey: 'cms.nav.analytics', icon: 'pie', to: '/app/analytics' },
      { key: 'leads', labelKey: 'cms.nav.leads', icon: 'users', to: '/app/leads' },
      { key: 'orders', labelKey: 'cms.nav.orders', icon: 'briefcase', to: '/app/orders' },
    ],
  },
  {
    key: 'site',
    labelKey: 'cms.nav.groups.site',
    children: [
      { key: 'content.sections', labelKey: 'cms.nav.sections', icon: 'home', to: '/app/content/sections' },
      { key: 'content.blog', labelKey: 'cms.nav.blogPage', icon: 'doc', to: '/app/content/blog' },
      { key: 'content.posts', labelKey: 'cms.nav.posts', icon: 'pencil', to: '/app/posts' },
      { key: 'content.lists', labelKey: 'cms.nav.lists', icon: 'list', to: '/app/content/lists' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'cms.nav.groups.settings',
    children: [
      { key: 'operators', labelKey: 'cms.nav.operators', icon: 'globe', to: '/app/operators' },
      { key: 'points', labelKey: 'cms.nav.points', icon: 'medal', to: '/app/points' },
    ],
  },
]
