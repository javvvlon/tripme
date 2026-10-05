import type {
  IHeroContent,
  IQuickSearch,
} from '~/landing/contracts/content'
import { HOME_DEPARTURE } from '~/shared/composables/useSearchCriteria'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const HERO: IHeroContent = {
  image: '/hero_placeholder.png',
  imageAlt: '',
  titleKey: 'home.hero.title',
  subtitleKey: 'home.hero.subtitle',
}

export const HOT_ANCHOR = 'hot'

export const QUICK_SEARCHES: IQuickSearch[] = [
  { id: 'beach', icon: 'wave', labelKey: 'home.quick.beach', to: `/search?from=${HOME_DEPARTURE}&to=egypt` },
  { id: 'history', icon: 'landmark', labelKey: 'home.quick.history', to: `/search?from=${HOME_DEPARTURE}&to=georgia` },
  { id: 'kids', icon: 'kids', labelKey: 'home.quick.kids', to: `/search?from=${HOME_DEPARTURE}&to=uae` },
  { id: 'sale', icon: 'tag', labelKey: 'home.quick.sale', to: `/#${HOT_ANCHOR}` },
]
