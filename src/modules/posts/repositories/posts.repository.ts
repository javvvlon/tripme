import { Post } from '../models/Post'
import { PostCreateIntention, PostIntention } from '../intentions/post'
import type { IPostAdminRaw, IPostDraft, IPostRaw } from '../contracts/posts'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const usePostsRepository = () => {
  const http = useHttp()

  const feed = async (locale: ContentLocale, limit?: number): Promise<Post[]> => {
    const response = await http.call<IPostRaw[]>('Posts', 'feed', limit ? { limit } : {})

    return Post.listForLocale(response.data, locale)
  }

  const bySlug = async (slug: string, locale: ContentLocale): Promise<Post | null> => {
    const response = await http.call<IPostRaw>('Posts', 'post', { slug })

    return Post.forLocale(response.data, locale)
  }

  const all = async (): Promise<IPostAdminRaw[]> => {
    const response = await http.call<IPostAdminRaw[]>('Posts', 'adminPosts')

    return response.data
  }

  const one = async (id: string): Promise<IPostAdminRaw> => {
    const response = await http.call<IPostAdminRaw>('Posts', 'adminPost', { id })

    return response.data
  }

  const create = async (draft: { title: string, slug: string, locale: string }): Promise<IPostAdminRaw> => {
    const body = new PostCreateIntention().toRequest(draft)
    const response = await http.call<IPostAdminRaw>('Posts', 'createPost', {}, body as AnyObject)

    return response.data
  }

  const update = async (id: string, draft: IPostDraft): Promise<IPostAdminRaw> => {
    const body = new PostIntention().toRequest(draft)
    const response = await http.call<IPostAdminRaw>('Posts', 'updatePost', { id }, body as AnyObject)

    return response.data
  }

  const remove = async (id: string): Promise<void> => {
    await http.call<void>('Posts', 'deletePost', { id })
  }

  return { feed, bySlug, all, one, create, update, remove }
}
