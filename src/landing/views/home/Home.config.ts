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
  { value: 'hotels', labelKey: 'home.products.hotels', icon: 'bed' },
  { value: 'excursions', labelKey: 'home.products.excursions', icon: 'landmark' },
  { value: 'esim', labelKey: 'home.products.esim', icon: 'sim' },
] as const

export const PRODUCT_PICKS = {
  hotels: ['turkey', 'uae', 'egypt', 'thailand', 'georgia'],
  excursions: ['uzbekistan', 'italy', 'china', 'turkey', 'india'],
} as const

export const QUICK_SEARCHES: IQuickSearch[] = [
  { id: 'beach', icon: 'wave', labelKey: 'home.quick.beach', theme: 'beach' },
  { id: 'history', icon: 'landmark', labelKey: 'home.quick.history', theme: 'history' },
  { id: 'kids', icon: 'kids', labelKey: 'home.quick.kids', theme: 'kids' },
  { id: 'sale', icon: 'tag', labelKey: 'home.quick.sale', theme: 'discount' },
]
