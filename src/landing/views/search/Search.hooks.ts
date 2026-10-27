import { useToursRepository } from '~/search_engine/repositories/tours.repository'
import { useHotelLabels } from '~/shared/composables/useHotelLabels'
import { earliestDeparture, hotPicks } from '~/shared/helpers/hot'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { SearchCriteriaIntention } from '~/search_engine/intentions/search'
import { SearchSort } from '~/search_engine/contracts/search'
import type { Tour } from '~/search_engine/models/Tour'
import type { ISupplierStatus } from '~/search_engine/repositories/tours.repository'
import type { FacetOption, SearchFacets, SearchRequest } from '~/search_engine/contracts/search'
import { EMPTY_FACETS, RESULTS_PAGE_SIZE } from './Search.config'
import type { IChosenDate } from './Search.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const priceOf = (tour: Tour): number => tour.rankPrice()

const SORTERS: Record<SearchSort, (a: Tour, b: Tour) => number> = {
  [SearchSort.Popular]: (a, b) => priceOf(a) - priceOf(b),
  [SearchSort.PriceAsc]: (a, b) => priceOf(a) - priceOf(b),
  [SearchSort.PriceDesc]: (a, b) => priceOf(b) - priceOf(a),
  [SearchSort.RatingDesc]: (a, b) => b.stars() - a.stars() || priceOf(a) - priceOf(b),
}

const RETRY_DELAYS_MS = [1500, 4000]

export interface IHotelGroup {
  key: string
  lead: Tour
  others: Tour[]
  operators: number
}

export const mergeSupplierOptions = (
  known: FacetOption[],
  current: FacetOption[],
  selected: string[],
  statuses: ISupplierStatus[],
): FacetOption[] => {
  const merged = new Map<string, FacetOption>(known.map(option => [option.value, { ...option }]))

  for (const option of current) {
    const seen = merged.get(option.value)

    if (!seen || selected.includes(option.value)) merged.set(option.value, { ...option })
  }

  for (const id of selected) {
    if (merged.has(id)) continue

    const name = statuses.find(status => status.supplier.id === id)?.supplier.name ?? id

    merged.set(id, { value: id, label: name, count: 0 })
  }

  return [...merged.values()]
}

export const groupByHotel = (tours: Tour[]): IHotelGroup[] => {
  const groups = new Map<string, IHotelGroup>()

  for (const tour of tours) {
    const key = tour.groupKey()
    const group = groups.get(key)

    if (group) group.others.push(tour)
    else groups.set(key, { key, lead: tour, others: [], operators: 1 })
  }

  for (const group of groups.values()) {
    group.operators = new Set([group.lead, ...group.others].map(tour => tour.get('supplier').id)).size
  }

  return [...groups.values()]
}

export const packagesOf = (tours: Tour[]): Map<string, Tour[]> => {
  const packages = new Map<string, Tour[]>()

  for (const tour of tours) {
    const key = tour.packageKey()
    const list = packages.get(key)

    if (list) list.push(tour)
    else packages.set(key, [tour])
  }

  for (const list of packages.values()) list.sort((a, b) => priceOf(a) - priceOf(b))

  return packages
}

export const cheapestPackages = (tours: Tour[]): Tour[] => {
  const best = new Set([...packagesOf(tours).values()].map(list => list[0]!.get('id')))

  return tours.filter(tour => best.has(tour.get('id')))
}

export const twinsOf = (tours: Tour[]): Map<string, Tour[]> => {
  const twins = new Map<string, Tour[]>()

  for (const list of packagesOf(tours).values()) {
    if (list.length < 2) continue

    for (const tour of list) {
      const own = tour.get('supplier').id
      const seen = new Set<string>([own])
      const others: Tour[] = []

      for (const other of list) {
        const supplier = other.get('supplier').id

        if (seen.has(supplier)) continue

        seen.add(supplier)
        others.push(other)
      }

      if (others.length) twins.set(tour.get('id'), others)
    }
  }

  return twins
}

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
  const { isStaff } = useAuthSession()

  const criteria = useAppliedCriteria()
  const route = useRoute()
  const router = useRouter()

  const { filters } = useSearchFilters()
  const sort = ref<SearchSort>(SearchSort.PriceAsc)
  const day = ref('')

  const isSearchable = computed(() =>
    Boolean(criteria.value.from && criteria.value.to && criteria.value.date))

  const today = useState('search-today', () => earliestDeparture())

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
  const rawFacets = shallowRef<SearchFacets>(EMPTY_FACETS)
  const knownSuppliers = shallowRef<FacetOption[]>([])
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

  const { remember: rememberHotel } = useHotelLabels()

  const merge = (incoming: Tour[]) => {
    for (const tour of incoming) {
      const key = tour.get('hotelKey')

      if (key && filters.value.hotels.includes(key)) rememberHotel(key, tour.displayName())
    }

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
      rawFacets.value = result.facets ?? EMPTY_FACETS
      rememberSuppliers()
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

  const rememberSuppliers = () => {
    if (!filters.value.suppliers.length) knownSuppliers.value = rawFacets.value.suppliers ?? []
  }

  const facets = computed<SearchFacets>(() => ({
    ...rawFacets.value,
    suppliers: mergeSupplierOptions(knownSuppliers.value, rawFacets.value.suppliers ?? [], filters.value.suppliers, statuses.value),
  }))

  const run = () => {
    stop?.()
    stop = null

    const mine = ++ticket
    const forDate = criteria.value.date

    offers.value = []
    if (scopeKey.value !== lastScope) {
      rawFacets.value = EMPTY_FACETS
      knownSuppliers.value = []
    }
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
          rawFacets.value = event.facets
          rememberSuppliers()
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

  const hotOnly = ref(false)

  const onDay = computed(() =>
    day.value ? sorted.value.filter(tour => tour.get('checkIn') === day.value) : sorted.value)

  const hotIds = computed(() => hotPicks(offers.value))

  const isHot = (tour: Tour): boolean => hotIds.value.has(tour.get('id'))

  const hotCount = computed(() => new Set(onDay.value.filter(isHot).map(tour => tour.groupKey())).size)

  const hotUseful = computed(() => hotCount.value > 0 && hotCount.value < new Set(onDay.value.map(tour => tour.groupKey())).size)

  const filtered = computed(() => (hotOnly.value ? onDay.value.filter(isHot) : onDay.value))

  watch(hotCount, (count) => { if (!count) hotOnly.value = false })

  watch(hotOnly, () => { shown.value = RESULTS_PAGE_SIZE })

  const visible = computed(() => (isStaff.value ? filtered.value : cheapestPackages(filtered.value)))

  const twins = computed(() => (isStaff.value ? twinsOf(filtered.value) : new Map<string, Tour[]>()))

  const groups = computed(() => groupByHotel(visible.value))

  const hotels = computed(() => groups.value.slice(0, shown.value))

  const tours = computed(() => hotels.value.map(group => group.lead))

  const remaining = computed(() => groups.value.length - hotels.value.length)

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

  const total = computed(() => visible.value.length)

  return {
    criteria, filters, sort, day, hotOnly, hotCount, hotUseful, isHot,
    tours, hotels, twins, facets, total, statuses, progress, settling, busy,
    streaming, finished, failed, waitingForFirst,
    isSearchable, remaining,
    hasMore: moreAvailable, canLoadMore, loadingMore, loadMoreError, loadMore, refresh: run,
  }
}
