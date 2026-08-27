import { SearchMode } from '~/search_engine/contracts/search'
import type { SearchCriteria } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SEARCH_DEFAULTS: SearchCriteria = {
  mode: SearchMode.Tours,
  from: '',
  to: '',
  date: '',
  nights: 7,
  adults: 2,
  kids: 0,
}

function readString(value: unknown, fallback = ''): string {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' && v.length ? v : fallback
}

function readInt(value: unknown, fallback: number): number {
  const v = Number(Array.isArray(value) ? value[0] : value)
  return Number.isFinite(v) ? v : fallback
}

export function readCriteria(
  query: Record<string, unknown>,
  seed: Partial<SearchCriteria> = {},
): SearchCriteria {
  return {
    ...SEARCH_DEFAULTS,
    ...seed,
    mode: readString(query.mode, seed.mode ?? SEARCH_DEFAULTS.mode) as SearchMode,
    from: readString(query.from, seed.from ?? ''),
    to: readString(query.to, seed.to ?? ''),
    date: readString(query.date, seed.date ?? ''),
    nights: readInt(query.nights, seed.nights ?? SEARCH_DEFAULTS.nights),
    adults: readInt(query.adults, seed.adults ?? SEARCH_DEFAULTS.adults),
    kids: readInt(query.kids, seed.kids ?? SEARCH_DEFAULTS.kids),
  }
}

export function useAppliedCriteria(): ComputedRef<SearchCriteria> {
  const route = useRoute()

  return computed(() => readCriteria(route.query))
}

export function useSearchCriteria(seed: Partial<SearchCriteria> = {}) {
  const route = useRoute()
  const localePath = useLocalePath()
  const { t } = useI18n()

  const criteria = reactive<SearchCriteria>(readCriteria(route.query, seed))

  watch(
    () => route.query,
    query => Object.assign(criteria, readCriteria(query, seed)),
  )

  const query = computed<Record<string, string>>(() => {
    const q: Record<string, string> = {}
    if (criteria.mode !== SEARCH_DEFAULTS.mode) q.mode = criteria.mode
    if (criteria.from) q.from = criteria.from
    if (criteria.to) q.to = criteria.to
    if (criteria.date) q.date = criteria.date
    if (criteria.nights !== SEARCH_DEFAULTS.nights) q.nights = String(criteria.nights)
    if (criteria.adults !== SEARCH_DEFAULTS.adults) q.adults = String(criteria.adults)
    if (criteria.kids) q.kids = String(criteria.kids)
    return q
  })

  const target = computed(() => ({ path: localePath('/search'), query: query.value }))

  const submit = () => navigateTo(target.value)

  const reset = <K extends keyof SearchCriteria>(field: K) => {
    Object.assign(criteria, { [field]: SEARCH_DEFAULTS[field] })
  }

  const travellersLabel = computed(() => {
    const parts = [t('search.adults', criteria.adults)]
    if (criteria.kids) parts.push(t('search.kids', criteria.kids))
    return parts.join(', ')
  })

  const nightsLabel = computed(() => t('search.nights', criteria.nights))

  return { criteria, query, target, submit, reset, travellersLabel, nightsLabel }
}
