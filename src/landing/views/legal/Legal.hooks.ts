import { usePostsRepository } from '~/modules/posts/repositories'
import type { IPostAttributes } from '~/modules/posts/models/Post'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { LEGAL_DOCS, LEGAL_SLUG_PREFIX } from './Legal.config'
import type { LegalDoc } from './Legal.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLegalPage = () => {
  const route = useRoute()
  const { locale } = useI18n()
  const { bySlug } = usePostsRepository()

  const doc = computed<LegalDoc>(() => {
    const value = String(route.params.doc ?? '') as LegalDoc

    return LEGAL_DOCS.includes(value) ? value : 'offer'
  })

  const { data, status } = useAsyncData(
    'legal-page',
    async (): Promise<IPostAttributes | null> => {
      try {
        return (await bySlug(`${LEGAL_SLUG_PREFIX}${doc.value}`, locale.value as ContentLocale))?.toObject() ?? null
      }
      catch {
        return null
      }
    },
    { watch: [doc, locale], default: () => null },
  )

  return { doc, page: computed(() => data.value), status }
}
