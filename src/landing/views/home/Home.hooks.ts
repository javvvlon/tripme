import { useContentRepository } from '~/modules/content/repositories'
import type { ContentLocale } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const useHome = () => {
  const { homeContent } = useContentRepository()
  const { locale } = useI18n()

  useDepartures()

  const { data: content } = useAsyncData(
    'home-sections',
    async () => {
      try {
        const home = await homeContent(locale.value as ContentLocale)

        return { banner: home.get('banner'), sections: home.get('sections') }
      }
      catch {
        return { banner: null, sections: [] }
      }
    },
    { watch: [locale], default: () => ({ banner: null, sections: [] }) },
  )

  const banner = computed(() => content.value?.banner ?? null)
  const sections = computed(() => content.value?.sections ?? [])

  return { banner, sections }
}
