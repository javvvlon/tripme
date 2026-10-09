import { useToursRepository } from '~/search_engine/repositories/tours.repository'
import { SearchCriteriaIntention } from '~/search_engine/intentions/search'
import { SearchSort } from '~/search_engine/contracts/search'
import type { Tour } from '~/search_engine/models/Tour'
import type { ISupplierStatus } from '~/search_engine/repositories/tours.repository'
import type { SearchFacets, SearchRequest } from '~/search_engine/contracts/search'
import { EMPTY_FACETS, RESULTS_PAGE_SIZE } from './Search.config'
import type { IChosenDate } from './Search.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const priceOf = (tour: Tour): number => tour.get('comparablePrice').amount

const SORTERS: Record<SearchSort, (a: Tour, b: Tour) => number> = {
  [SearchSort.Popular]: (a, b) => priceOf(a) - priceOf(b),
  [SearchSort.PriceAsc]: (a, b) => priceOf(a) - priceOf(b),
  [SearchSort.PriceDesc]: (a, b) => priceOf(b) - priceOf(a),
  [SearchSort.RatingDesc]: (a, b) => b.stars() - a.stars() || priceOf(a) - priceOf(b),
}

const RETRY_DELAYS_MS = [1500, 4000]

async function withRetry<T>(task: () => Promise<T>): Promise<T> {
  for (const delay of RETRY_DELAYS_MS) {
    try {
      return await task()
    }
    catch {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return task()
}

export const useSearch = () => {
  const { search, stream, soonestDeparture } = useToursRepository()

  const criteria = useAppliedCriteria()
  const route = useRoute()
  const router = useRouter()

  const { filters } = useSearchFilters()
  const sort = ref<SearchSort>(SearchSort.PriceAsc)
  const day = ref('')

  const isSearchable = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && criteria.value.date))

  const today = useState('search-today', () => new Date().toISOString().slice(0, 10))

  const settling = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && !criteria.value.date))

  const chosen = useState<IChosenDate | null>('search-chosen-date', () => null)

  const lane = computed(() => `${criteria.value.from}|${criteria.value.to}`)

  const dateWasOurs = computed(() =>
    chosen.value?.lane === lane.value && chosen.value?.date === criteria.value.date)

  const useDate = (date: string, asked = false) => {
    chosen.value = { lane: lane.value, date, asked: asked || Boolean(chosen.value?.asked) }

    return router.replace({ query: { ...route.query, date } })
  }

  watch(criteria, () => {
    if (!criteria.value.from || !criteria.value.to || criteria.value.date) return

    void useDate(today.value)
  }, { immediate: true })

  const request = computed<SearchRequest>(() => ({
    ...criteria.value,
    filters: { ...filters.value },
    sort: SearchSort.PriceAsc,
    page: 1,
    size: RESULTS_PAGE_SIZE,
  }))

  const requestKey = computed(() =>
    JSON.stringify(new SearchCriteriaIntention().toRequest(request.value)))

  const scopeKey = computed(() => JSON.stringify(criteria.value))

  let lastScope = ''

  const offers = shallowRef<Tour[]>([])
  const facets = shallowRef<SearchFacets>(EMPTY_FACETS)
  const statuses = shallowRef<ISupplierStatus[]>([])
  const streaming = ref(isSearchable.value)
  const finished = ref(false)
  const hasMore = ref(false)
  const failed = ref(false)
  const page = ref(1)
  const shown = ref(RESULTS_PAGE_SIZE)
  const loadingMore = ref(false)
  const loadMoreError = ref('')
  const seeking = ref(false)

  let stop: (() => void) | null = null
  let ticket = 0

  const merge = (incoming: Tour[]) => {
    const byId = new Map(offers.value.map(tour => [tour.get('id'), tour]))

    for (const tour of incoming) {
      const seen = byId.get(tour.get('id'))

      if (!seen || priceOf(tour) < priceOf(seen)) byId.set(tour.get('id'), tour)
    }

    offers.value = [...byId.values()]
  }

  const settle = async (forDate: string) => {
    if (offers.value.length || forDate !== criteria.value.date) return

    if (!dateWasOurs.value || chosen.value?.asked || seeking.value) return

    seeking.value = true

    try {
      const next = await soonestDeparture(request.value)

      if (next && next !== criteria.value.date) await useDate(next, true)
      else if (chosen.value) chosen.value = { ...chosen.value, asked: true }
    }
    catch {
      if (chosen.value) chosen.value = { ...chosen.value, asked: true }
    }
    finally {
      seeking.value = false
    }
  }

  const finish = (mine: number, forDate: string) => {
    if (mine !== ticket) return

    streaming.value = false
    finished.value = true
    statuses.value = statuses.value.map(status =>
      status.state === 'searching' ? { ...status, state: 'failed' } : status)

    void settle(forDate)
  }

  const fallback = async (mine: number, forDate: string) => {
    try {
      const result = await withRetry(() => search(request.value, 1))

      if (mine !== ticket) return

      merge(result.items)
      facets.value = result.facets ?? EMPTY_FACETS
      statuses.value = result.statuses
      hasMore.value = result.hasMore
    }
    catch {
      if (mine === ticket) failed.value = true
    }
    finally {
      finish(mine, forDate)
    }
  }

  const run = () => {
    stop?.()
    stop = null

    const mine = ++ticket
    const forDate = criteria.value.date

    offers.value = []
    if (scopeKey.value !== lastScope) facets.value = EMPTY_FACETS
    lastScope = scopeKey.value
    statuses.value = []
    finished.value = false
    hasMore.value = false
    failed.value = false
    page.value = 1
    shown.value = RESULTS_PAGE_SIZE
    loadMoreError.value = ''
    day.value = ''

    if (!isSearchable.value) {
      streaming.value = false
      finished.value = true
      return
    }

    streaming.value = true

    stop = stream(
      request.value,
      (event) => {
        if (mine !== ticket) return

        statuses.value = event.statuses

        if (event.type === 'offers') {
          merge(event.items)
          facets.value = event.facets
        }

        if (event.type === 'done') {
          hasMore.value = event.hasMore
          finish(mine, forDate)
        }
      },
      (received) => {
        if (mine !== ticket) return

        if (received) finish(mine, forDate)
        else void fallback(mine, forDate)
      },
    )
  }

  onMounted(run)
  watch(requestKey, () => run())
  onBeforeUnmount(() => {
    ticket++
    stop?.()
  })

  watch([sort, day], () => { shown.value = RESULTS_PAGE_SIZE })

  const sorted = computed(() => [...offers.value].sort(SORTERS[sort.value]))

  const filtered = computed(() =>
    day.value ? sorted.value.filter(tour => tour.get('checkIn') === day.value) : sorted.value)

  const tours = computed(() => filtered.value.slice(0, shown.value))

  const remaining = computed(() => filtered.value.length - tours.value.length)

  const moreAvailable = computed(() => remaining.value > 0 || (finished.value && hasMore.value))

  const canLoadMore = computed(() =>
    remaining.value > 0 || (finished.value && hasMore.value && !loadingMore.value))

  async function loadMore() {
    if (remaining.value > 0) {
      shown.value += RESULTS_PAGE_SIZE
      return
    }

    if (!canLoadMore.value) return

    loadingMore.value = true
    loadMoreError.value = ''

    try {
      const next = page.value + 1
      const result = await withRetry(() => search(request.value, next))
      const before = offers.value.length

      merge(result.items)
      page.value = next
      hasMore.value = result.hasMore && offers.value.length > before
      shown.value += RESULTS_PAGE_SIZE
    }
    catch {
      loadMoreError.value = 'results.loadMoreFailed'
    }
    finally {
      loadingMore.value = false
    }
  }

  const progress = computed(() => {
    const total = statuses.value.length
    const pending = statuses.value.filter(status => status.state === 'searching')

    return { total, done: total - pending.length, waiting: pending.map(status => status.supplier.name) }
  })

  const waitingForFirst = computed(() => streaming.value && !offers.value.length)

  const busy = computed(() => waitingForFirst.value || seeking.value)

  const total = computed(() => filtered.value.length)

  return {
    criteria, filters, sort, day,
    tours, facets, total, statuses, progress, settling, busy,
    streaming, finished, failed, waitingForFirst,
    isSearchable, remaining,
    hasMore: moreAvailable, canLoadMore, loadingMore, loadMoreError, loadMore, refresh: run,
  }
}
