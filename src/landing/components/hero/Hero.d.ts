import type { IHomeBanner } from '~/modules/content/models/PageContent'
import type { HeroAccent } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IHeroProps {
  banner?: IHomeBanner | null
  accent?: HeroAccent
}

export type HeroProduct = 'tours' | 'hotels' | 'excursions' | 'esim'

export type ProductState = 'ready' | 'loading' | 'unavailable'
