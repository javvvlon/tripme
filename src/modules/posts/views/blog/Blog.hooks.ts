import { usePostsRepository } from '~/modules/posts/repositories'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { IPostAttributes } from '~/modules/posts/models/Post'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useBlog = () => {
  const { feed } = usePostsRepository()
  const { locale } = useI18n()

  const { data, status } = useAsyncData(
    () => `blog-feed-${locale.value}`,
    async () => {
      const found = await feed(locale.value as ContentLocale).catch(() => [])

      return found.map(post => post.toObject())
    },
    { watch: [locale], default: () => [] as IPostAttributes[] },
  )

  const posts = computed(() => data.value ?? [])

  const lead = computed(() => posts.value[0] ?? null)
  const rest = computed(() => posts.value.slice(1))

  return { posts, lead, rest, status }
}
