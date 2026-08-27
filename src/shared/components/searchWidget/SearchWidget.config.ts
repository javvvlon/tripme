import { SearchMode } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SEARCH_MODES = [
  { value: SearchMode.Tours, labelKey: 'search.mode.tours', icon: 'briefcase' },
] as const

export const NIGHTS_OPTIONS = [3, 5, 7, 8, 10, 12, 14] as const

export const MAX_ADULTS = 6
