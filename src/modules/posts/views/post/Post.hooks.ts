import { usePostsRepository } from '~/modules/posts/repositories'
import type { IPostAttributes } from '~/modules/posts/models/Post'
import type { ContentLocale } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const usePostPage = () => {
  const route = useRoute()
  const { locale } = useI18n()
  const { bySlug } = usePostsRepository()

  const slug = computed(() => String(route.params.slug ?? ''))

  const { data, status } = useAsyncData(
    'blog-post',
    async (): Promise<IPostAttributes | null> => {
      try {
        return (await bySlug(slug.value, locale.value as ContentLocale))?.toObject() ?? null
      }
      catch {
        return null
      }
    },
    { watch: [slug, locale], default: () => null },
  )

  const post = computed(() => data.value)

  return { post, status, slug }
}
