import type { ITourRaw } from '~/search_engine/models/Tour'
import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SHOWCASE_THEMES = ['all', 'beach', 'history', 'kids', 'discount'] as const

export type ShowcaseTheme = typeof SHOWCASE_THEMES[number]

export type SavingKind = 'old_price' | 'median'

export interface IShowcasePlace {
  slug: string
  label: string
}

export interface IShowcaseCardRaw {
  country: IShowcasePlace
  offer: ITourRaw | null
  offers: number
  discount: number
  discount_kind: SavingKind | null
}

export interface IShowcaseCard {
  country: IShowcasePlace
  tour: Tour
  offers: number
  discount: number
  discountKind: SavingKind | null
}

export type ShowcaseStreamEvent =
  | { type: 'start', from: IShowcasePlace, theme: ShowcaseTheme, date: string, dateTo: string, countries: IShowcasePlace[] }
  | { type: 'country', card: IShowcaseCard }
  | { type: 'done', cards: IShowcaseCard[] }
