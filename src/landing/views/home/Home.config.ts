import type {
  IBenefit,
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

export const BENEFITS: IBenefit[] = [
  { id: 'price', image: '/icon/win.png', width: 130, height: 121, titleKey: 'home.benefits.price' },
  { id: 'support', image: '/icon/chat.png', width: 135, height: 121, titleKey: 'home.benefits.support' },
  { id: 'years', image: '/icon/medal.png', width: 124, height: 121, titleKey: 'home.benefits.years' },
  { id: 'docs', image: '/icon/notebook.png', width: 135, height: 122, titleKey: 'home.benefits.docs' },
]

export const HOT_ANCHOR = 'hot'

export const QUICK_SEARCHES: IQuickSearch[] = [
  { id: 'beach', icon: 'wave', labelKey: 'home.quick.beach', to: `/search?from=${HOME_DEPARTURE}&to=egypt` },
  { id: 'history', icon: 'landmark', labelKey: 'home.quick.history', to: `/search?from=${HOME_DEPARTURE}&to=georgia` },
  { id: 'kids', icon: 'kids', labelKey: 'home.quick.kids', to: `/search?from=${HOME_DEPARTURE}&to=uae` },
  { id: 'sale', icon: 'tag', labelKey: 'home.quick.sale', to: `/#${HOT_ANCHOR}` },
]
