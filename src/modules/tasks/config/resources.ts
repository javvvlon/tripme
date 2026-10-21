import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Tasks',
  prefix: 'cms',
  resources: {
    list: { url: 'tasks', method: 'GET' },
    summary: { url: 'tasks/summary', method: 'GET' },
    one: { url: 'tasks/:id', method: 'GET' },
    create: { url: 'tasks', method: 'POST' },
    update: { url: 'tasks/:id', method: 'PATCH' },
    comment: { url: 'tasks/:id/comments', method: 'POST' },
    archive: { url: 'tasks/:id/archive', method: 'POST' },
    restore: { url: 'tasks/:id/restore', method: 'POST' },
  },
}
