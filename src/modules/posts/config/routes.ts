import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'blog-post',
    path: '/blog/:slug',
    file: 'modules/posts/views/post/Post.vue',
    meta: { header: 'solid' },
  },
  {
    name: 'cms-posts',
    path: '/app/posts',
    file: 'modules/posts/views/posts/Posts.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-post-edit',
    path: '/app/posts/:id',
    file: 'modules/posts/views/postEditor/PostEditor.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
