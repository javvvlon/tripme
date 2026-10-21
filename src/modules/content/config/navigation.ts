import type { INavNode } from '../../../shared/helpers/navigation'
import { MARKETING_ROLES } from '../../marketing/contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const AI_NODE: INavNode = { key: 'ai', labelKey: 'cms.nav.tripmeAi', icon: 'sparkle', to: '/app/ai', ai: true }

export const OPEN_GROUPS = ['work']

export const CMS_NAVIGATION: INavNode[] = [
  {
    key: 'work',
    labelKey: 'cms.nav.groups.work',
    children: [
      { key: 'my-work', labelKey: 'cms.nav.work', icon: 'inbox', to: '/app/work' },
      { key: 'tasks', labelKey: 'cms.nav.tasks', icon: 'columns', to: '/app/tasks' },
      { key: 'analytics', labelKey: 'cms.nav.analytics', icon: 'pie', to: '/app/analytics' },
      {
        key: 'leads', labelKey: 'cms.nav.leads', icon: 'users', to: '/app/leads',
        children: [{ key: 'leads.archive', labelKey: 'cms.nav.archive', to: '/app/leads', query: { archived: '1' } }],
      },
      {
        key: 'orders', labelKey: 'cms.nav.orders', icon: 'briefcase', to: '/app/orders',
        children: [{ key: 'orders.archive', labelKey: 'cms.nav.archive', to: '/app/orders', query: { archived: '1' } }],
      },
      { key: 'messages', labelKey: 'cms.nav.messages', icon: 'mail', to: '/app/messages' },
      { key: 'esim', labelKey: 'cms.nav.esim', icon: 'sim', to: '/app/esim' },
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
      { key: 'content.media', labelKey: 'cms.nav.media', icon: 'image', to: '/app/content/media' },
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
  {
    key: 'marketing',
    labelKey: 'cms.nav.groups.marketing',
    roles: MARKETING_ROLES,
    children: [
      { key: 'marketing.selections', labelKey: 'cms.nav.selections', icon: 'megaphone', to: '/app/marketing' },
    ],
  },
  {
    key: 'admin',
    labelKey: 'cms.nav.groups.admin',
    icon: 'shield',
    admin: true,
    children: [
      { key: 'team', labelKey: 'cms.nav.team', to: '/app/team' },
    ],
  },
]
