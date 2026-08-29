import type { INavNode } from '../../../shared/helpers/navigation'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CMS_NAVIGATION: INavNode[] = [
  {
    key: 'leads',
    labelKey: 'cms.nav.leads',
    icon: 'users',
    to: '/app/leads',
  },
  {
    key: 'content',
    labelKey: 'cms.nav.content',
    icon: 'folder',
    children: [
      { key: 'content.banner', labelKey: 'cms.nav.banner', to: '/app/content/banner' },
      { key: 'content.sections', labelKey: 'cms.nav.sections', to: '/app/content/sections' },
      { key: 'content.posts', labelKey: 'cms.nav.posts', to: '/app/posts' },
      { key: 'content.lists', labelKey: 'cms.nav.lists', to: '/app/content/lists' },
    ],
  },
]
