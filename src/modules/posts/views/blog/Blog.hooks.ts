import { useContentRepository } from '~/modules/content/repositories'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { IContentSection, IPageSeo } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useBlog = () => {
  const { pageContent } = useContentRepository()
  const { locale } = useI18n()

  const { data, status } = useAsyncData(
    () => `blog-page-${locale.value}`,
    async () => {
      try {
        const page = await pageContent('blog', locale.value as ContentLocale)

        return { sections: page.get('sections'), seo: page.get('seo') }
      }
      catch {
        return { sections: [] as IContentSection[], seo: null as IPageSeo | null }
      }
    },
    { watch: [locale], default: () => ({ sections: [] as IContentSection[], seo: null as IPageSeo | null }) },
  )

  const sections = computed(() => data.value?.sections ?? [])
  const seo = computed(() => data.value?.seo ?? null)

  return { sections, seo, status }
}
