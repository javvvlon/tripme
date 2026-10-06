import type { INavNode } from '../../../shared/helpers/navigation'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CMS_NAVIGATION: INavNode[] = [
  {
    key: 'analytics',
    labelKey: 'cms.nav.analytics',
    icon: 'pie',
    to: '/app/analytics',
  },
  {
    key: 'leads',
    labelKey: 'cms.nav.leads',
    icon: 'users',
    to: '/app/leads',
  },
  {
    key: 'orders',
    labelKey: 'cms.nav.orders',
    icon: 'briefcase',
    to: '/app/orders',
  },
  {
    key: 'operators',
    labelKey: 'cms.nav.operators',
    icon: 'globe',
    to: '/app/operators',
  },
  {
    key: 'points',
    labelKey: 'cms.nav.points',
    icon: 'medal',
    to: '/app/points',
  },
  {
    key: 'content',
    labelKey: 'cms.nav.content',
    icon: 'folder',
    children: [
      { key: 'content.sections', labelKey: 'cms.nav.sections', to: '/app/content/sections' },
      { key: 'content.blog', labelKey: 'cms.nav.blogPage', to: '/app/content/blog' },
      { key: 'content.posts', labelKey: 'cms.nav.posts', to: '/app/posts' },
      { key: 'content.lists', labelKey: 'cms.nav.lists', to: '/app/content/lists' },
    ],
  },
]
