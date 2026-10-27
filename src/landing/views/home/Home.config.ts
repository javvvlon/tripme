import type {
  IHeroContent,
  IQuickSearch,
} from '~/landing/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const HERO: IHeroContent = {
  image: '/hero-default.jpg',
  imageAlt: '',
  titleKey: 'home.hero.title',
  subtitleKey: 'home.hero.subtitle',
}

export const HERO_PRODUCTS = [
  { value: 'tours', labelKey: 'home.products.tours', icon: 'briefcase' },
  { value: 'esim', labelKey: 'home.products.esim', icon: 'sim' },
] as const

export const QUICK_SEARCHES: IQuickSearch[] = [
  { id: 'beach', icon: 'wave', labelKey: 'home.quick.beach', theme: 'beach' },
  { id: 'history', icon: 'landmark', labelKey: 'home.quick.history', theme: 'history' },
  { id: 'kids', icon: 'kids', labelKey: 'home.quick.kids', theme: 'kids' },
  { id: 'sale', icon: 'tag', labelKey: 'home.quick.sale', theme: 'discount' },
]
