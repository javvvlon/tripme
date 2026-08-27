/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const FILTER_GROUPS = [
  { key: 'suppliers', titleKey: 'filters.suppliers', agentOnly: true },
  { key: 'stars', titleKey: 'filters.stars' },
  { key: 'price', titleKey: 'filters.price' },
  { key: 'meals', titleKey: 'filters.meals' },
  { key: 'districts', titleKey: 'filters.districts' },
] as const

export type FilterGroupKey = typeof FILTER_GROUPS[number]['key']
