import { useContentRepository } from '~/modules/content/repositories'
import type { ContentLocale } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const useHome = () => {
  const { pageContent } = useContentRepository()
  const { locale } = useI18n()

  useDepartures()

  const { data: content } = useAsyncData(
    () => `home-sections-${locale.value}`,
    async () => {
      try {
        const home = await pageContent('home', locale.value as ContentLocale)

        return { sections: home.get('sections') }
      }
      catch {
        return { sections: [] }
      }
    },
    { default: () => ({ sections: [] }) },
  )

  const sections = computed(() => content.value?.sections ?? [])

  return { sections }
}
