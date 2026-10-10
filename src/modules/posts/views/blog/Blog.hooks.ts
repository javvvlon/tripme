import { useContentRepository } from '~/modules/content/repositories'
import { failRenderOnServer, withRetry } from '~/shared/helpers/resilient'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { IContentSection, IPageSeo } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useBlog = async () => {
  const { pageContent } = useContentRepository()
  const { locale } = useI18n()

  const loading = useAsyncData(
    () => `blog-page-${locale.value}`,
    async () => {
      const page = await withRetry(() => pageContent('blog', locale.value as ContentLocale))

      return { sections: page.get('sections'), seo: page.get('seo') }
    },
    { watch: [locale], default: () => ({ sections: [] as IContentSection[], seo: null as IPageSeo | null }) },
  )
  const { data, status, error, refresh } = loading

  onMounted(() => {
    if (error.value || !data.value?.sections.length) void refresh()
  })

  await loading

  failRenderOnServer(error.value)

  const sections = computed(() => data.value?.sections ?? [])
  const seo = computed(() => data.value?.seo ?? null)

  return { sections, seo, status }
}
