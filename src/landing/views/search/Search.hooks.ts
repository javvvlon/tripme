import { useToursRepository } from '~/search_engine/repositories/tours.repository'
import { SearchSort } from '~/search_engine/contracts/search'
import type { Tour } from '~/search_engine/models/Tour'
import type { SearchRequest } from '~/search_engine/contracts/search'
import { EMPTY_FACETS, RESULTS_PAGE_SIZE } from './Search.config'
import type { IChosenDate } from './Search.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSearch = () => {
  const { search, soonestDeparture } = useToursRepository()

  const criteria = useAppliedCriteria()
  const route = useRoute()
  const router = useRouter()

  const { filters } = useSearchFilters()
  const sort = ref<SearchSort>(SearchSort.Popular)

  const extraPages = shallowRef<Tour[][]>([])
  const page = ref(1)
  const loadingMore = ref(false)
  const loadMoreError = ref('')

  const isSearchable = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && criteria.value.date))

  /**
   * Fixed once, on the server, and carried to the client: two clocks
   * disagreeing about what day it is would send the page searching twice.
   */
  const today = useState('search-today', () => new Date().toISOString().slice(0, 10))

  /** A route is known but the day it leaves on is not settled yet. */
  const settling = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && !criteria.value.date))

  /**
   * The date this page chose on the visitor's behalf. A date they picked
   * themselves is never recorded here, which is what keeps the search from
   * wandering off the day they asked for.
   *
   * Held in transferable state rather than a plain ref: the first date is
   * chosen while rendering on the server, and the client has to know it was
   * ours once it takes over.
   */
  const chosen = useState<IChosenDate | null>('search-chosen-date', () => null)

  const lane = computed(() => `${criteria.value.from}|${criteria.value.to}`)

  const dateWasOurs = computed(() =>
    chosen.value?.lane === lane.value && chosen.value?.date === criteria.value.date)

  const useDate = (day: string, asked = false) => {
    chosen.value = { lane: lane.value, date: day, asked: asked || Boolean(chosen.value?.asked) }

    return router.replace({ query: { ...route.query, date: day } })
  }

  /**
   * A route reached without a date — a card on the home page, a shared link —
   * means "as soon as possible", and today is the soonest there is. Written
   * into the URL rather than assumed quietly, so the date field shows the day
   * the results belong to, and searched straight away: asking the operators
   * when they next fly costs a round trip, and most routes sell today.
   */
  watch(criteria, () => {
    if (!criteria.value.from || !criteria.value.to || criteria.value.date) return

    void useDate(today.value)
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
        return { date: '', tours: [] as Tour[], total: 0, facets: EMPTY_FACETS, statuses: [], hasMore: false }
      }

      const results = await search(request.value, 1)

      return {
        /** The day these results are for, so a stale answer is recognisable. */
        date: criteria.value.date,
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
   * Today sold nothing, so ask when this route next does.
   *
   * Only ever asked about a day this page chose: a visitor who picked a date
   * and found it empty meant that date, and moving them off it would answer
   * a question they did not ask. Asked once per route — a second empty
   * answer means the operators have nothing, not that the day was wrong.
   */
  const seeking = ref(false)

  watch(data, async (result) => {
    if (!result || result.date !== criteria.value.date || result.tours.length) return

    if (!dateWasOurs.value || chosen.value?.asked || seeking.value) return

    seeking.value = true

    try {
      const day = await soonestDeparture(request.value)

      if (day && day !== criteria.value.date) await useDate(day, true)
      else if (chosen.value) chosen.value = { ...chosen.value, asked: true }
    }
    catch {
      if (chosen.value) chosen.value = { ...chosen.value, asked: true }
    }
    finally {
      seeking.value = false
    }
  })

  /** Fetching, or asking for a better day — either way the page is not done. */
  const busy = computed(() => pending.value || seeking.value)

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
    tours, facets, total, statuses, settling, busy,
    isSearchable, pending, error,
    hasMore, canLoadMore, loadingMore, loadMoreError, loadMore, refresh,
  }
}
