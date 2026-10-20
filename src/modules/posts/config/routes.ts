import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'blog-index',
    path: '/blog',
    file: 'modules/posts/views/blog/Blog.vue',
    meta: { header: 'solid', testNotice: true },
    swr: 300,
  },
  {
    name: 'blog-post',
    path: '/blog/:slug',
    file: 'modules/posts/views/post/Post.vue',
    meta: { header: 'solid', testNotice: true },
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
    name: 'cms-site-assistant',
    path: '/app/content/ai',
    file: 'modules/posts/views/assistant/BlogAssistant.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth', wide: true },
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
