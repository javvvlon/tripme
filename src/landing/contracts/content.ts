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

export interface IBenefit {
  id: string
  image: string
  width: number
  height: number
  titleKey: string
}

export interface IQuickSearch {
  id: string
  icon: string
  labelKey: string
  to: string
}

export type ExperienceSpan = 'wide' | 'normal'
