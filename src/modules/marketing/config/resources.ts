import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Marketing',
  prefix: '',
  resources: {
    shared: { url: 'marketing/p/:code', method: 'GET' },
    list: { url: 'cms/marketing/selections', method: 'GET', params: ['page', 'per_page', 'q', 'archived'] },
    create: { url: 'cms/marketing/selections', method: 'POST' },
    one: { url: 'cms/marketing/selections/:id', method: 'GET' },
    patch: { url: 'cms/marketing/selections/:id', method: 'PATCH' },
    recheck: { url: 'cms/marketing/selections/:id/recheck', method: 'POST' },
    write: { url: 'cms/marketing/selections/:id/copy', method: 'POST' },
    paint: { url: 'cms/marketing/selections/:id/background', method: 'POST' },
    background: { url: 'cms/marketing/selections/:id/background', method: 'PATCH' },
    archive: { url: 'cms/marketing/selections/:id/archive', method: 'POST' },
    restore: { url: 'cms/marketing/selections/:id/restore', method: 'POST' },
    publish: { url: 'cms/marketing/selections/:id/publish', method: 'POST' },
    designTemplates: { url: 'cms/marketing/selections/:id/templates', method: 'POST' },
    templates: { url: 'cms/marketing/templates', method: 'GET' },
    saveTemplate: { url: 'cms/marketing/templates', method: 'POST' },
    archiveTemplate: { url: 'cms/marketing/templates/:id/archive', method: 'POST' },
    settings: { url: 'cms/marketing/settings', method: 'GET' },
    saveSettings: { url: 'cms/marketing/settings', method: 'PUT' },
    bot: { url: 'cms/marketing/bot', method: 'GET' },
    botLink: { url: 'cms/marketing/bot/link', method: 'POST' },
    botUnlink: { url: 'cms/marketing/bot/unlink', method: 'POST' },
  },
}
