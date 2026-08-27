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
