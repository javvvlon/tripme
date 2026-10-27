import type { ShowcaseTheme } from '~/search_engine/contracts/showcase'
import type { IPhoto } from '~/shared/contracts/media'
import type { Money } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IHeroContent {
  image: string
  imageAlt: string
  titleKey: string
  subtitleKey: string
}

export interface IQuickSearch {
  id: string
  icon: string
  labelKey: string
  theme: ShowcaseTheme
}

export type ExperienceSpan = 'wide' | 'normal'
