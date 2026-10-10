/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const FILTER_GROUPS = [
  { key: 'suppliers', titleKey: 'filters.suppliers', agentOnly: true },
  { key: 'hotels', titleKey: 'filters.hotels' },
  { key: 'stars', titleKey: 'filters.stars' },
  { key: 'price', titleKey: 'filters.price' },
  { key: 'meals', titleKey: 'filters.meals' },
  { key: 'districts', titleKey: 'filters.districts' },
] as const

export type FilterGroupKey = typeof FILTER_GROUPS[number]['key']

export const PRICE_DEBOUNCE_MS = 500

export const EMPTY_FILTERS = {
  stars: [] as number[],
  meals: [] as string[],
  resorts: [] as string[],
  hotels: [] as string[],
  suppliers: [] as string[],
  priceMin: undefined as number | undefined,
  priceMax: undefined as number | undefined,
}
