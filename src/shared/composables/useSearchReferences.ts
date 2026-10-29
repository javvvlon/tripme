import { useReferencesRepository } from '~/search_engine/repositories/references.repository'
import type { IReferenceItem, IRouteConstraints } from '~/search_engine/contracts/references'
import { isProductMode } from '~/search_engine/contracts/search'
import type { SearchMode } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export function useSearchReferences(from: Ref<string>, to: Ref<string>, mode?: Ref<SearchMode>) {
  const { fetchConstraints, fetchCountries } = useReferencesRepository()

  const { departures, unavailable } = useDepartures()

  const product = computed(() => (isProductMode(mode?.value) ? mode.value : undefined))

  const { data: countries } = useAsyncData(
    () => (product.value ? `references-countries-${product.value}` : `references-countries-${from.value}`),
    () => fetchCountries(from.value, product.value).catch(() => {
      unavailable.value = true
      return { items: [], from: null }
    }),
    { watch: [from, product], default: () => ({ items: [], from: null }) },
  )

  const { data: constraints } = useAsyncData<IRouteConstraints | null>(
    () => (product.value ? `references-constraints-${product.value}-${to.value}` : `references-constraints-${from.value}-${to.value}`),
    () => fetchConstraints(from.value, to.value, product.value).catch(() => null),
    { watch: [from, to, product], default: () => null },
  )

  const departureOptions = computed(() =>
    (departures.value ?? []).map(item => ({ value: item.slug, label: item.label })))

  const countryOptions = computed(() =>
    (countries.value?.items ?? []).map(item => ({ value: item.slug, label: item.label })))

  const nightsOptions = computed(() =>
    constraints.value?.nights?.length
      ? constraints.value.nights
      : [3, 5, 7, 8, 10, 12, 14])

  const maxAdults = computed(() => constraints.value?.maxAdults ?? 4)
  const calendar = computed(() => constraints.value?.calendar ?? null)

  return {
    unavailable,
    departureOptions,
    countryOptions,
    nightsOptions,
    maxAdults,
    calendar,
  }
}
