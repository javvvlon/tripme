import type { SearchFacets } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const RESULTS_PAGE_SIZE = 20

export const EMPTY_FACETS: SearchFacets = {
  suppliers: [],
  stars: [],
  meals: [],
  districts: [],
  availability: [],
  priceFrom: null,
  priceBuckets: [],
  priceMin: null,
  priceMax: null,
  currency: null,
  partial: false,
  total: 0,
}

/** How many empty days the search will step over before giving up. */
export const AUTO_DATE_ATTEMPTS = 4

/** A departure date the search page picked, and the route it picked it for. */
export interface IChosenDate {
  lane: string
  date: string
  hops: number
}
