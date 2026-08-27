import { useToursRepository } from '~/search_engine/repositories/tours.repository'
import { SearchSort } from '~/search_engine/contracts/search'
import type { Tour } from '~/search_engine/models/Tour'
import type { SearchRequest } from '~/search_engine/contracts/search'
import { EMPTY_FACETS, RESULTS_PAGE_SIZE } from './Search.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSearch = () => {
  const { search } = useToursRepository()

  const criteria = useAppliedCriteria()

  const { filters } = useSearchFilters()
  const sort = ref<SearchSort>(SearchSort.Popular)

  const extraPages = shallowRef<Tour[][]>([])
  const page = ref(1)
  const loadingMore = ref(false)
  const loadMoreError = ref('')

  const isSearchable = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && criteria.value.date))

  const request = computed<SearchRequest>(() => ({
    ...criteria.value,
    filters: { ...filters.value },
    sort: sort.value,
    page: 1,
    size: RESULTS_PAGE_SIZE,
  }))

  const { data, pending, error, refresh } = useAsyncData(
    'search-results',
    async () => {
      if (!isSearchable.value) {
        return { tours: [] as Tour[], total: 0, facets: EMPTY_FACETS, statuses: [], hasMore: false }
      }

      const results = await search(request.value, 1)

      return {
        tours: results.items,
        total: results.total,
        facets: results.facets ?? EMPTY_FACETS,
        statuses: results.statuses,
        hasMore: results.hasMore,
      }
    },
    { watch: [request] },
  )

  watch(data, () => {
    extraPages.value = []
    page.value = 1
    loadMoreError.value = ''
  })

  const tours = computed<Tour[]>(() =>
    [...((data.value?.tours ?? []) as unknown as Tour[]), ...extraPages.value.flat()])
  const facets = computed(() => data.value?.facets ?? EMPTY_FACETS)
  const statuses = computed(() => data.value?.statuses ?? [])
  const total = computed(() => tours.value.length)

  const hasMore = computed(() =>
    Boolean(data.value?.hasMore) && extraPages.value.every(p => p.length > 0))

  const canLoadMore = computed(() => hasMore.value && !loadingMore.value && !pending.value)

  async function loadMore() {
    if (!canLoadMore.value) return

    loadingMore.value = true
    loadMoreError.value = ''

    try {
      const next = page.value + 1
      const result = await search(request.value, next)

      const seen = new Set(tours.value.map(tour => tour.get('id')))
      const fresh = result.items.filter(tour => !seen.has(tour.get('id')))

      extraPages.value = [...extraPages.value, fresh]
      page.value = next

      if (!result.hasMore && data.value) data.value.hasMore = false
    }
    catch {
      loadMoreError.value = 'results.loadMoreFailed'
    }
    finally {
      loadingMore.value = false
    }
  }

  return {
    criteria, filters, sort,
    tours, facets, total, statuses,
    isSearchable, pending, error,
    hasMore, canLoadMore, loadingMore, loadMoreError, loadMore, refresh,
  }
}
