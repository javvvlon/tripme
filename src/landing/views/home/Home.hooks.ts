import { useContentRepository } from '~/modules/content/repositories'
import { failRenderOnServer, withRetry } from '~/shared/helpers/resilient'
import type { ContentLocale } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useHome = async () => {
  const { pageContent } = useContentRepository()
  const { locale } = useI18n()

  useDepartures()

  const loading = useAsyncData(
    () => `home-sections-${locale.value}`,
    async () => {
      const home = await withRetry(() => pageContent('home', locale.value as ContentLocale))

      return { sections: home.get('sections') }
    },
    { default: () => ({ sections: [] }) },
  )
  const { data: content, error, refresh } = loading

  onMounted(() => {
    if (error.value || !content.value?.sections.length) void refresh()
  })

  await loading

  failRenderOnServer(error.value)

  const sections = computed(() => content.value?.sections ?? [])

  return { sections }
}
