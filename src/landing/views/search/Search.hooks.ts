import { useToursRepository } from '~/search_engine/repositories/tours.repository'
import { SearchSort } from '~/search_engine/contracts/search'
import type { Tour } from '~/search_engine/models/Tour'
import type { SearchRequest } from '~/search_engine/contracts/search'
import { AUTO_DATE_ATTEMPTS, EMPTY_FACETS, RESULTS_PAGE_SIZE } from './Search.config'
import type { IChosenDate } from './Search.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSearch = () => {
  const { search } = useToursRepository()

  const criteria = useAppliedCriteria()
  const route = useRoute()
  const router = useRouter()

  const departure = computed(() => criteria.value.from)
  const destination = computed(() => criteria.value.to)

  const { calendar } = useSearchReferences(departure, destination)

  const { filters } = useSearchFilters()
  const sort = ref<SearchSort>(SearchSort.Popular)

  const extraPages = shallowRef<Tour[][]>([])
  const page = ref(1)
  const loadingMore = ref(false)
  const loadMoreError = ref('')

  const isSearchable = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && criteria.value.date))

  /**
   * The date this page chose on the visitor's behalf, and how many days it
   * has stepped over to get there. A date they picked themselves is never
   * recorded here, which is what keeps the search from wandering off the day
   * they asked for.
   *
   * Held in transferable state rather than a plain ref: the first date is
   * chosen while rendering on the server, and the client has to know it was
   * ours once it takes over.
   */
  const chosen = useState<IChosenDate | null>('search-chosen-date', () => null)

  const lane = computed(() => `${criteria.value.from}|${criteria.value.to}`)

  const dateWasOurs = computed(() =>
    chosen.value?.lane === lane.value && chosen.value?.date === criteria.value.date)

  const useDate = (day: string) => {
    chosen.value = {
      lane: lane.value,
      date: day,
      hops: (chosen.value?.lane === lane.value ? chosen.value.hops : 0) + 1,
    }

    return router.replace({ query: { ...route.query, date: day } })
  }

  /**
   * A route reached without a date — a card on the home page, a shared link —
   * means "as soon as possible", so it takes the soonest day the operators
   * still fly. Written into the URL rather than assumed quietly, so the date
   * field shows the day the results actually belong to.
   */
  watch([calendar, criteria], () => {
    if (!criteria.value.from || !criteria.value.to || criteria.value.date) return

    const soonest = firstOpenDate(calendar.value)

    if (soonest) void useDate(soonest)
  }, { immediate: true })

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

  /**
   * Flying on a day and selling for it are different things: an operator's
   * calendar leaves days open that turn up nothing. When the day this page
   * picked comes back empty it tries the next one, a few times, rather than
   * showing an empty page for a route that does have tours. A day the
   * visitor chose is left alone.
   */
  watch(data, (result) => {
    if (!result || result.tours.length || !dateWasOurs.value) return

    if ((chosen.value?.hops ?? 0) > AUTO_DATE_ATTEMPTS) return

    const following = firstOpenDate(calendar.value, nextDay(criteria.value.date))

    if (following && following !== criteria.value.date) void useDate(following)
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
