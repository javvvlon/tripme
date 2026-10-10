import type { FacetOption, SearchFilters } from '~/search_engine/contracts/search'
import type { IFilterPanelProps } from './FilterPanel.d'
import { mealText } from '~/shared/helpers/meal'
import { EMPTY_FILTERS, FILTER_GROUPS, PRICE_DEBOUNCE_MS } from './FilterPanel.config'

type ListField = 'meals' | 'resorts' | 'suppliers' | 'hotels'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const mealLabel = (t: (key: string) => string, option: { value: string, label: string }): string =>
  mealText(t, option.value, option.label)

export const useFilterPanel = (props: IFilterPanelProps, filters: Ref<SearchFilters>) => {
  const { t } = useI18n()

  const groups = computed(() => {
    const chosen = props.groups ? FILTER_GROUPS.filter(group => props.groups!.includes(group.key)) : FILTER_GROUPS

    return chosen.filter((group) => {
      if ('agentOnly' in group && group.agentOnly && !props.agentView) return false
      if (group.key === 'hotels') return Boolean(props.from && props.to)
      if (group.key === 'suppliers') return (props.facets.suppliers?.length ?? 0) > 1
      if (group.key === 'stars') return (props.facets.stars?.length ?? 0) > 0
      if (group.key === 'meals') return (props.facets.meals?.length ?? 0) > 0
      if (group.key === 'districts') return (props.facets.districts?.length ?? 0) > 0
      if (group.key === 'price') return props.facets.priceMin !== null && props.facets.priceMax !== null

      return true
    })
  })

  const patch = (change: Partial<SearchFilters>) => {
    filters.value = { ...filters.value, ...change }
  }

  function toggle(field: ListField, value: string) {
    const current = filters.value[field]

    patch({ [field]: current.includes(value) ? current.filter(entry => entry !== value) : [...current, value] })
  }

  function toggleStar(value: number) {
    const { stars } = filters.value

    patch({ stars: stars.includes(value) ? stars.filter(entry => entry !== value) : [...stars, value] })
  }

  const stars = computed(() => [...(props.facets.stars ?? [])]
    .sort((a, b) => Number(a.value) - Number(b.value))
    .map(option => ({ value: Number(option.value), count: option.count })))

  const meals = computed(() => (props.facets.meals ?? []).map((option: FacetOption) => ({ ...option, label: mealLabel(t, option) })))

  const districts = computed(() => props.facets.districts ?? [])
  const suppliers = computed(() => props.facets.suppliers ?? [])

  const localMin = ref(filters.value.priceMin)
  const localMax = ref(filters.value.priceMax)

  watch(filters, (value) => {
    localMin.value = value.priceMin
    localMax.value = value.priceMax
  })

  const commitPrice = debounce((min: number | undefined, max: number | undefined) => patch({ priceMin: min, priceMax: max }), PRICE_DEBOUNCE_MS)

  onBeforeUnmount(() => commitPrice.cancel())

  const priceMin = computed({
    get: () => localMin.value,
    set: (value: number | undefined) => {
      localMin.value = value
      commitPrice(value, localMax.value)
    },
  })

  const priceMax = computed({
    get: () => localMax.value,
    set: (value: number | undefined) => {
      localMax.value = value
      commitPrice(localMin.value, value)
    },
  })

  const activeCount = computed(() => {
    const value = filters.value

    return value.stars.length + value.meals.length + value.resorts.length + value.hotels.length + value.suppliers.length
      + (value.priceMin !== undefined || value.priceMax !== undefined ? 1 : 0)
  })

  const reset = () => { filters.value = { ...EMPTY_FILTERS, stars: [], meals: [], resorts: [], hotels: [], suppliers: [] } }

  return {
    groups, stars, meals, districts, suppliers, priceMin, priceMax, activeCount,
    toggle, toggleStar, reset,
  }
}
