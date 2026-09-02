import { useReferencesRepository } from '~/search_engine/repositories/references.repository'
import type { IReferenceItem, IRouteConstraints } from '~/search_engine/contracts/references'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export function useSearchReferences(from: Ref<string>, to: Ref<string>) {
  const { fetchConstraints, fetchCountries } = useReferencesRepository()

  const { departures, unavailable } = useDepartures()

  /**
   * The key carries the route. Without it the empty-handed answer fetched on
   * the home page was reused on the search page, and the destination field
   * had no option to show its own value against.
   */
  const { data: countries } = useAsyncData(
    () => `references-countries-${from.value}`,
    () => fetchCountries(from.value).catch(() => {
      unavailable.value = true
      return { items: [], from: null }
    }),
    { watch: [from], default: () => ({ items: [], from: null }) },
  )

  const { data: constraints } = useAsyncData<IRouteConstraints | null>(
    () => `references-constraints-${from.value}-${to.value}`,
    () => fetchConstraints(from.value, to.value).catch(() => null),
    { watch: [from, to], default: () => null },
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
