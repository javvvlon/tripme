import type { IResource } from '../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Landing',
  prefix: 'landing',
  resources: {
    subscribe: { url: 'subscribe/', method: 'POST' },
    contact: { url: 'contact/', method: 'POST' },
    fetchNews: { url: 'news/', method: 'GET', params: ['page', 'size'] },
    fetchArticle: { url: 'news/:slug/', method: 'GET' },
  },
}
