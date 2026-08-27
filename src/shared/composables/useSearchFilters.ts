import type { SearchFilters } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const EMPTY_FILTERS: SearchFilters = {
  stars: [],
  meals: [],
  resorts: [],
  hotels: [],
  priceMin: undefined,
  priceMax: undefined,
  suppliers: [],
}

const list = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.split(',').map(v => v.trim()).filter(Boolean) : []
}

const num = (value: unknown): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return raw !== undefined && raw !== '' && Number.isFinite(parsed) ? parsed : undefined
}

export function readFilters(query: Record<string, unknown>): SearchFilters {
  return {
    stars: list(query.stars).map(Number).filter(Number.isFinite),
    meals: list(query.meals),
    resorts: list(query.resorts),
    hotels: list(query.hotels),
    priceMin: num(query.priceMin),
    priceMax: num(query.priceMax),
    suppliers: list(query.suppliers),
  }
}

export function filtersToQuery(filters: SearchFilters): Record<string, string | undefined> {
  const join = (values: Array<string | number>) => (values.length ? values.join(',') : undefined)

  return {
    stars: join(filters.stars),
    meals: join(filters.meals),
    resorts: join(filters.resorts),
    hotels: join(filters.hotels),
    priceMin: filters.priceMin !== undefined ? String(filters.priceMin) : undefined,
    priceMax: filters.priceMax !== undefined ? String(filters.priceMax) : undefined,
    suppliers: join(filters.suppliers),
  }
}

export function useSearchFilters() {
  const route = useRoute()

  const filters = computed<SearchFilters>({
    get: () => readFilters(route.query),
    set: (value) => {
      const query: Record<string, string> = {}

      for (const [key, entry] of Object.entries({ ...route.query, ...filtersToQuery(value) })) {
        const flat = Array.isArray(entry) ? entry[0] : entry
        if (flat !== undefined && flat !== null && flat !== '') query[key] = String(flat)
      }

      void navigateTo({ query }, { replace: true })
    },
  })

  return { filters }
}
