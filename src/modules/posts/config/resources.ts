import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Posts',
  prefix: '',
  resources: {
    feed: { url: 'posts', method: 'GET', params: ['limit'] },
    post: { url: 'posts/:slug', method: 'GET' },

    adminPosts: { url: 'cms/posts', method: 'GET' },
    adminPost: { url: 'cms/posts/:id', method: 'GET' },
    createPost: { url: 'cms/posts', method: 'POST' },
    updatePost: { url: 'cms/posts/:id', method: 'PUT' },
    deletePost: { url: 'cms/posts/:id', method: 'DELETE' },
  },
}
